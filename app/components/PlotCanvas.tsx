// src/app/components/PlotCanvas.tsx
"use client";

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { UploadCloud } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type ViewMode = "gradient" | "category";

interface Stats { r: number; r2: number; n: number; }

interface PlotCanvasProps {
  data: any[];
  columns: string[];
  axis: { x: string; y: string; color: string };
  setAxis: (axis: { x: string; y: string; color: string }) => void;
  plotMode: string;
  onPointClick: (row: any) => void;
  plotRef: any;
  children: React.ReactNode;
  stats: Stats | null;
  onUpload: (text: string) => void;
}

// ---- Draggable stats badge ----
const DraggableStatsBadge: React.FC<{ stats: Stats; corrColor: (r: number) => string }> = ({
  stats, corrColor,
}) => {
  const [pos, setPos] = useState({ x: 12, y: 12 });
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...pos };
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, startPos.current.x - (ev.clientX - startMouse.current.x)),
        y: Math.max(0, startPos.current.y - (ev.clientY - startMouse.current.y)),
      });
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [pos]);

  return (
    <div
      className="absolute flex gap-3 items-center
        bg-white/60 backdrop-blur-md border border-white/80
        rounded-lg px-3 py-1.5 shadow-md
        cursor-grab active:cursor-grabbing select-none"
      style={{ right: pos.x, bottom: pos.y, zIndex: 20 }}
      onMouseDown={onMouseDown}
    >
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">r</span>
        <span className={`text-[13px] font-bold font-mono leading-tight ${corrColor(stats.r)}`}>
          {stats.r.toFixed(2)}
        </span>
      </div>
      <div className="w-px h-6 bg-slate-200" />
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">r²</span>
        <span className={`text-[13px] font-bold font-mono leading-tight ${corrColor(Math.sqrt(stats.r2))}`}>
          {stats.r2.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

// ---- File decode helper ----
async function decodeFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (!(result instanceof ArrayBuffer)) { reject(new Error("read failed")); return; }
      const uint8 = new Uint8Array(result);
      try {
        resolve(new TextDecoder("utf-8", { fatal: true }).decode(uint8));
      } catch {
        resolve(new TextDecoder("shift-jis").decode(uint8));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

// ---- Main component ----
export const PlotCanvas: React.FC<PlotCanvasProps> = ({
  data, columns, axis, setAxis, plotMode, onPointClick, plotRef, children, stats, onUpload,
}) => {
  const hasValidData = data.length > 0 && axis.x && axis.y;
  const [viewMode, setViewMode] = useState<ViewMode>('gradient');
  const [isDragOver, setIsDragOver] = useState(false);

  const selectCls =
    "bg-white border border-slate-300 text-[12px] font-medium rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shrink-0";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      const text = await decodeFile(file);
      onUpload(text);
    } catch (err) {
      console.error("D&D file read error:", err);
    }
  };

  const getPlotData = () => {
    if (data.length === 0 || !axis.x || !axis.y) return [];

    if (viewMode === 'category' && axis.color) {
      const categories = Array.from(new Set(data.map(d => String(d[axis.color]))));
      return categories.map(cat => {
        const filtered = data.filter(d => String(d[axis.color]) === cat);
        return {
          name: cat,
          x: filtered.map(d => d[axis.x]),
          y: filtered.map(d => d[axis.y]),
          mode: 'markers', type: 'scattergl',
          customdata: filtered,
          marker: { size: 10, opacity: 0.8, line: { color: 'white', width: 0.5 } },
          text: cat,
        };
      });
    }

    return [{
      x: data.map(d => d[axis.x]),
      y: data.map(d => d[axis.y]),
      mode: 'markers', type: 'scattergl',
      customdata: data,
      marker: {
        color: axis.color ? data.map(d => d[axis.color]) : '#2563EB',
        size: 10, opacity: 0.8,
        colorscale: 'Viridis',
        showscale: !!axis.color,
        line: { color: 'white', width: 1 },
      },
    }];
  };

  const corrColor = (r: number) => {
    const a = Math.abs(r);
    if (a >= 0.7) return "text-emerald-600";
    if (a >= 0.4) return "text-amber-500";
    return "text-slate-500";
  };

  return (
    <section className="flex-1 bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-row min-h-0">
      {children}

      <div className="flex-1 p-4 flex flex-col min-h-0 min-w-0">
        {/* Controls row — min-w で3セレクト分の幅を確保、超えたら隠す */}
        <div className="mb-3 px-1 shrink-0 overflow-x-hidden">
          <div className="flex justify-between items-center gap-2 min-w-[520px]">
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('gradient')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  viewMode === 'gradient' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-500'
                }`}
              >SINGLE</button>
              <button
                onClick={() => setViewMode('category')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                  viewMode === 'category' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-500'
                }`}
              >MULTIPLE</button>
            </div>

            {columns.length > 0 && (
              <div className="flex gap-2 items-center">
                <select value={axis.x} onChange={e => setAxis({ ...axis, x: e.target.value })} className={selectCls}>
                  {columns.map(c => <option key={c} value={c}>X: {c}</option>)}
                </select>
                <select value={axis.y} onChange={e => setAxis({ ...axis, y: e.target.value })} className={selectCls}>
                  {columns.map(c => <option key={c} value={c}>Y: {c}</option>)}
                </select>
                {columns.length >= 3 && (
                  <select value={axis.color} onChange={e => setAxis({ ...axis, color: e.target.value })} className={selectCls}>
                    <option value="">(No Color)</option>
                    {columns.map(c => <option key={c} value={c}>Color: {c}</option>)}
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div
          className={`flex-1 min-h-0 min-w-0 bg-white rounded-lg relative overflow-hidden transition-all duration-150 ${
            isDragOver
              ? "border-2 border-dashed border-slate-400 bg-slate-50/60"
              : "border border-slate-200"
          }`}
          onDragOver={!hasValidData ? handleDragOver : undefined}
          onDragLeave={!hasValidData ? handleDragLeave : undefined}
          onDrop={!hasValidData ? handleDrop : undefined}
        >
          {hasValidData ? (
            <>
              <Plot
                {...({
                  ref: plotRef,
                  data: getPlotData(),
                  layout: {
                    autosize: true,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    margin: { t: 15, r: 15, b: 35, l: 45 },
                    font: { family: 'Inter, sans-serif', size: 10, color: '#1e293b' },
                    xaxis: { gridcolor: '#f1f5f9', zeroline: false, linecolor: '#e2e8f0' },
                    yaxis: { gridcolor: '#f1f5f9', zeroline: false, linecolor: '#e2e8f0' },
                    hovermode: 'closest',
                    dragmode: plotMode,
                    showlegend: viewMode === 'category',
                    legend: { font: { size: 10 }, itemclick: 'toggleothers' },
                  },
                  config: { displayModeBar: false, responsive: true },
                  style: { width: '100%', height: '100%' },
                  useResizeHandler: true,
                  onClick: (d: any) => {
                    const row = d.points[0]?.customdata;
                    if (row) onPointClick(row);
                  },
                } as any)}
              />
              {stats && <DraggableStatsBadge stats={stats} corrColor={corrColor} />}
            </>
          ) : (
            /* Empty state — 控えめなデザイン */
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 select-none">
              <UploadCloud
                size={28}
                strokeWidth={1.2}
                className={`transition-colors ${isDragOver ? "text-slate-500" : "text-slate-300"}`}
              />
              <p className={`text-[11px] font-medium transition-colors ${isDragOver ? "text-slate-600" : "text-slate-400"}`}>
                {isDragOver ? "Drop to import" : "Drop CSV here, or use Import / Paste"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
