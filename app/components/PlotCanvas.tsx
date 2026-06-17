// src/app/components/PlotCanvas.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { UploadCloud } from 'lucide-react';
import type { PlotMode } from './ToolBar';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type ViewMode = "gradient" | "category";
interface Stats { r: number; r2: number; n: number; }

interface PlotCanvasProps {
  data: any[];
  columns: string[];
  axis: { x: string; y: string; color: string };
  setAxis: (axis: { x: string; y: string; color: string }) => void;
  plotMode: PlotMode;
  onPointClick: (row: any) => void;
  onToggleSelect: (row: any) => void;
  plotRef: any;
  children: React.ReactNode;
  stats: Stats | null;
  onUpload: (text: string) => void;
  selectedRows: any[];
  showGrid: boolean;
}

// ---- Draggable stats badge (左上) ----
const DraggableStatsBadge: React.FC<{ stats: Stats; corrColor: (r: number) => string }> = ({
  stats, corrColor,
}) => {
  const [pos, setPos] = useState({ x: 10, y: 10 });
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
        x: Math.max(0, startPos.current.x + (ev.clientX - startMouse.current.x)),
        y: Math.max(0, startPos.current.y + (ev.clientY - startMouse.current.y)),
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
      className="absolute flex gap-3 items-center bg-white/60 backdrop-blur-md border border-white/80 rounded-lg px-3 py-1.5 shadow-md cursor-grab active:cursor-grabbing select-none"
      style={{ left: pos.x, top: pos.y, zIndex: 20 }}
      onMouseDown={onMouseDown}
    >
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">r</span>
        <span className={`text-[13px] font-bold font-mono leading-tight ${corrColor(stats.r)}`}>
          {stats.r.toFixed(3)}
        </span>
      </div>
      <div className="w-px h-6 bg-slate-200" />
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">r²</span>
        <span className={`text-[13px] font-bold font-mono leading-tight ${corrColor(Math.sqrt(stats.r2))}`}>
          {stats.r2.toFixed(3)}
        </span>
      </div>
    </div>
  );
};

// ---- Cycling hint with animated upload zone ----
const HINTS = [
  { text: "Drop CSV here", sub: "drag & drop your file" },
  { text: "Import CSV", sub: "click the icon above" },
  { text: "Paste (⌘V)", sub: "paste from clipboard" },
];

