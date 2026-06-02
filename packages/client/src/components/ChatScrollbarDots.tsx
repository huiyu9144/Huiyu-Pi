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

const PROXIMITY_PX = 20;

export function ChatScrollbarDots({ messages, onScrollToMessage, onScrollToBottom }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const track = trackRef.current;
    if (track === null) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = track.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      setMouseY(relY);
      const isNear = relY >= -PROXIMITY_PX && relY <= rect.height + PROXIMITY_PX;
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
    const parent = track.parentElement;
    if (parent === null) return;
    parent.addEventListener("mousemove", handleMouseMove);
    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
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

  const activeDotTop = hoveredIdx !== null ? userDots.find((d) => d.index === hoveredIdx) : null;

  const tooltipTopPx =
    activeDotTop !== null && activeDotTop !== undefined && mouseY !== null ? mouseY : 0;

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
        style={{ bottom: "4px" }}
        onMouseEnter={() => setHoveredIdx(-1)}
        onMouseLeave={handleDotLeave}
        onClick={handleBottomClick}
        title="Scroll to bottom"
      />
      {hoveredDot !== undefined && (
        <div
          className="scrollbar-dots-tooltip"
          style={{
            left: "16px",
            top: `${tooltipTopPx}px`,
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
