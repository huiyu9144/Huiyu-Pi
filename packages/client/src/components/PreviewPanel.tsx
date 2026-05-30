import { useCallback, useEffect, useRef, useState } from "react";
import { X, FileText, Copy, FolderOpen, Edit, Save, ExternalLink } from "lucide-react";
import { useUiStore } from "../store/ui-store";
import { useActiveProject } from "../store/project-store";
import { api } from "../lib/api-client";
import { ChatMarkdown } from "./ChatMarkdown";

const MARKDOWN_EXTS = new Set([".md", ".mdx", ".markdown", ".mdown"]);
const HTML_EXTS = new Set([".html", ".htm"]);

function getExt(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? path.slice(dot).toLowerCase() : "";
}

function isMarkdown(path: string): boolean {
  return MARKDOWN_EXTS.has(getExt(path));
}

function isHtmlFile(path: string): boolean {
  return HTML_EXTS.has(getExt(path));
}

export function PreviewPanel() {
  const filePath = useUiStore((s) => s.previewFilePath);
  const closePreviewFile = useUiStore((s) => s.closePreviewFile);
  const active = useActiveProject();

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (filePath === undefined || active === undefined) {
      setContent("");
      setError(undefined);
      setEditing(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    setEditing(false);
    void api
      .filesRead(active.id, filePath)
      .then((r) => {
        if (cancelled) return;
        if (r.binary) {
          setError("Binary file — cannot preview");
        } else {
          setContent(r.content);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load file");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filePath, active]);

  const handleCopyContent = useCallback(() => {
    void navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [content]);

  const handleOpenFolder = useCallback(() => {
    if (active === undefined || filePath === undefined) return;
    void api.filesOpenInExplorer(active.id, filePath).catch(() => {});
  }, [active, filePath]);

  const handleEdit = useCallback(() => {
    setEditText(content);
    setEditing(true);
    setTimeout(() => editRef.current?.focus(), 0);
  }, [content]);

  const handleSave = useCallback(() => {
    if (active === undefined || filePath === undefined) return;
    setSaving(true);
    void api
      .filesWrite(active.id, filePath, editText)
      .then(() => {
        setContent(editText);
        setEditing(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to save");
      })
      .finally(() => setSaving(false));
  }, [active, filePath, editText]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  if (filePath === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <img src="/icons/logo-rounded.png" alt="" className="h-16 w-16 rounded-xl" />
          <span className="text-lg font-semibold tracking-tight">Huiyu Pi</span>
          <p className="mt-2 text-center text-sm text-neutral-500">
            Click a file path in the chat to preview it here.
          </p>
        </div>
      </div>
    );
  }

  const fileName = filePath.split("/").pop() ?? filePath;
  const md = isMarkdown(filePath);
  const html = isHtmlFile(filePath);
  const editable = md || !html;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-neutral-800 px-3 py-1.5">
        <FileText size={14} className="shrink-0 text-neutral-400" />
        <span className="flex-1 truncate font-mono text-xs text-neutral-300" title={filePath}>
          {fileName}
        </span>
        <button
          type="button"
          onClick={handleCopyContent}
          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
          title="Copy content"
        >
          {copied ? (
            <span className="text-[10px] text-emerald-400">Copied</span>
          ) : (
            <Copy size={12} />
          )}
        </button>
        <button
          type="button"
          onClick={handleOpenFolder}
          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
          title="Open containing folder"
        >
          <FolderOpen size={12} />
        </button>
        {html && content && (
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([content], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
            }}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
            title="Open in browser"
          >
            <ExternalLink size={12} />
          </button>
        )}
        {editable && !editing && (
          <button
            type="button"
            onClick={handleEdit}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
            title="Edit file"
          >
            <Edit size={12} />
          </button>
        )}
        {editing && (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded p-1 text-emerald-400 hover:bg-emerald-900/30"
              title="Save changes"
            >
              <Save size={12} />
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
              title="Cancel"
            >
              <X size={12} />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={closePreviewFile}
          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
          title="Close preview"
        >
          <X size={14} />
        </button>
      </div>

      <div className={`custom-scrollbar flex-1 overflow-auto ${html ? "" : "p-3"}`}>
        {loading && (
          <div className="flex items-center justify-center py-8 text-sm text-neutral-500">
            Loading…
          </div>
        )}
        {error !== undefined && (
          <div className="rounded border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        {!loading && error === undefined && content !== "" && (
          <div className={html ? "h-full" : "overflow-hidden"}>
            {editing ? (
              <textarea
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="h-full w-full resize-none bg-transparent font-mono text-xs text-neutral-200 outline-none"
                style={{ minHeight: "calc(100vh - 220px)" }}
              />
            ) : html ? (
              <iframe
                srcDoc={content}
                title={fileName}
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-same-origin"
                style={{ minHeight: "100%" }}
              />
            ) : md ? (
              <ChatMarkdown text={content} size="sm" disablePathDetection />
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-xs text-neutral-200 [overflow-wrap:anywhere]">
                {content}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
