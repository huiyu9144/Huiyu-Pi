/**
 * Markdown renderer for chat messages — assistant text blocks, user
 * text bubbles, and the streaming preview.
 *
 * Uses `react-markdown` + `remark-gfm` (already in package.json from
 * the v1 install but never wired) for the markdown / GFM dialect, and
 * `prism-react-renderer` for syntax-highlighted fenced code blocks
 * (same library DiffBlock and ContextInspectorPanel use, so themes
 * stay consistent across the dark surfaces).
 *
 * Design choices that aren't obvious from the diff:
 *
 * - **No raw HTML.** react-markdown ignores HTML tags by default,
 *   which is the right posture for assistant output that may
 *   round-trip user-controlled content; we don't add the
 *   `rehype-raw` plugin.
 * - **Heading scale is dampened.** Default `<h1>`/`<h2>` are
 *   document-sized (1.5rem+); inside a chat bubble they drown the
 *   prose. Mapped to text-base / text-sm.
 * - **Links open in a new tab.** `target="_blank"` + `rel="noopener
 *   noreferrer"` so a click doesn't navigate away from the
 *   conversation, and `noopener` defeats `window.opener` reach-back.
 * - **Code blocks unwrap from their `<pre>`.** react-markdown nests
 *   `<code>` inside `<pre>` for fenced blocks; we replace `<pre>`
 *   with a fragment and let the code-renderer below own the
 *   `<pre>` layout — otherwise the prism-themed `<pre>` ends up
 *   inside the markdown library's bare `<pre>`, doubling the
 *   background and padding.
 * - **Inline code keeps the same monospace look across the app.**
 *   We mirror the badge style used in SettingsPanel
 *   (`code.font-mono`) so a `like-this` token reads the same
 *   whether it appears in chat, in a settings hint, or in a tool
 *   preview header.
 * - **Streaming-friendly.** react-markdown handles unfinished input
 *   gracefully — an open code fence renders as a code block until
 *   it's closed by the next token. The streaming preview is the
 *   primary user of that behavior; no special-case handling needed
 *   here.
 */
import { Highlight, themes as prismThemes } from "prism-react-renderer";
import { useState, type HTMLAttributes, type ReactNode } from "react";
import { Check, Copy, FileText } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { themeDef, useThemeStore } from "../lib/theme";
import { useUiStore } from "../store/ui-store";
import "katex/dist/katex.min.css";

const FILE_REF_PREFIX = "forge-preview:";

