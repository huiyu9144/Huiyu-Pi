# Huiyu Pi 项目快照系统设计方案

> 版本：v2.0 | 日期：2026-05-31 | 作者：Huiyu Team

---

## 1. 背景与动机

AI 编程助手在修改代码时可能产生意料之外的结果——文件被误删、代码被错误重构、配置被覆盖。用户需要一个**低成本的回退机制**，在 AI 操作前后快速保存和恢复项目状态。

当前痛点：
- AI 修改多个文件后，用户无法一键回退到修改前的状态
- `git` 可以回退，但并非所有项目都在 git 管理下，且 AI 可能修改 `.gitignore` 之外的文件
- 手动备份费时费力，用户往往在出问题后才意识到需要备份

**核心目标**：让用户在 AI 执行高风险操作前，一键保存项目快照，出问题时一键恢复。

---

## 2. 竞品分析：TRAE SOLO CN 的恢复机制

通过逆向分析 TRAE SOLO CN（`C:\Users\Administrator\AppData\Local\Programs\TRAE SOLO CN`），发现其恢复机制基于**两层架构**：

### 2.1 第一层：编辑器级 Diff + Undo/Redo（实时，轻量）

TRAE 的核心恢复机制是 **`IcubeFilesDiffState`**——一个内存中的 diff 跟踪系统：

```
AI 修改文件
  → addFileDiffData(filePath, oldContent, newContent)
  → 计算行级 diff blocks（insert/delete/modify）
  → 存储在内存 Map<filePath, FileDiffState> 中
  → UI 渲染 diff 标记（绿色插入 / 红色删除）

用户操作：
  → acceptFile()  — 接受 AI 修改，清除 diff 标记
  → rejectFile()  — 拒绝 AI 修改，用 oldContent 覆盖（通过 chatUndoEdits）
  → acceptAll()   — 接受所有文件
  → rejectAll()   — 拒绝所有文件
```

关键设计：
- **编辑源标记**：`Yl.chatApplyEdits()` / `Yl.chatUndoEdits()` / `Yl.chatReset()` 标记编辑来源
- **undo/redo 栈集成**：AI 修改通过 `model.applyEdits(edits, Yl.chatApplyEdits(...))` 压入编辑器的 undo 栈
- **拒绝 = undo**：`rejectFile()` 本质是 `model.applyEdits(reverseEdits, Yl.chatUndoEdits())`
- **新建文件特殊处理**：如果 AI 新建的文件被拒绝，直接删除文件

**优点**：零存储开销、实时反馈、细粒度控制（逐 diff block 接受/拒绝）
**缺点**：仅限当前会话、编辑器关闭后丢失、无法跨会话恢复

### 2.2 第二层：本地文件历史（持久化，VS Code 内置）

TRAE 继承了 VS Code 的 **Local File History** 机制：

- 每次保存文件时，自动将文件内容快照到 `~/.config/TRAE SOLO CN/User/History/` 目录
- 用户可通过 Timeline 面板查看文件的历史版本
- 支持打开文件快照（只读）、与当前版本 diff 对比、还原到历史版本

NLS 翻译确认：
- `"打开文件快照"` → `openFileSnapshot`
- `"{0} (快照)"` → 快照标签页标题
- `"控制是否启用本地文件历史记录。启用后，所保存编辑器文件内容将存储到备份位置，以便稍后可以还原或查看内容。"`

### 2.3 对 Huiyu Pi 的启示

| TRAE 机制 | Huiyu Pi 适用性 | 建议 |
|-----------|----------------|------|
| 编辑器级 diff + undo/redo | ⚠️ 部分适用 | Huiyu Pi 是 Web 架构，没有 VS Code 的 TextModel undo 栈，但可借鉴"逐 diff block 接受/拒绝"的交互模式 |
| 本地文件历史 | ✅ 完全适用 | 这正是我们 Phase 1 要实现的——项目级快照存储 + 恢复 |
| 逐文件 accept/reject | ✅ 高价值 | Phase 3 可加入：恢复时支持选择性恢复（只恢复部分文件） |

---

## 3. 核心概念

```
快照 (Snapshot)
├── id: string (UUID)
├── projectId: string
├── label: string (用户可读名称，如 "修改前" / "重构前")
├── createdAt: string (ISO 8601)
├── trigger: "manual" | "pre-agent" | "pre-restore"
├── manifest: SnapshotManifest
│   ├── files: { [relativePath]: FileEntry }
│   │   ├── hash: string (SHA-256 前 12 位)
│   │   ├── size: number
│   │   └── encoding: "utf-8" | "binary"
│   ├── totalFiles: number
│   └── totalSize: number
└── storagePath: string (快照数据在磁盘上的位置)
```

