import {
  mkdir,
  readFile as fsReadFile,
  readdir,
  rm,
  stat,
  writeFile as fsWriteFile,
} from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { Transform, type TransformCallback } from "node:stream";
import { pipeline } from "node:stream/promises";
import { config } from "./config.js";
import { getTree, deleteEntry, verifyPathSafe, writeFile } from "./file-manager.js";

/* ----------------------------- types ----------------------------- */

export type SnapshotTrigger = "manual" | "pre-agent" | "pre-restore" | "post-agent";

export interface FileEntry {
  hash: string;
  size: number;
  encoding: "utf-8" | "binary";
  skipped?: boolean;
}

export interface SnapshotManifest {
  id: string;
  projectId: string;
  label: string;
  trigger: SnapshotTrigger;
  sessionId?: string;
  createdAt: string;
  files: Record<string, FileEntry>;
  totalFiles: number;
  totalSize: number;
}

export interface SnapshotMeta {
  id: string;
  projectId: string;
  label: string;
  createdAt: string;
  trigger: SnapshotTrigger;
  sessionId?: string;
  totalFiles: number;
  totalSize: number;
}

export interface StorageInfo {
  totalSnapshots: number;
  totalSizeBytes: number;
}

export interface SnapshotDeltaEntry {
  path: string;
  status: "added" | "modified" | "deleted";
  snapshotSize: number;
  currentSize: number;
}

export interface SnapshotDelta {
  snapshotId: string;
  snapshotLabel: string;
  entries: SnapshotDeltaEntry[];
  summary: { added: number; modified: number; deleted: number };
}

export interface SessionDelta {
  targetId: string;
  entries: SnapshotDeltaEntry[];
  summary: { added: number; modified: number; deleted: number };
}

/* ----------------------------- limits ----------------------------- */

const MAX_SNAPSHOT_BYTES = 500 * 1024 * 1024;
const MAX_SNAPSHOTS_PER_PROJECT = 200;
const SKIP_FILE_BYTES = 50 * 1024 * 1024;

const SNAPSHOT_SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "__pycache__",
  ".next",
  ".nuxt",
  "coverage",
  ".vite",
  ".turbo",
  ".cache",
  ".huiyu-pi",
  ".pi",
]);

/* ----------------------------- helpers ----------------------------- */

function snapshotsDir(): string {
  return join(config.forgeDataDir, "snapshots");
}

function snapshotDir(snapshotId: string): string {
  return join(snapshotsDir(), snapshotId);
}

function manifestPath(snapshotId: string): string {
  return join(snapshotDir(snapshotId), "manifest.json");
}

function filesDir(snapshotId: string): string {
  return join(snapshotDir(snapshotId), "files");
}

function toMeta(manifest: SnapshotManifest): SnapshotMeta {
  const meta: SnapshotMeta = {
    id: manifest.id,
    projectId: manifest.projectId,
    label: manifest.label,
    createdAt: manifest.createdAt,
    trigger: manifest.trigger,
    totalFiles: manifest.totalFiles,
    totalSize: manifest.totalSize,
  };
  if (manifest.sessionId !== undefined) meta.sessionId = manifest.sessionId;
  return meta;
}

/**
 * Transform stream that computes SHA-256 hash of all data flowing through it.
 * Use in a pipeline(src, hashStream, dest) to copy-and-hash in one pass.
 */
class HashStream extends Transform {
  private hasher = createHash("sha256");
  override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.hasher.update(chunk);
    callback(null, chunk);
  }
  override _flush(callback: TransformCallback): void {
    callback();
  }
  digest(): string {
    return this.hasher.digest("hex").slice(0, 12);
  }
}

/**
 * Process items with a concurrency-limited pool. Runs at most `limit` async
 * tasks simultaneously. Results preserve input order.
 */