const EmptyState: React.FC<{
  isDragOver: boolean;
  onFileSelect: (text: string) => void;
}> = ({ isDragOver, onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hintIdx, setHintIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [iconHover, setIconHover] = useState(false);

  // ヒントのサイクル
  useEffect(() => {
    if (isDragOver) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setHintIdx(i => (i + 1) % HINTS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(id);
  }, [isDragOver]);

  // ファイル読み込み
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (!(result instanceof ArrayBuffer)) return;
      const uint8 = new Uint8Array(result);
      let text: string;
      try { text = new TextDecoder("utf-8", { fatal: true }).decode(uint8); }
      catch { text = new TextDecoder("shift-jis").decode(uint8); }
      onFileSelect(text);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  if (isDragOver) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none">
        <div className="p-5 rounded-2xl border-2 border-dashed border-slate-400 bg-slate-50">
          <UploadCloud size={32} strokeWidth={1.5} className="text-slate-500" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Drop to import</p>
      </div>
    );
  }

  const hint = HINTS[hintIdx];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 select-none">
      {/* Clickable animated icon */}
      <button
        onClick={() => fileInputRef.current?.click()}
        onMouseEnter={() => setIconHover(true)}
        onMouseLeave={() => setIconHover(false)}
        className="group relative flex items-center justify-center focus:outline-none"
        title="Click to import CSV"
      >
        {/* 外側リング — hover時に拡大 */}
        <span
          className="absolute rounded-full border border-slate-200 transition-all duration-500"
          style={{
            width: iconHover ? 72 : 56,
            height: iconHover ? 72 : 56,
            opacity: iconHover ? 1 : 0.5,
          }}
        />
        {/* pulse ring */}
        <span className="absolute rounded-full bg-slate-100 animate-ping opacity-20"
          style={{ width: 48, height: 48 }} />
        {/* アイコン本体 */}
        <span
          className="relative flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm transition-all duration-200"
          style={{
            width: 44,
            height: 44,
            transform: iconHover ? 'scale(1.08)' : 'scale(1)',
            boxShadow: iconHover ? '0 4px 18px rgba(0,0,0,0.10)' : undefined,
          }}
        >
          <UploadCloud
            size={20}
            strokeWidth={1.5}
            className={`transition-colors duration-200 ${iconHover ? "text-slate-600" : "text-slate-400"}`}
          />
        </span>
      </button>

      {/* Cycling hint text */}
      <div className="flex flex-col items-center gap-0.5" style={{ height: 36 }}>
        <p
          className="text-[12px] font-semibold text-slate-500 transition-all duration-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(5px)' }}
        >
          {hint.text}
        </p>
        <p
          className="text-[10px] text-slate-300 transition-all duration-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(5px)' }}
        >
          {hint.sub}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
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
      try { resolve(new TextDecoder("utf-8", { fatal: true }).decode(uint8)); }
      catch { resolve(new TextDecoder("shift-jis").decode(uint8)); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

// ---- Main component ----
export const PlotCanvas: React.FC<PlotCanvasProps> = ({
  data, columns, axis, setAxis, plotMode, onPointClick, onToggleSelect,
  plotRef, children, stats, onUpload, selectedRows, showGrid,
}) => {
  const hasValidData = data.length > 0 && axis.x && axis.y;
  const [viewMode, setViewMode] = useState<ViewMode>('gradient');
  const [isDragOver, setIsDragOver] = useState(false);

  const selectCls = "bg-white border border-slate-300 text-[12px] font-medium rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shrink-0";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try { onUpload(await decodeFile(file)); }
    catch (err) { console.error("D&D file read error:", err); }
  };

  const corrColor = (r: number) => {
    const a = Math.abs(r);
    if (a >= 0.7) return "text-emerald-600";
    if (a >= 0.4) return "text-amber-500";
    return "text-slate-500";
  };

  // 選択行のインデックスセット
  const selectedSet = new Set(selectedRows.map(r => data.indexOf(r)));

  const getPlotData = () => {
    if (data.length === 0 || !axis.x || !axis.y) return [];
    const baseTraces: any[] = [];

    if (viewMode === 'category' && axis.color) {
      const categories = Array.from(new Set(data.map(d => String(d[axis.color]))));
      categories.forEach(cat => {
        const idxs = data.reduce<number[]>((acc, d, i) => {
          if (String(d[axis.color]) === cat) acc.push(i); return acc;
        }, []);
        baseTraces.push({
          name: cat,
          x: idxs.map(i => data[i][axis.x]),
          y: idxs.map(i => data[i][axis.y]),
          mode: 'markers', type: 'scattergl',
          customdata: idxs.map(i => data[i]),
          marker: { size: 10, opacity: 0.8, line: { color: 'white', width: 0.5 } },
          text: cat,
        });
      });
    } else {
      baseTraces.push({
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
      });
    }

    // 選択点ハイライト（複数対応）
    if (selectedRows.length > 0) {
      const selData = selectedRows.filter(r => data.includes(r));
      if (selData.length > 0) {
        // glow
        baseTraces.push({
          x: selData.map(r => r[axis.x]),
          y: selData.map(r => r[axis.y]),
          mode: 'markers', type: 'scattergl',
          name: 'sel_glow', showlegend: false, hoverinfo: 'skip',
          marker: {
            size: 26,
            color: 'rgba(99,102,241,0.15)',
            line: { color: 'rgba(99,102,241,0.3)', width: 2 },
          },
        });
        // core
        baseTraces.push({
          x: selData.map(r => r[axis.x]),
          y: selData.map(r => r[axis.y]),
          mode: 'markers', type: 'scattergl',
          name: 'sel_core', showlegend: false, hoverinfo: 'skip',
          marker: {
            size: 13,
            color: '#6366f1',
            line: { color: 'white', width: 2 },
          },
        });
      }
    }

    return baseTraces;
  };

  // Plotly の dragmode マッピング
  // select モードは zoom ベース（スクロールズーム有効、クリックで点選択）
  const plotlyDragMode = plotMode === 'pan' ? 'pan' : 'zoom';

  return (
    <section className="flex-1 bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-row min-h-0">
      {children}

      <div className="flex-1 p-4 flex flex-col min-h-0 min-w-0">
        {/* Controls row */}
        <div className="mb-3 px-1 shrink-0 overflow-x-hidden">
          <div className="flex justify-between items-center gap-2 min-w-[520px]">
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button onClick={() => setViewMode('gradient')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'gradient' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-500'}`}
              >SINGLE</button>
              <button onClick={() => setViewMode('category')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${viewMode === 'category' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-500'}`}
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
            isDragOver ? "border-2 border-dashed border-slate-400 bg-slate-50/60" : "border border-slate-200"
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
                    xaxis: { showgrid: showGrid, gridcolor: '#f1f5f9', zeroline: false, linecolor: '#e2e8f0' },
                    yaxis: { showgrid: showGrid, gridcolor: '#f1f5f9', zeroline: false, linecolor: '#e2e8f0' },
                    hovermode: 'closest',
                    dragmode: plotlyDragMode,
                    showlegend: viewMode === 'category',
                    legend: { font: { size: 10 }, itemclick: 'toggleothers' },
                    // select モード時のハイライト色
                    newselection: { line: { color: '#6366f1', width: 1.5 } },
                    activeselection: { fillcolor: 'rgba(99,102,241,0.08)' },
                  } as any,
                  config: { displayModeBar: false, responsive: true },
                  style: { width: '100%', height: '100%' },
                  useResizeHandler: true,
                  onClick: (d: any) => {
                    const row = d.points[0]?.customdata;
                    if (!row || !data.includes(row)) return; // glow/core トレースは skip
                    if (plotMode === 'select') {
                      onToggleSelect(row); // select モード: トグル追加/除去
                    } else {
                      onPointClick(row);   // 通常モード: 単一選択
                    }
                  },
                } as any)}
              />
              {stats && <DraggableStatsBadge stats={stats} corrColor={corrColor} />}

              {/* select モード中バッジ */}
              {plotMode === 'select' && (
                <div className="absolute top-2 right-2 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-0.5 text-[10px] font-semibold text-indigo-600 select-none pointer-events-none">
                  {selectedRows.length > 0 ? `${selectedRows.length} selected` : "Click points to select"}
                </div>
              )}
            </>
          ) : (
            <EmptyState isDragOver={isDragOver} onFileSelect={onUpload} />
          )}
        </div>
      </div>
    </section>
  );
};
