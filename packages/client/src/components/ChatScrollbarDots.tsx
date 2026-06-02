import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import type { AgentMessageLike } from "../store/session-store";

interface Props {
  messages: AgentMessageLike[];
  onScrollToMessage: (index: number) => void;
  onScrollToBottom: () => void;
}

interface DotInfo {
  index: number;
  top: string;
  line1: string;
  line2: string;
  line3: string;
  seq: number;
}

function splitPreview(msg: AgentMessageLike): { line1: string; line2: string; line3: string } {
  const raw =
    typeof msg.content === "string"
      ? msg.content
      : Array.isArray(msg.content)
        ? (msg.content as Record<string, unknown>[])
            .filter((b) => b.type === "text" && typeof b.text === "string")
            .map((b) => b.text as string)
            .join(" ")
        : "";
  const text = raw
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length === 0) return { line1: "Message", line2: "", line3: "" };
  const MAX_LINE = 60;
  const breakAt = (s: string, max: number) => {
    if (s.length <= max) return s.length;
    const idx = s.lastIndexOf(" ", max);
    return idx > max * 0.3 ? idx : max;
  };
  const e1 = breakAt(text, MAX_LINE);
  const l1 = text.slice(0, e1);
  const r1 = text.slice(e1).trim();
  if (r1.length === 0) return { line1: l1, line2: "", line3: "" };
  const e2 = breakAt(r1, MAX_LINE);
  const l2 = r1.slice(0, e2);
  const r2 = r1.slice(e2).trim();
  if (r2.length === 0) return { line1: l1, line2: l2, line3: "" };
  const l3 = r2.length > MAX_LINE ? r2.slice(0, MAX_LINE) + "…" : r2;
  return { line1: l1, line2: l2, line3: l3 };
}

const PROXIMITY_PX = 10;
const STARTUP_DELAY_MS = 600;

export function ChatScrollbarDots({ messages, onScrollToMessage, onScrollToBottom }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startupRef = useRef(true);

  const userDots = useMemo<DotInfo[]>(() => {
    const userMsgs: { msg: AgentMessageLike; idx: number }[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i]!.role === "user") userMsgs.push({ msg: messages[i]!, idx: i });
    }
    if (userMsgs.length === 0) return [];
    const total = messages.length;
    return userMsgs.map(({ msg, idx }, seqIdx) => {
      const { line1, line2, line3 } = splitPreview(msg);
      return {
        index: idx,
        top: `${((idx + 1) / (total + 1)) * 100}%`,
        line1,
        line2,
        line3,
        seq: seqIdx + 1,
      };
    });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startupRef.current = false;
    }, STARTUP_DELAY_MS);
    return () => {
      clearTimeout(timer);
      if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (track === null) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (startupRef.current) return;
      const rect = track.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      setMouseY(relY);
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isNear = dist <= PROXIMITY_PX;
      if (isNear) {
        setIsVisible(true);
        if (hideTimerRef.current !== null) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
      } else {
        if (hideTimerRef.current === null) {
          hideTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            setHoveredIdx(null);
            hideTimerRef.current = null;
          }, 200);
        }
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleDotEnter = useCallback((dot: DotInfo) => {
    setHoveredIdx(dot.index);
  }, []);

  const handleDotLeave = useCallback(() => {
    setHoveredIdx(null);
  }, []);

  const handleClick = useCallback(
    (dot: DotInfo) => {
      onScrollToMessage(dot.index);
      setHoveredIdx(null);
    },
    [onScrollToMessage],
  );

  const handleBottomClick = useCallback(() => {
    onScrollToBottom();
    setHoveredIdx(null);
  }, [onScrollToBottom]);

  if (userDots.length === 0) return null;

  const hoveredDot = hoveredIdx !== null ? userDots.find((d) => d.index === hoveredIdx) : undefined;

  const tooltipTopPx = mouseY ?? 0;

  return (
    <div
      ref={trackRef}
      className={`scrollbar-dots-track ${isVisible ? "scrollbar-dots-visible" : ""}`}
      aria-hidden="true"
    >
      {userDots.map((dot) => (
        <div
          key={dot.index}
          className={`scrollbar-dot ${hoveredIdx === dot.index ? "scrollbar-dot-active" : ""}`}
          style={{ top: dot.top }}
          onMouseEnter={() => handleDotEnter(dot)}
          onMouseLeave={handleDotLeave}
          onClick={() => handleClick(dot)}
        />
      ))}
      <div
        className="scrollbar-dot scrollbar-dot-bottom"
        style={{ bottom: "0px" }}
        onMouseEnter={() => setHoveredIdx(-1)}
        onMouseLeave={handleDotLeave}
        onClick={handleBottomClick}
        title="Scroll to bottom"
      />
      {hoveredDot !== undefined && (
        <div
          className="scrollbar-dots-tooltip"
          style={{
            left: "220px",
            top: `${tooltipTopPx}px`,
          }}
        >
          <div className="scrollbar-dots-tooltip-line1">
            <span className="scrollbar-dots-tooltip-seq">{hoveredDot.seq}</span>
            {hoveredDot.line1}
          </div>
          {hoveredDot.line2.length > 0 && (
            <div className="scrollbar-dots-tooltip-line2">{hoveredDot.line2}</div>
          )}
          {hoveredDot.line3.length > 0 && (
            <div className="scrollbar-dots-tooltip-line3">{hoveredDot.line3}</div>
          )}
        </div>
      )}
    </div>
  );
}