const FILE_PATH_RE = /📄\s+([^\s`<>]+\.\w+)/g;

const BARE_PATH_RE = /((?:[A-Za-z]:[\\/]|[~\/])[^\s`<>|"]+?\.(?:html?|mdx?|md|markdown|mdown|htm))\b/g;

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/");
}

function wrapFilePaths(text: string): string {
  let result = text.replace(FILE_PATH_RE, (_match, path: string) => {
    return `[📄 ${path}](<${FILE_REF_PREFIX}${normalizePath(path)}>)`;
  });
  result = result.replace(BARE_PATH_RE, (_match, filePath: string) => {
    const normalized = normalizePath(filePath);
    if (result.includes(`(${FILE_REF_PREFIX}${normalized})`)) return _match;
    if (result.includes(`(<${FILE_REF_PREFIX}${normalized}>)`)) return _match;
    const fileName = filePath.split(/[\\/]/).pop() ?? filePath;
    return `[📄 ${fileName}](<${FILE_REF_PREFIX}${normalized}>)`;
  });
  return result;
}

/**
 * Small copy-to-clipboard control rendered in the top-right corner of
 * each fenced code block. Async clipboard API with a synthetic-textarea
 * fallback for old Safari / insecure HTTP origins. Two-step state:
 * idle → copied (1.2s) → idle, so the user gets a visible confirmation.
 */
function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = (): void => {
    if (code.length === 0) return;
    const flash = (): void => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    };
    const writeAsync = navigator.clipboard?.writeText?.bind(navigator.clipboard);
    if (writeAsync !== undefined) {
      void writeAsync(code).then(flash).catch(fallback);
      return;
    }
    fallback();
    function fallback(): void {
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        flash();
      } catch {
        // No clipboard available; user can still select + Cmd+C.
      }
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      // Mobile: always visible, ≥ 44 px tap target (no hover on touch).
      // Desktop: hover-revealed via group-hover, compact size.
      className="absolute right-1 top-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded bg-neutral-800/80 p-1 text-neutral-400 transition-opacity hover:text-neutral-100 focus:opacity-100 md:min-h-0 md:min-w-0 md:opacity-0 md:group-hover:opacity-100"
      title="Copy code block"
      aria-label="Copy code block"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

interface Props {
  text: string;
  /**
   * Smaller text variant used by inline contexts (assistant
   * (streaming) preview, anywhere bubble whitespace is tight). The
   * default matches the assistant text block (text-sm).
   */
  size?: "sm" | "xs";
  /**
   * Enable chat-style hard breaks (single `\n` → `<br>`) via
   * `remark-breaks`. Default `false`.
   *
   * User messages set this to `true` because chat input is typed
   * as prose with line breaks the user expects to see — the
   * Slack / Discord / GitHub-comments dialect. The user's primary
   * use is "paste a list of items separated by newlines and have
   * each on its own line."
   *
   * Trade-off knowingly accepted: GFM tables in user input that
   * AREN'T preceded by a blank line can render with each row as
   * a `<br>`-separated paragraph instead of a real table (the
   * table parser fails when the table runs on from a preceding
   * paragraph; remark-breaks then renders the failed parse as
   * line-broken text). Workaround: leave a blank line above the
   * table. Assistant output keeps standard CommonMark behavior
   * because the model emits real markdown structure that depends
   * on the standard line-break semantics.
   */
  chatStyleBreaks?: boolean;
  /**
   * Skip the file-path-detection pass (`wrapFilePaths`). Use this in
   * contexts like PreviewPanel where the content is a file being
   * displayed verbatim — we don't need to detect paths in it, and the
   * path regex can corrupt inline code spans that happen to contain
   * a file path.
   */
  disablePathDetection?: boolean;
}

/**
 * react-markdown 10 dropped the `inline` prop on the code component.
 *
 * Detection: we treat the code as a block whenever (a) it has a
 * `language-*` className (fenced block with explicit lang hint), or
 * (b) its text contains a newline (fenced block without a lang
 * hint — react-markdown still hands those through as `<code>`
 * inside a `<pre>`, just with no className). Anything else is
 * single-backtick inline code.
 *
 * Earlier versions branched only on className, which silently
 * routed unlanged ` ``` ` blocks to the inline span and lost the
 * block layout entirely. Block-vs-inline is the user-visible
 * decision, so we make it on the right signal.
 */
const CodeRenderer = ({ className, children, ...rest }: HTMLAttributes<HTMLElement>): ReactNode => {
  // Pair the Prism theme to the user-picked app theme. vsDark / vsLight
  // are both close in saturation, so switching between them inside the
  // same session doesn't visually jar the chat history. Called
  // unconditionally at the top of the component so the rules-of-hooks
  // ordering isn't broken by the inline-vs-block early return below.
  const themeId = useThemeStore((s) => s.theme);
  const isLight = themeDef(themeId).mode === "light";
  const langMatch = /language-([\w-]+)/.exec(className ?? "");
  // children is the code text. Coerce to string and strip a single
  // trailing newline that `react-markdown` reliably adds — leaving
  // it produces an awkward blank last line in the highlight.
  const code = String(children ?? "").replace(/\n$/, "");
  const isBlock = langMatch !== null || code.includes("\n");

  if (!isBlock) {
    return (
      <code
        className="rounded bg-neutral-800 px-1 py-0.5 font-mono text-[0.9em] text-neutral-100"
        {...rest}
      >
        {children}
      </code>
    );
  }
  // Default to plain "text" so prism still wraps the block with
  // its <pre> chrome (no token highlighting, just the styling).
  const language = langMatch?.[1] ?? "text";
  const prismTheme = isLight ? prismThemes.vsLight : prismThemes.vsDark;
  const customTheme = {
    ...prismTheme,
    plain: {
      ...prismTheme.plain,
      color: isLight ? "#666666" : "#9ab3cb",
    },
  };
  // Background tuned to sit one shade off the chat surface so the
  // code block reads as a distinct region without competing with
  // surrounding text contrast.
  const codeBg = isLight ? "#ececec" : "#0d0d0d";

  return (
    // `group` enables the hover-revealed copy button positioned via
    // `group-hover:opacity-100` inside CodeCopyButton.
    <div className="group relative">
      <CodeCopyButton code={code} />
      <Highlight code={code} language={language} theme={customTheme}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="overflow-x-auto rounded border border-neutral-800 p-2 font-mono text-[12px]"
            style={{ ...style, background: codeBg }}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line });
              return (
                <div key={i} {...lineProps}>
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token });
                    return <span key={key} {...tokenProps} />;
                  })}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
};