---

## 4. 方案对比

### 方案 A：全文件拷贝（推荐 ✅ Phase 1）

**原理**：快照时将项目目录下所有文件复制到 `~/.huiyu-pi/snapshots/<id>/` 目录，恢复时直接覆盖回去。

| 维度 | 评估 |
|------|------|
| 实现复杂度 | **低** — 复用现有 `file-manager` 的 `readFile`/`writeFile`，无需 diff 算法 |
| 快照速度 | **快** — 纯文件拷贝，小项目 <100ms，中等项目 <1s |
| 恢复速度 | **快** — 直接覆盖，无 diff 计算 |
| 存储开销 | **高** — 每个快照独立存储全文件，10 个快照 = 10x 空间 |
| 可靠性 | **高** — 每个快照完全自包含，不依赖其他快照 |
| 适合场景 | MVP 阶段，项目规模中小（<50MB），快照数量有限 |

### 方案 B：增量 Diff 存储（Phase 2 优化方向）

**原理**：首个快照存全文件，后续快照只存与前一版本的 diff（类似 git 的 packfile）。

| 维度 | 评估 |
|------|------|
| 实现复杂度 | **高** — 需要 diff/patch 算法、链式依赖管理、损坏恢复 |
| 快照速度 | **中** — 需要计算 diff |
| 恢复速度 | **慢** — 需要从基础快照逐步 apply diff |
| 存储开销 | **低** — 只存变化部分 |
| 可靠性 | **中** — diff 链中任一环节损坏会导致后续快照不可用 |
| 适合场景 | 大型项目、频繁快照、长期保留大量快照 |

**Phase 2 优化思路**：借鉴 TRAE 的行级 diff 思路，但持久化到磁盘。相同 hash 的文件只存一份（内容寻址存储），manifest 中引用 hash。

### 方案 C：Git-based 快照

**原理**：在项目内自动创建 git commit 作为快照点，恢复时 `git checkout` / `git reset`。

| 维度 | 评估 |
|------|------|
| 实现复杂度 | **中** — 依赖 git CLI，需处理未初始化 git 的项目 |
| 快照速度 | **快** — git add + commit |
| 恢复速度 | **快** — git checkout |
| 存储开销 | **低** — git 内部已有 delta 压缩 |
| 可靠性 | **低** — 与用户 git 操作冲突，可能污染 git 历史；非 git 项目不可用 |
| 适合场景 | 已在 git 管理下的项目，但与用户工作流冲突风险大 |

### 决策

**Phase 1 采用方案 A（全文件拷贝）**，理由：
1. 实现最简单，最快交付 MVP
2. 完全自包含，不依赖 git，不污染用户仓库
3. 可靠性最高，任一快照损坏不影响其他快照
4. 存储开销问题在 Phase 2 通过内容寻址优化解决

---

## 5. 存储设计

### 5.1 目录结构

```
~/.huiyu-pi/
├── snapshots/
│   ├── <snapshot-id>/
│   │   ├── manifest.json          # 快照元数据 + 文件清单
│   │   └── files/                 # 项目文件的完整拷贝
│   │       ├── src/
│   │       │   ├── index.ts
│   │       │   └── App.tsx
│   │       ├── package.json
│   │       └── ...
│   └── ...
├── projects.json
└── workspace/
```

### 5.2 manifest.json 结构

```json
{
  "id": "019e77ea-2467-7c73-9414-1d3d4627a70d",
  "projectId": "e2440d65-1716-49c9-bfbc-594f75cef63e",
  "label": "重构前",
  "createdAt": "2026-05-31T10:00:00.000Z",
  "trigger": "manual",
  "files": {
    "src/index.ts": {
      "hash": "a1b2c3d4e5f6",
      "size": 1234,
      "encoding": "utf-8"
    },
    "package.json": {
      "hash": "f6e5d4c3b2a1",
      "size": 567,
      "encoding": "utf-8"
    }
  },
  "totalFiles": 2,
  "totalSize": 1801
}
```

### 5.3 文件过滤规则

快照时跳过以下目录/文件（与 `file-manager.ts` 的 `TREE_SKIP_DIRS` 保持一致）：

