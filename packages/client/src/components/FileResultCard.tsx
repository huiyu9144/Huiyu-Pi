import { Eye, ExternalLink, FolderOpen } from "lucide-react";
import { useUiStore } from "../store/ui-store";
import { useProjectStore } from "../store/project-store";

const PREVIEWABLE_EXTS = new Set([".md", ".mdx", ".markdown", ".mdown", ".html", ".htm"]);
const HTML_EXTS = new Set([".html", ".htm"]);

function getExt(path: string): string {
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? path.slice(dot).toLowerCase() : "";
}

function isPreviewable(path: string): boolean {
  return PREVIEWABLE_EXTS.has(getExt(path));
}

function isHtml(path: string): boolean {
  return HTML_EXTS.has(getExt(path));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileResultCard({
  filePath,
  content,
  toolName,
}: {
  filePath: string;
  content: string;
  toolName: string;
}) {
  const openPreviewFile = useUiStore((s) => s.openPreviewFile);
  const activeProjectId = useProjectStore((s) => s.activeProjectId);
  const projects = useProjectStore((s) => s.projects);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const fileName = filePath.split(/[/\\]/).pop() ?? filePath;
  const ext = getExt(filePath);
  const lineCount = content.split("\n").length;
  const byteSize = new TextEncoder().encode(content).length;

  const handlePreview = (): void => {
    openPreviewFile(filePath);
  };

  const handleOpenInBrowser = (): void => {
    if (isHtml(filePath)) {
      const blob = new Blob([content], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } else {
      openPreviewFile(filePath);
    }
  };

  const handleOpenFolder = (): void => {
    if (activeProject?.path !== undefined) {
      const dirPath = filePath.includes("/") || filePath.includes("\\")
        ? filePath.replace(/[/\\][^/\\]+$/, "")
        : ".";
      const absDir = dirPath.startsWith(activeProject.path)
        ? dirPath
        : `${activeProject.path}/${dirPath}`.replace(/\\/g, "/");
      navigator.clipboard.writeText(absDir).catch(() => {});
    }
  };

  const isHtmlFile = isHtml(filePath);
  const iconBg = isHtmlFile ? "bg-orange-500/10" : "bg-blue-500/10";
  const iconEmoji = isHtmlFile ? "🌐" : "📄";

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] px-2.5 py-1.5 transition-colors hover:border-[#333]">
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] text-[11px] ${iconBg}`}
      >
        {iconEmoji}
      </div>

      <div className="flex min-w-0 items-center gap-1.5">
        <span className="max-w-[200px] truncate text-[12px] font-medium text-neutral-300">
          {fileName}
        </span>
        <span className="shrink-0 text-[10px] text-[#525252]">
          {formatSize(byteSize)}
          {lineCount > 0 && ` · ${lineCount} lines`}
        </span>
      </div>

      <div className="flex shrink-0 gap-1">
        {isPreviewable(filePath) && (
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex items-center gap-1 rounded-[5px] border border-blue-500/15 bg-blue-500/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-blue-400 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.08]"
            title="Preview in right panel"
          >
            <Eye size={10} />
            Preview
          </button>
        )}
        <button
          type="button"
          onClick={handleOpenInBrowser}
          className="inline-flex items-center gap-1 rounded-[5px] border border-[#1a1a1a] bg-[#141414] px-1.5 py-0.5 text-[10px] font-medium text-[#737373] transition-all hover:border-[#333] hover:bg-[#1a1a1a] hover:text-neutral-300"
          title="Open in browser"
        >
          <ExternalLink size={10} />
          Browser
        </button>
        <button
          type="button"
          onClick={handleOpenFolder}
          className="inline-flex items-center gap-1 rounded-[5px] border border-[#1a1a1a] bg-[#141414] px-1.5 py-0.5 text-[10px] font-medium text-[#737373] transition-all hover:border-[#333] hover:bg-[#1a1a1a] hover:text-neutral-300"
          title="Copy folder path"
        >
          <FolderOpen size={10} />
          Folder
        </button>
      </div>
    </div>
  );
}