async function concurrentMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  limit: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIdx = 0;

  const worker = async (): Promise<void> => {
    while (nextIdx < items.length) {
      const idx = nextIdx;
      nextIdx += 1;
      results[idx] = await fn(items[idx]!, idx);
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function computeHash(filePath: string): Promise<string> {
  const hasher = createHash("sha256");
  const stream = createReadStream(filePath);
  for await (const chunk of stream) {
    hasher.update(chunk as Buffer);
  }
  return hasher.digest("hex").slice(0, 12);
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

function flattenTree(node: TreeNode, prefix = ""): TreeNode[] {
  const relPath = prefix === "" ? node.name : `${prefix}/${node.name}`;
  if (node.type === "file") return [{ ...node, path: relPath }];
  const children = node.children ?? [];
  const out: TreeNode[] = [];
  for (const child of children) {
    out.push(...flattenTree(child, relPath));
  }
  return out;
}

function _shouldSkipDir(name: string): boolean {
  return SNAPSHOT_SKIP_DIRS.has(name);
}

async function readManifest(snapshotId: string): Promise<SnapshotManifest> {
  const raw = await fsReadFile(manifestPath(snapshotId), "utf8");
  return JSON.parse(raw) as SnapshotManifest;
}

async function writeManifest(manifest: SnapshotManifest): Promise<void> {
  const dir = snapshotDir(manifest.id);
  await mkdir(dir, { recursive: true });
  await fsWriteFile(manifestPath(manifest.id), JSON.stringify(manifest, null, 2), "utf8");
}

/* ----------------------------- errors ----------------------------- */

export class SnapshotTooLargeError extends Error {
  readonly size: number;
  readonly limit: number;
  constructor(size: number, limit: number) {
    super(`snapshot too large: ${size} > ${limit}`);
    this.name = "SnapshotTooLargeError";
    this.size = size;
    this.limit = limit;
  }
}

export class SnapshotLimitError extends Error {
  readonly count: number;
  readonly limit: number;
  constructor(count: number, limit: number) {
    super(`snapshot limit reached: ${count} >= ${limit}`);
    this.name = "SnapshotLimitError";
    this.count = count;
    this.limit = limit;
  }
}

export class SnapshotNotFoundError extends Error {
  constructor(id: string) {
    super(`snapshot not found: ${id}`);
    this.name = "SnapshotNotFoundError";
  }
}

export class ConfirmPathMismatchError extends Error {
  constructor() {
    super("confirmProjectPath does not match project path");
    this.name = "ConfirmPathMismatchError";
  }
}

export class PathTraversalError extends Error {
  constructor(path: string) {
    super(`path traversal detected in snapshot manifest: ${path}`);
    this.name = "PathTraversalError";
  }
}

/* ----------------------------- core operations ----------------------------- */

export async function createSnapshot(
  projectId: string,
  projectPath: string,
  label: string,
  trigger: SnapshotTrigger = "manual",
  sessionId?: string,
): Promise<{ snapshot: SnapshotMeta; warnings: string[] }> {
  const existing = await listSnapshots(projectId);
  if (existing.length >= MAX_SNAPSHOTS_PER_PROJECT) {
    // Clean up oldest pre-agent and pre-restore snapshots, keeping 5 newest of each
    const cleanable = existing
      .filter(
        (s) =>
          s.trigger === "pre-agent" || s.trigger === "pre-restore" || s.trigger === "post-agent",
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (cleanable.length > 10) {
      const toRemove = cleanable.slice(0, cleanable.length - 10);
      for (const s of toRemove) {
        try {
          await deleteSnapshot(projectId, s.id);
        } catch {
          /* best-effort */
        }
      }
    } else {
      throw new SnapshotLimitError(existing.length, MAX_SNAPSHOTS_PER_PROJECT);
    }
  }

  const tree = await getTree(projectPath, { maxDepth: Infinity });
  const snapshotId = randomUUID();
  const _sDir = snapshotDir(snapshotId);
  const fDir = filesDir(snapshotId);
  await mkdir(fDir, { recursive: true });

  const manifest: SnapshotManifest = {
    id: snapshotId,
    projectId,
    label,
    createdAt: new Date().toISOString(),
    trigger,
    files: {},
    totalFiles: 0,
    totalSize: 0,
  };
  if (sessionId !== undefined) manifest.sessionId = sessionId;

  const warnings: string[] = [];
  const allFiles = flattenTree(tree).filter((f) => f.type === "file");

  // Phase 1: stat all files in parallel, collect metadata
  interface FileMeta {
    relPath: string;
    absPath: string;
    size: number;
  }
  const fileMetas: FileMeta[] = [];
  for (const file of allFiles) {
    const relPath = file.path;
    const absPath = resolve(projectPath, relPath);
    let fileStat;
    try {
      fileStat = await stat(absPath);
    } catch {
      warnings.push(`跳过: ${relPath} (无法读取)`);
      continue;
    }
    if (fileStat.size > SKIP_FILE_BYTES) {
      manifest.files[relPath] = {
        hash: "",
        size: fileStat.size,
        encoding: "binary",
        skipped: true,
      };
      warnings.push(`跳过大文件: ${relPath} (${(fileStat.size / 1024 / 1024).toFixed(1)}MB)`);
      continue;
    }
    fileMetas.push({ relPath, absPath, size: fileStat.size });
  }

  // Check total size budget — mark files beyond the limit as skipped
  const COPY_LIMIT = MAX_SNAPSHOT_BYTES;
  let accruedSize = 0;
  const toCopy: FileMeta[] = [];
  for (const meta of fileMetas) {
    if (accruedSize + meta.size > COPY_LIMIT) {
      warnings.push(`跳过: ${meta.relPath} (超出快照大小上限)`);
      continue;
    }
    accruedSize += meta.size;
    toCopy.push(meta);
  }

  // Phase 2: copy + hash files in parallel with concurrency limit
  const COPY_CONCURRENCY = 8;
  type CopyResult =
    | { relPath: string; size: number; hash: string }
    | { relPath: string; error: string };
  const copyResults = await concurrentMap(
    toCopy,
    async (meta): Promise<CopyResult> => {
      const { relPath, absPath, size } = meta;
      try {
        const destDirPath = join(fDir, dirname(relPath));
        await mkdir(destDirPath, { recursive: true });
        const destPath = join(fDir, relPath);

        // Copy + hash in one pass through the file
        const srcStream = createReadStream(absPath);
        const destStream = createWriteStream(destPath);
        const hashStream = new HashStream();
        await pipeline(srcStream, hashStream, destStream);
        const hash = hashStream.digest();

        return { relPath, size, hash };
      } catch (err) {
        return { relPath, error: (err as Error).message };
      }
    },
    COPY_CONCURRENCY,
  );

  // Accumulate results
  let totalSize = 0;
  for (const r of copyResults) {
    if ("error" in r) {
      warnings.push(`跳过: ${r.relPath} (${r.error})`);
      continue;
    }
    manifest.files[r.relPath] = { hash: r.hash, size: r.size, encoding: "utf-8" };
    totalSize += r.size;
  }

  manifest.totalFiles = Object.keys(manifest.files).length;
  manifest.totalSize = totalSize;

  await writeManifest(manifest);

  return { snapshot: toMeta(manifest), warnings };
}

export async function listSnapshots(projectId: string): Promise<SnapshotMeta[]> {
  const base = snapshotsDir();
  let entries;
  try {
    entries = await readdir(base, { withFileTypes: true });
  } catch {
    return [];
  }

  const results: SnapshotMeta[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      const manifest = await readManifest(entry.name);
      if (manifest.projectId === projectId) {
        results.push(toMeta(manifest));
      }
    } catch {
      // corrupted snapshot, skip
    }
  }

  results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return results;
}

export async function getSnapshot(
  projectId: string,
  snapshotId: string,
): Promise<SnapshotManifest> {
  const manifest = await readManifest(snapshotId);
  if (manifest.projectId !== projectId) {
    throw new SnapshotNotFoundError(snapshotId);
  }
  return manifest;
}

export async function deleteSnapshot(projectId: string, snapshotId: string): Promise<string> {
  const manifest = await readManifest(snapshotId);
  if (manifest.projectId !== projectId) {
    throw new SnapshotNotFoundError(snapshotId);
  }
  await rm(snapshotDir(snapshotId), { recursive: true, force: true });
  return snapshotId;
}

export async function restoreSnapshot(
  projectId: string,
  projectPath: string,
  snapshotId: string,
  confirmProjectPath: string,
): Promise<{
  restored: SnapshotMeta;
  safetySnapshot: SnapshotMeta;
  warnings: string[];
}> {
  if (projectPath !== confirmProjectPath) {
    throw new ConfirmPathMismatchError();
  }

  const manifest = await readManifest(snapshotId);
  if (manifest.projectId !== projectId) {
    throw new SnapshotNotFoundError(snapshotId);
  }

  for (const relPath of Object.keys(manifest.files)) {
    if (relPath.includes("..")) {
      throw new PathTraversalError(relPath);
    }
  }

  const safetyResult = await createSnapshot(
    projectId,
    projectPath,
    "恢复前自动备份",
    "pre-restore",
  );

  const currentTree = await getTree(projectPath, { maxDepth: Infinity });
  const currentFiles = new Set(
    flattenTree(currentTree)
      .filter((n) => n.type === "file")
      .map((n) => n.path),
  );

  const manifestFiles = new Set(Object.keys(manifest.files));

  const warnings: string[] = [];

  for (const currentFile of currentFiles) {
    if (!manifestFiles.has(currentFile)) {
      const absPath = resolve(projectPath, currentFile);
      try {
        await deleteEntry(absPath, projectPath);
      } catch (err) {
        warnings.push(`无法删除: ${currentFile} (${(err as Error).message})`);
      }
    }
  }

  for (const [relPath, entry] of Object.entries(manifest.files)) {
    if (entry.skipped) {
      warnings.push(`跳过恢复: ${relPath} (大文件)`);
      continue;
    }
    if (relPath.includes("..")) {
      warnings.push(`安全拦截: ${relPath} (路径穿越)`);
      continue;
    }

    const srcPath = join(filesDir(snapshotId), relPath);
    const destPath = resolve(projectPath, relPath);

    try {
      await verifyPathSafe(destPath, projectPath);
    } catch {
      warnings.push(`安全拦截: ${relPath} (路径不在项目内)`);
      continue;
    }

    try {
      const content = await fsReadFile(srcPath);
      await writeFile(destPath, projectPath, content.toString("utf8"));
    } catch (err) {
      warnings.push(`恢复失败: ${relPath} (${(err as Error).message})`);
    }
  }

  return {
    restored: toMeta(manifest),
    safetySnapshot: safetyResult.snapshot,
    warnings,
  };
}

export async function getStorageInfo(projectId: string): Promise<StorageInfo> {
  const snapshots = await listSnapshots(projectId);
  let totalSizeBytes = 0;
  for (const snap of snapshots) {
    totalSizeBytes += snap.totalSize;
  }
  return {
    totalSnapshots: snapshots.length,
    totalSizeBytes,
  };
}

export async function computeDelta(
  projectId: string,
  snapshotId: string,
  currentTree: TreeNode,
): Promise<SnapshotDelta> {
  const manifest = await readManifest(snapshotId);
  if (manifest.projectId !== projectId) {
    throw new SnapshotNotFoundError(snapshotId);
  }

  const currentFiles = flattenTree(currentTree).filter((n) => n.type === "file");
  const currentByPath = new Map(currentFiles.map((f) => [f.path, f]));

  const entries: SnapshotDeltaEntry[] = [];

  for (const [snapPath, snapEntry] of Object.entries(manifest.files)) {
    const current = currentByPath.get(snapPath);
    if (current === undefined) {
      entries.push({
        path: snapPath,
        status: "added",
        snapshotSize: snapEntry.size,
        currentSize: 0,
      });
    } else {
      currentByPath.delete(snapPath);
      entries.push({
        path: snapPath,
        status: "modified",
        snapshotSize: snapEntry.size,
        currentSize: snapEntry.size,
      });
    }
  }

  for (const [path] of currentByPath) {
    entries.push({
      path,
      status: "deleted",
      snapshotSize: 0,
      currentSize: 0,
    });
  }

  entries.sort((a, b) => a.path.localeCompare(b.path));

  const summary = {
    added: entries.filter((e) => e.status === "added").length,
    modified: entries.filter((e) => e.status === "modified").length,
    deleted: entries.filter((e) => e.status === "deleted").length,
  };

  return {
    snapshotId: manifest.id,
    snapshotLabel: manifest.label,
    entries,
    summary,
  };
}

export async function computeSessionDelta(
  projectId: string,
  targetSnapshotId: string,
  currentTree: TreeNode,
  projectPath?: string,
): Promise<SessionDelta> {
  const targetManifest = await readManifest(targetSnapshotId);
  const targetSessionId = targetManifest.sessionId;

  // Find the snapshot immediately before target in the same session.
  const sessionSnaps = await listSnapshots(projectId);
  const sorted = sessionSnaps
    .filter((s) => s.sessionId === targetSessionId && s.trigger === "pre-agent")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const targetIdx = sorted.findIndex((s) => s.id === targetSnapshotId);

  // No previous snapshot in this session — nothing to show.
  if (targetIdx <= 0) {
    return {
      targetId: targetSnapshotId,
      entries: [],
      summary: { added: 0, modified: 0, deleted: 0 },
    };
  }

  const prevManifest = await readManifest(sorted[targetIdx - 1]!.id);

  const currentFiles = flattenTree(currentTree).filter((n) => n.type === "file");
  const currentByPath = new Map(currentFiles.map((f) => [f.path, f]));
  const currentSet = new Set(currentFiles.map((f) => f.path));

  // Step 1: find files that changed between prev and target (this session's changes)
  const sessionChanged = new Set<string>();
  const prevFiles = Object.keys(prevManifest.files);
  const tgtFiles = Object.keys(targetManifest.files);
  const changedPaths = new Set([...prevFiles, ...tgtFiles]);
  for (const path of changedPaths) {
    const prevHash = prevManifest.files[path]?.hash;
    const tgtHash = targetManifest.files[path]?.hash;
    if (prevHash !== tgtHash) sessionChanged.add(path);
  }

  // Step 2: for each session-changed file, check if target differs from current disk
  const entries: SnapshotDeltaEntry[] = [];
  for (const path of sessionChanged) {
    const inTarget = path in targetManifest.files;
    const inCurrent = currentSet.has(path);

    if (!inTarget && inCurrent) {
      entries.push({ path, status: "deleted", snapshotSize: 0, currentSize: 0 });
      continue;
    }
    if (inTarget && !inCurrent) {
      const te = targetManifest.files[path];
      entries.push({ path, status: "added", snapshotSize: te?.size ?? 0, currentSize: 0 });
      continue;
    }

    const targetHash = targetManifest.files[path]?.hash ?? "";
    const liveFile = currentByPath.get(path);
    const liveHash =
      liveFile !== undefined && projectPath !== undefined
        ? await computeHash(resolve(projectPath, path)).catch(() => "")
        : "";

    if (targetHash !== liveHash && targetHash !== "") {
      entries.push({
        path,
        status: "modified",
        snapshotSize: targetManifest.files[path]?.size ?? 0,
        currentSize: targetManifest.files[path]?.size ?? 0,
      });
    }
  }

  entries.sort((a, b) => a.path.localeCompare(b.path));
  const summary = {
    added: entries.filter((e) => e.status === "added").length,
    modified: entries.filter((e) => e.status === "modified").length,
    deleted: entries.filter((e) => e.status === "deleted").length,
  };

  return { targetId: targetSnapshotId, entries, summary };
}

export async function restoreSessionDelta(
  projectId: string,
  projectPath: string,
  targetSnapshotId: string,
  confirmProjectPath: string,
): Promise<{
  restored: SessionDelta;
  safetySnapshot: SnapshotMeta;
  warnings: string[];
}> {
  if (projectPath !== confirmProjectPath) {
    throw new ConfirmPathMismatchError();
  }

  const safetyResult = await createSnapshot(
    projectId,
    projectPath,
    "restore pre-backup",
    "pre-restore",
  );

  const currentTree = await getTree(projectPath, { maxDepth: Infinity });
  const delta = await computeSessionDelta(projectId, targetSnapshotId, currentTree, projectPath);

  const targetManifest = await readManifest(targetSnapshotId);
  const warnings: string[] = [];

  for (const entry of delta.entries) {
    if (entry.path.includes("..")) {
      warnings.push(`skipped: ${entry.path} (path traversal)`);
      continue;
    }

    const destPath = resolve(projectPath, entry.path);

    try {
      await verifyPathSafe(destPath, projectPath);
    } catch {
      warnings.push(`blocked: ${entry.path} (outside project)`);
      continue;
    }

    if (entry.status === "deleted") {
      try {
        await deleteEntry(destPath, projectPath);
      } catch (err) {
        warnings.push(`failed to delete: ${entry.path} (${(err as Error).message})`);
      }
      continue;
    }

    const fileEntry = targetManifest.files[entry.path];
    if (fileEntry === undefined || fileEntry.skipped) {
      warnings.push(`skipped: ${entry.path} (not in snapshot or too large)`);
      continue;
    }

    const srcPath = join(filesDir(targetSnapshotId), entry.path);
    try {
      const content = await fsReadFile(srcPath);
      await writeFile(destPath, projectPath, content.toString("utf8"));
    } catch (err) {
      warnings.push(`failed to restore: ${entry.path} (${(err as Error).message})`);
    }
  }

  return { restored: delta, safetySnapshot: safetyResult.snapshot, warnings };
}