function FilePreviewLink({
  filePath,
  children,
}: {
  filePath: string;
  children: ReactNode;
}) {
  const openPreviewFile = useUiStore((s) => s.openPreviewFile);
  return (
    <button
      type="button"
      onClick={() => openPreviewFile(filePath)}
      className="inline-flex items-center gap-1 rounded bg-neutral-800/60 px-1.5 py-0.5 text-[#7BB8FF] light:text-blue-600 transition-colors hover:bg-neutral-700/60 hover:text-[#7BB8FF]"
      title={`Preview ${filePath}`}
    >
      <FileText size={12} />
      <span className="font-mono text-xs">{children}</span>
    </button>
  );
}

const components: Components = {
  // Heading scale — see header comment for why we shrink.
  h1: ({ children }) => (
    <h1 className="mb-1 mt-3 text-base font-semibold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => <h2 className="mb-1 mt-3 text-sm font-semibold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-1 mt-2 text-xs font-semibold first:mt-0">{children}</h4>,
  h5: ({ children }) => <h5 className="mb-1 mt-2 text-xs font-semibold first:mt-0">{children}</h5>,
  h6: ({ children }) => <h6 className="mb-1 mt-2 text-xs font-semibold first:mt-0">{children}</h6>,

  // Paragraph + lists — tight spacing inside a bubble; the bubble
  // already provides outer padding.
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="my-2 ml-5 list-disc space-y-1 first:mt-0">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 ml-5 list-decimal space-y-1 first:mt-0">{children}</ol>,
  li: ({ children }) => <li className="leading-snug">{children}</li>,

  // Blockquote: subtle left border, dimmer text.
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-neutral-700 pl-3 text-neutral-400">
      {children}
    </blockquote>
  ),

  // Tables (GFM): scrollable wrapper to handle wide columns inside
  // a fixed-width bubble.
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="pi-table-cell border border-neutral-800 bg-neutral-950 px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="pi-table-cell border border-neutral-800 px-2 py-1 align-top">{children}</td>
  ),

  // Links → new tab + safe rel, or file-preview click handler.
  a: ({ children, href }) => {
    if (href?.startsWith(FILE_REF_PREFIX)) {
      const filePath = href.slice(FILE_REF_PREFIX.length);
      return <FilePreviewLink filePath={filePath}>{children}</FilePreviewLink>;
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#7BB8FF] light:text-blue-600 underline hover:text-[#7BB8FF] light:text-[#7BB8FF] light:hover:text-[#7BB8FF]"
      >
        {children}
      </a>
    );
  },

  // Horizontal rule — match neutral border palette.
  hr: () => null,

  // Strong / em — defaults are fine; explicit so we own the look.
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,

  // Code — see CodeRenderer header for the inline / fenced split.
  code: CodeRenderer,
  // Unwrap react-markdown's bare <pre> — CodeRenderer owns the
  // <pre>, so the parent fragment keeps the layout single-bubble.
  pre: ({ children }) => <>{children}</>,
};

export function ChatMarkdown({ text, size = "sm", chatStyleBreaks = false, disablePathDetection = false }: Props) {
  const sizeClass = size === "xs" ? "text-xs" : "text-sm";
  const plugins = chatStyleBreaks ? [remarkGfm, remarkMath, remarkBreaks] : [remarkGfm, remarkMath];
  const processed = disablePathDetection ? text : wrapFilePaths(text);

  const linkRe = /^\[📄 ([^\]]+)\]\(<?forge-preview:([^>)]+?)>?\)$/;

  const segments = processed.split(/(\[📄 [^\]]+\]\(<?forge-preview:[^>)]+?>?\))/g).filter(Boolean);

  return (
    <div className={`${sizeClass} break-words [overflow-wrap:anywhere]`}>
      {segments.map((segment, i) => {
        const m = segment.match(linkRe);
        if (m !== null && m[1] !== undefined && m[2] !== undefined) {
          return <FilePreviewLink key={i} filePath={m[2]}>{m[1]}</FilePreviewLink>;
        }
        return (
          <ReactMarkdown key={i} remarkPlugins={plugins} rehypePlugins={[rehypeKatex]} components={components}>
            {segment}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
