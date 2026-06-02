import { useMemo, useRef, useState, useCallback } from "react";
import type { AgentMessageLike } from "../store/session-store";

interface Props {
  messages: AgentMessageLike[];
  onScrollToMessage: (index: number) => void;
}

interface DotInfo {
  index: number;
  top: string;
  line1: string;
  line2: string;
}

function splitPreview(msg: AgentMessageLike): { line1: string; line2: string } {
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
  if (text.length === 0) return { line1: "Message", line2: "" };
  const cut = Math.min(text.length, 60);
  const breakAt = text.lastIndexOf(" ", cut);
  const end = breakAt > 20 ? breakAt : cut;
  const l1 = text.slice(0, end);
  const l2 = text.slice(end).trim();
  return { line1: l1, line2: l2.length > 60 ? l2.slice(0, 60) + "…" : l2 };
}

export function ChatScrollbarDots({ messages, onScrollToMessage }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userDots = useMemo<DotInfo[]>(() => {
    const userMsgs: { msg: AgentMessageLike; idx: number }[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i]!.role === "user") userMsgs.push({ msg: messages[i]!, idx: i });
    }
    if (userMsgs.length === 0) return [];
    const total = messages.length;
    return userMsgs.map(({ msg, idx }) => {
      const { line1, line2 } = splitPreview(msg);
      return {
        index: idx,
        top: `${((idx + 1) / (total + 1)) * 100}%`,
        line1,
        line2,
      };
    });
  }, [messages]);

  const handleMouseEnter = useCallback((dot: DotInfo, e: React.MouseEvent) => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setHoveredIdx(dot.index);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setHoveredIdx(null), 80);
  }, []);

  const handleClick = useCallback(
    (dot: DotInfo) => {
      onScrollToMessage(dot.index);
      setHoveredIdx(null);
    },
    [onScrollToMessage],
  );

  if (userDots.length === 0) return null;

  const hoveredDot = hoveredIdx !== null ? userDots.find((d) => d.index === hoveredIdx) : undefined;

  return (
    <div className="scrollbar-dots-track" aria-hidden="true">
      {userDots.map((dot) => (
        <div
          key={dot.index}
          className={`scrollbar-dot ${hoveredIdx === dot.index ? "scrollbar-dot-active" : ""}`}
          style={{ top: dot.top }}
          onMouseEnter={(e) => handleMouseEnter(dot, e)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(dot)}
        />
      ))}
      {hoveredDot !== undefined && (
        <div
          className="scrollbar-dots-tooltip"
          style={{
            left: "22px",
            top: tooltipPos.y,
          }}
        >
          <div className="scrollbar-dots-tooltip-line1">{hoveredDot.line1}</div>
          {hoveredDot.line2.length > 0 && (
            <div className="scrollbar-dots-tooltip-line2">{hoveredDot.line2}</div>
          )}
        </div>
      )}
    </div>
  );
}
