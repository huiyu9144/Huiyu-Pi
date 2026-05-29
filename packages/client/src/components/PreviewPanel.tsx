import { useEffect, useState } from "react";
import { X, FileText, ExternalLink } from "lucide-react";
import { useUiStore } from "../store/ui-store";
import { useActiveProject } from "../store/project-store";
import { api } from "../lib/api-client";
import { ChatMarkdown } from "./ChatMarkdown";

const MARKDOWN_EXTS = new Set([".md", ".mdx", ".markdown", ".mdown"]);

function getExt(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? path.slice(dot).toLowerCase() : "";
}

function isMarkdown(path: string): boolean {
  return MARKDOWN_EXTS.has(getExt(path));
}

export function PreviewPanel() {
  const filePath = useUiStore((s) => s.previewFilePath);
  const closePreviewFile = useUiStore((s) => s.closePreviewFile);
  const openPreviewFile = useUiStore((s) => s.openPreviewFile);
  const active = useActiveProject();

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (filePath === undefined || active === undefined) {
      setContent("");
      setError(undefined);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(undefined);
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
  }, [filePath, active?.id]);

  if (filePath === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-neutral-500">
        Click a file path in the chat to preview it here.
      </div>
    );
  }

  const fileName = filePath.split("/").pop() ?? filePath;
  const md = isMarkdown(filePath);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
        <FileText size={14} className="shrink-0 text-neutral-400" />
        <span className="flex-1 truncate font-mono text-xs text-neutral-300" title={filePath}>
          {fileName}
        </span>
        <button
          type="button"
          onClick={() => {
            if (active !== undefined) {
              void navigator.clipboard?.writeText(filePath);
            }
          }}
          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
          title="Copy full path"
        >
          <ExternalLink size={12} />
        </button>
        <button
          type="button"
          onClick={closePreviewFile}
          className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
          title="Close preview"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
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
          <div className="overflow-hidden">
            {md ? (
              <ChatMarkdown text={content} size="sm" />
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
