import { useEffect, useRef, type PointerEvent } from "react";

/**
 * Drag-handle between two adjacent panes. Supports both orientations:
 *
 *   `orientation: "vertical"` (default) — vertical bar between
 *   horizontally-stacked panes, drag left/right to resize WIDTH.
 *
 *   `orientation: "horizontal"` — horizontal bar between
 *   vertically-stacked panes, drag up/down to resize HEIGHT.
 *
 * Pattern: the parent owns a size state for the pane on a given side
 * of the divider; this component just emits delta movements via
 * `onResize`. Pointer events (not mouse events) so trackpad two-finger
 * drag and stylus work too. We capture the pointer on down so the user
 * can drag past the divider rectangle without the move events stopping.
 *
 * Decoupling drag from React state during the move loop keeps it
 * smooth: we read the latest size from a ref, compute the new size
 * synchronously, and only call `onResize` (which usually triggers a
 * setState upstream) once per frame's pointer move event.
 */
interface Props {
  /**
   * Size (width OR height depending on orientation) before the drag
   * started. Stored in a ref by the parent so we can compute
   * `start + delta` without bouncing through React state.
   */
  getStartSize: () => number;
  onResize: (nextSize: number) => void;
  /**
   * Direction of growth as the user drags toward higher coordinates
   * (right for vertical bars, down for horizontal bars). `+1` for
   * "pane is on the high-coord side of the divider", `-1` for
   * "low-coord side".
   */
  direction: 1 | -1;
  minSize: number;
  maxSize: number;
  orientation?: "vertical" | "horizontal";
  /** Called when a drag finishes (pointer up). Receives the final size. */
  onDragEnd?: (finalSize: number) => void;
}

export function ResizableDivider({
  getStartSize,
  onResize,
  direction,
  minSize,
  maxSize,
  orientation = "vertical",
  onDragEnd,
}: Props) {
  const dragRef = useRef<{ start: number; startSize: number; raf: number | null } | null>(null);
  const horizontal = orientation === "horizontal";
  const cursor = horizontal ? "row-resize" : "col-resize";

  // Always-on cancel listeners. ESC and window blur both
  // legitimately interrupt a drag (the user wanted out, or a system
  // notification stole focus); without these, `dragRef` could stay
  // populated and the next pointer move after re-focus would jump
  // the divider to a stale start point. The handlers are no-ops when
  // not dragging, so it's safe to register them once on mount.
  useEffect(() => {
    const cancel = (): void => {
      if (dragRef.current === null) return;
      if (dragRef.current.raf !== null) cancelAnimationFrame(dragRef.current.raf);
      dragRef.current = null;
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") cancel();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", cancel);
    return () => {
      cancel();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", cancel);
    };
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      start: horizontal ? e.clientY : e.clientX,
      startSize: getStartSize(),
      raf: null,
    };
    document.body.style.cursor = cursor;
    document.body.style.userSelect = "none";
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (dragRef.current === null) return;
    if (dragRef.current.raf !== null) return;
    dragRef.current.raf = requestAnimationFrame(() => {
      if (dragRef.current === null) return;
      const cur = horizontal ? e.clientY : e.clientX;
      const delta = cur - dragRef.current.start;
      const next = dragRef.current.startSize + delta * direction;
      onResize(Math.min(Math.max(next, minSize), maxSize));
      if (dragRef.current) dragRef.current.raf = null;
    });
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>): void => {
    if (dragRef.current === null) return;
    if (dragRef.current.raf !== null) cancelAnimationFrame(dragRef.current.raf);
    const cur = horizontal ? e.clientY : e.clientX;
    const delta = cur - dragRef.current.start;
    const finalSize = dragRef.current.startSize + delta * direction;
    const clamped = Math.min(Math.max(finalSize, minSize), maxSize);
    onDragEnd?.(clamped);
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
  };

  const baseCls =
    "group relative shrink-0";
  const sizeCls = horizontal ? "h-1 w-full cursor-row-resize" : "w-1 h-full cursor-col-resize";
  const hitboxCls = horizontal
    ? "absolute inset-x-0 -top-1 -bottom-1"
    : "absolute inset-y-0 -left-1 -right-1";

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`${baseCls} ${sizeCls}`}
      role="separator"
      aria-orientation={horizontal ? "horizontal" : "vertical"}
    >
      {/* Slightly wider invisible hitbox so the drag handle is easier
          to grab without making the visible bar fat. */}
      <div className={hitboxCls} />
    </div>
  );
}