```
node_modules, .git, dist, .next, .turbo, __pycache__,
.huiyu-pi, .pi, .DS_Store, Thumbs.db
```

额外跳过：
- 二进制文件 > 10MB（记录在 manifest 中标记为 `skipped: true`，恢复时不覆盖）
- 符号链接（记录但不跟随）

---

## 6. API 设计

### 6.1 创建快照

```
POST /api/v1/projects/:projectId/snapshots
Body: { label?: string, trigger?: "manual" | "pre-agent" }
Response: { snapshot: SnapshotMeta, warnings: string[] }
```

流程：
1. 验证 projectId 存在
2. 检查快照数量是否超限（20 个/项目）
3. 扫描项目目录（复用 `file-manager.getTree`）
4. 创建快照目录 `~/.huiyu-pi/snapshots/<id>/files/`
5. 逐文件拷贝，计算 hash，跳过超大/二进制文件
6. 写入 `manifest.json`
7. 返回快照元数据 + 警告列表

### 6.2 列出快照

```
GET /api/v1/projects/:projectId/snapshots
Response: { snapshots: SnapshotMeta[] }
```

按 `createdAt` 降序排列，每个快照只返回元数据（不含文件清单）。

### 6.3 获取快照详情

```
GET /api/v1/projects/:projectId/snapshots/:snapshotId
Response: { snapshot: SnapshotDetail }
```

包含完整文件清单。

### 6.4 恢复快照

```
POST /api/v1/projects/:projectId/snapshots/:snapshotId/restore
Body: { confirmProjectPath: string }
Response: { restored: SnapshotMeta, safetySnapshot: SnapshotMeta, warnings: string[] }
```

流程：
1. 验证快照存在
2. 验证 `confirmProjectPath` 与当前项目路径一致（防止误操作）
3. **先为当前状态自动创建一个快照**（安全网：恢复前自动保存当前状态，trigger = "pre-restore"）
4. 删除项目目录中不在快照 manifest 里的文件（AI 新增的文件）
5. 用快照文件覆盖项目目录中的对应文件
6. 跳过 manifest 中标记为 `skipped` 的文件
7. 返回恢复结果 + 安全网快照信息 + 警告列表

### 6.5 删除快照

```
DELETE /api/v1/projects/:projectId/snapshots/:snapshotId
Response: { deleted: string }
```

删除快照目录及其所有文件。

### 6.6 快照大小统计

```
GET /api/v1/projects/:projectId/snapshots/storage
Response: { totalSnapshots: number, totalSizeBytes: number }
```

---

## 7. 前端 UI 设计

### 7.1 入口位置

在 `FileBrowserPanel` 的工具栏中添加一个 **快照按钮**（Camera 图标），与现有的 Refresh/New File/New Folder 按钮并列。

### 7.2 快照列表（Hover 弹出）

点击快照按钮后，在按钮下方弹出一个下拉面板：

```
┌─────────────────────────────────────┐
│ 📸 项目快照                    [创建] │
├─────────────────────────────────────┤
│ ● 重构前    2026-05-31 10:00  2.3MB │
│   [恢复] [删除]                      │
│ ● 修改前    2026-05-30 15:30  2.1MB │
│   [恢复] [删除]                      │
│ ● 初始状态  2026-05-29 09:00  1.8MB │
│   [恢复] [删除]                      │
├─────────────────────────────────────┤
│ 总计: 3 个快照, 6.2MB               │
└─────────────────────────────────────┘
```

### 7.3 创建快照弹窗

点击「创建」按钮后弹出 `PromptDialog`（复用现有 Modal 组件）：

```
┌──────────────────────────────┐
│ 创建项目快照                   │
│                              │
│ 快照名称: [重构前___________] │
│                              │
│ 将保存项目当前所有文件状态       │
│                              │
│        [取消]  [创建快照]      │
└──────────────────────────────┘
```

### 7.4 恢复确认弹窗

点击「恢复」按钮后弹出 `ConfirmDialog`（复用现有 Modal 组件）：

```
┌──────────────────────────────────────┐
│ ⚠️ 确认恢复快照                       │
│                                      │
│ 将项目恢复到 "重构前" 的状态           │
│ (2026-05-31 10:00, 42 个文件)        │
│                                      │
│ 当前状态将自动保存为新快照 "恢复前备份" │
│                                      │
│          [取消]  [确认恢复]            │
└──────────────────────────────────────┘
```

### 7.5 删除确认弹窗

点击「删除」按钮后弹出 `ConfirmDialog`：

