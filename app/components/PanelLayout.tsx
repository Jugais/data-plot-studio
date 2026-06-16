// src/app/components/PanelLayout.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronDown, ChevronRight, GripHorizontal, GripVertical } from "lucide-react";

export type PanelId = "plot" | "table";
export type Direction = "vertical" | "horizontal";

interface PanelLayoutProps {
  plotPanel: React.ReactNode;
  tablePanel: React.ReactNode;
  direction: Direction;
  onPlotResize?: () => void;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({
  plotPanel,
  tablePanel,
  direction,
  onPlotResize,
}) => {
  const [order, setOrder] = useState<PanelId[]>(["plot", "table"]);
  const [collapsed, setCollapsed] = useState<Record<PanelId, boolean>>({ plot: false, table: false });
  const [ratio, setRatio] = useState(0.55);

  const [draggingId, setDraggingId] = useState<PanelId | null>(null);
  const [dragOver, setDragOver] = useState<PanelId | null>(null);

  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // direction / ratio / collapsed 変化後に Plotly へリサイズ通知
  useEffect(() => {
    const t = setTimeout(() => onPlotResize?.(), 50);
    return () => clearTimeout(t);
  }, [direction, ratio, collapsed, onPlotResize]);

  const toggleCollapse = (id: PanelId) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // ---- Drag to reorder ----
  const handleDragStart = (e: React.DragEvent, id: PanelId) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, id: PanelId) => {
    e.preventDefault();
    if (id !== draggingId) setDragOver(id);
  };
  const handleDrop = (e: React.DragEvent, id: PanelId) => {
    e.preventDefault();
    if (draggingId && draggingId !== id) {
      setOrder(prev => {
        const next = [...prev];
        const fi = next.indexOf(draggingId);
        const ti = next.indexOf(id);
        next[fi] = id;
        next[ti] = draggingId;
        return next;
      });
    }
    setDraggingId(null);
    setDragOver(null);
  };
  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOver(null);
  };

  // ---- Resize divider drag ----
  const startResize = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isResizing.current = true;
      const container = containerRef.current;
      if (!container) return;

      const onMove = (clientX: number, clientY: number) => {
        if (!isResizing.current || !container) return;
        const rect = container.getBoundingClientRect();
        const newRatio =
          direction === "horizontal"
            ? (clientX - rect.left) / rect.width
            : (clientY - rect.top) / rect.height;
        setRatio(Math.min(0.85, Math.max(0.15, newRatio)));
      };

      const onMouseMove = (ev: MouseEvent) => onMove(ev.clientX, ev.clientY);
      const onTouchMove = (ev: TouchEvent) =>
        onMove(ev.touches[0].clientX, ev.touches[0].clientY);
      const stop = () => {
        isResizing.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", stop);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", stop);
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", stop);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", stop);
    },
    [direction]
  );

  const panels: Record<PanelId, React.ReactNode> = { plot: plotPanel, table: tablePanel };
  const panelLabels: Record<PanelId, string> = { plot: "Plot", table: "Data Table" };

  const c0 = collapsed[order[0]];
  const c1 = collapsed[order[1]];

  const getFlexStyle = (idx: number): React.CSSProperties => {
    const isFirst = idx === 0;
    const mine = isFirst ? c0 : c1;
    const other = isFirst ? c1 : c0;

    if (mine) {
      // 自分が閉じている → header のみ
      return { flexShrink: 0, flexGrow: 0, flexBasis: "auto" };
    }
    if (other) {
      // 相手が閉じている → 自分が全スペースを占有
      return { flex: "1 1 0%", minWidth: 0, minHeight: 0 };
    }
    // 両方展開 → ratio で分割
    const r = isFirst ? ratio : 1 - ratio;
    return { flex: `${r} ${r} 0%`, minWidth: 0, minHeight: 0 };
  };

  const showDivider = !c0 && !c1;

  return (
    <div
      ref={containerRef}
      className={`flex flex-1 min-h-0 min-w-0 ${
        direction === "vertical" ? "flex-col" : "flex-row"
      }`}
    >
      {order.map((id, idx) => {
        const isFirst = idx === 0;
        const isCollapsed = collapsed[id];
        const isDraggingThis = draggingId === id;
        const isDragOver = dragOver === id;

        return (
          <React.Fragment key={id}>
            <div
              className={`flex flex-col min-h-0 min-w-0 ${isDraggingThis ? "opacity-50" : ""} ${
                isDragOver ? "ring-2 ring-blue-400 ring-inset rounded-xl" : ""
              }`}
              style={getFlexStyle(idx)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={(e) => handleDrop(e, id)}
            >
              {/* Panel Header */}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 mb-1 rounded-lg cursor-grab active:cursor-grabbing select-none
                  bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shrink-0
                  ${isDragOver ? "bg-blue-50 border-blue-300" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, id)}
                onDragEnd={handleDragEnd}
              >
                {direction === "vertical" ? (
                  <GripHorizontal size={12} className="text-slate-400 shrink-0" />
                ) : (
                  <GripVertical size={12} className="text-slate-400 shrink-0" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex-1 truncate">
                  {panelLabels[id]}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollapse(id);
                  }}
                  className="p-0.5 rounded hover:bg-slate-300 transition-colors shrink-0"
                  title={isCollapsed ? "展開" : "折りたたむ"}
                >
                  {isCollapsed ? (
                    <ChevronRight size={12} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={12} className="text-slate-500" />
                  )}
                </button>
              </div>

              {/* Panel Content */}
              {!isCollapsed && (
                <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
                  {panels[id]}
                </div>
              )}
            </div>

            {/* Resize Divider — 両方展開時のみ */}
            {isFirst && showDivider && (
              <div
                className={`shrink-0 flex items-center justify-center group z-10 ${
                  direction === "vertical"
                    ? "h-3 w-full cursor-row-resize"
                    : "w-3 h-full cursor-col-resize"
                }`}
                onMouseDown={startResize}
                onTouchStart={startResize}
              >
                <div
                  className={`rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors ${
                    direction === "vertical" ? "h-1 w-12" : "w-1 h-12"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