```
┌──────────────────────────────────────┐
│ 确认删除快照                          │
│                                      │
│ 删除快照 "重构前" (2.3MB)？           │
│ 此操作不可撤销。                       │
│                                      │
│          [取消]  [确认删除]            │
└──────────────────────────────────────┘
```

---

## 8. 安全设计

### 8.1 路径安全

- 快照文件存储在 `~/.huiyu-pi/snapshots/` 下，不在项目目录内
- 恢复时复用 `file-manager.verifyPathSafe()` 确保写入路径在项目根目录内
- manifest 中的相对路径在恢复时通过 `path.resolve(projectPath, relPath)` 转为绝对路径，再经过安全校验
- **防路径穿越**：恢复时检查 manifest 中所有相对路径，拒绝包含 `..` 的路径

### 8.2 恢复安全

- 恢复前必须传入 `confirmProjectPath`，与 `project.path` 比对一致才允许执行
- 恢复前自动创建当前状态快照（安全网），即使恢复出错也能回退
- 恢复过程中遇到文件权限错误时跳过并记录 warning，不中断整个恢复流程

### 8.3 大小限制

- 单个快照最大 **200MB**（超过时返回 413 错误并提示用户清理）
- 快照总数上限 **20 个/项目**（超出时提示删除旧快照）
- 单个文件 > 10MB 时跳过，在 manifest 中标记 `skipped: true`

---

## 9. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 项目目录不存在 | 返回 404 |
| 快照 ID 不存在 | 返回 404 |
| 快照超过大小限制 | 返回 413 + 提示信息 |
| 快照数量超限 | 返回 409 + 提示删除旧快照 |
| 恢复时文件权限不足 | 跳过该文件，记录 warning |
| 恢复时磁盘空间不足 | 中断恢复，返回 507 + 已恢复的文件列表 |
| 创建快照时项目正在被修改 | 最佳努力：记录 warning，不阻塞 |
| manifest.json 损坏 | 返回 500，标记快照为 `corrupted: true` |
| manifest 中含 `..` 路径穿越 | 返回 400，拒绝恢复 |

---

## 10. 分阶段实施计划

### Phase 1 — MVP（本次实现）

**目标**：快照存储 + 恢复 API + 简单 UI

| 组件 | 内容 |
|------|------|
| 后端 | `snapshot-store.ts`（存储引擎）+ `routes/snapshots.ts`（6 个 API 端点） |
| 前端 | `snapshot-store.ts`（Zustand store）+ `SnapshotPanel.tsx`（下拉面板 + 弹窗） |
| 集成 | FileBrowserPanel 工具栏添加快照按钮 |

**不包含**：自动快照、diff 存储、快照浏览器、清理策略、选择性恢复

### Phase 2 — 存储优化

| 组件 | 内容 |
|------|------|
| 内容寻址存储 | 相同 hash 的文件只存一份（`~/.huiyu-pi/snapshots/objects/<hash>`），manifest 引用 hash |
| 清理策略 | 自动清理：按时间/数量/大小自动删除旧快照 |
| 快照压缩 | tar.gz 打包存储，减少磁盘占用 |

### Phase 3 — 高级功能

| 组件 | 内容 |
|------|------|
| 快照浏览器 | 侧边栏查看所有快照历史，支持文件级 diff 对比（借鉴 TRAE 的 diff 标记 UI） |
| 自动快照 | AI 执行 `writeFile`/`deleteEntry` 前自动创建快照 |
| 选择性恢复 | 恢复时支持勾选部分文件（借鉴 TRAE 的逐 diff block accept/reject 交互） |
| 快照标签 | 支持标签/颜色分类，快速筛选 |
| 跨项目快照 | 支持将快照导出为 tar.gz，在其他项目/实例中导入 |

---

## 11. 关键实现细节

### 11.1 快照创建流程（伪代码）

```typescript
async function createSnapshot(projectId: string, label: string, trigger: Trigger) {
  const project = getProject(projectId);
  const tree = await getTree(project.path, { maxDepth: Infinity });

  const snapshotId = randomUUID();
  const snapshotDir = join(config.forgeDataDir, "snapshots", snapshotId);
  const filesDir = join(snapshotDir, "files");

  await mkdir(filesDir, { recursive: true });

  const manifest: SnapshotManifest = { id: snapshotId, projectId, label, ... };
  const warnings: string[] = [];

  for (const file of flattenTree(tree)) {
    if (shouldSkip(file)) {
      manifest.files[file.path] = { skipped: true, ... };
      continue;
    }
    const content = await readFile(resolve(project.path, file.path));
    const hash = computeHash(content);
    await writeFile(join(filesDir, file.path), content);
    manifest.files[file.path] = { hash, size: content.length, encoding: "utf-8" };
  }

  manifest.totalFiles = Object.keys(manifest.files).length;
  await writeFile(join(snapshotDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  return { snapshot: toMeta(manifest), warnings };
}
```

### 11.2 快照恢复流程（伪代码）

```typescript
async function restoreSnapshot(projectId: string, snapshotId: string, confirmPath: string) {
  const project = getProject(projectId);
  if (project.path !== confirmPath) throw new ConfirmPathMismatchError();

  const manifest = await readManifest(snapshotId);

  // 安全网：恢复前自动创建当前状态快照
  const safetySnapshot = await createSnapshot(projectId, "恢复前自动备份", "pre-restore");

  // 1. 删除项目中不在 manifest 里的文件（新增文件）
  const currentTree = await getTree(project.path, { maxDepth: Infinity });
  for (const file of flattenTree(currentTree)) {
    if (!manifest.files[file.path]) {
      await deleteEntry(resolve(project.path, file.path), project.path);
    }
  }

  // 2. 用快照文件覆盖项目文件
  const warnings: string[] = [];
  for (const [relPath, entry] of Object.entries(manifest.files)) {
    if (entry.skipped) { warnings.push(`跳过: ${relPath}`); continue; }
    if (relPath.includes("..")) { warnings.push(`安全拦截: ${relPath}`); continue; }
    const src = resolve(snapshotDir, "files", relPath);
    const dest = resolve(project.path, relPath);
    await verifyPathSafe(dest, project.path);
    const content = await readFile(src);
    await writeFile(dest, project.path, content);
  }

  return { restored: toMeta(manifest), safetySnapshot, warnings };
}
```

### 11.3 前端 Store 设计

```typescript
interface SnapshotStore {
  snapshots: SnapshotMeta[];
  loading: boolean;
  error: string | null;
  storageInfo: { totalSnapshots: number; totalSizeBytes: number } | null;

  loadSnapshots: (projectId: string) => Promise<void>;
  createSnapshot: (projectId: string, label: string) => Promise<void>;
  restoreSnapshot: (projectId: string, snapshotId: string) => Promise<void>;
  deleteSnapshot: (projectId: string, snapshotId: string) => Promise<void>;
  getStorageInfo: (projectId: string) => Promise<void>;
}
```

---

## 12. 测试策略

| 测试类型 | 覆盖范围 |
|----------|----------|
| 单元测试 | `snapshot-store.ts` 的创建/恢复/删除逻辑 |
| 集成测试 | API 端点的完整请求/响应流程 |
| 边界测试 | 空项目、超大文件、权限不足、磁盘满 |
| 安全测试 | 路径穿越攻击（manifest 中注入 `../../etc/passwd`） |
| 前端测试 | 快照面板的交互流程（创建/恢复/删除） |

---

## 13. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 大项目快照耗时过长 | UI 卡顿 | 异步创建 + 进度通知（SSE），前端显示进度条 |
| 恢复过程中断 | 项目状态不一致 | 原子性设计：先写临时文件再 rename；恢复前自动创建安全网快照 |
| 快照占用磁盘过大 | 磁盘空间不足 | Phase 2 实现内容寻址存储和自动清理 |
| AI 修改文件与快照恢复冲突 | 文件内容混乱 | 恢复时如果文件正在被写入，等待写入完成后再覆盖 |
| manifest 路径穿越 | 安全风险 | 恢复时校验所有相对路径不含 `..`，复用 `verifyPathSafe()` |

---

## 14. 开放问题

1. **是否需要支持选择性恢复**？例如只恢复某些文件而非全部？（Phase 3）
2. **快照是否应包含 `.env` 等敏感文件**？默认包含但恢复时是否需要脱敏？
3. **自动快照的触发时机**？AI 每次 `writeFile` 前都创建快照是否过于频繁？（Phase 3）
4. **快照是否应跨设备同步**？例如通过云存储同步快照数据？
5. **是否借鉴 TRAE 的实时 diff 跟踪**？在 AI 修改文件时实时显示 diff 标记，支持逐 block 接受/拒绝？（Phase 3，需要前端编辑器深度集成）

> 以上问题在 Phase 1 中不涉及，留待后续阶段讨论。
