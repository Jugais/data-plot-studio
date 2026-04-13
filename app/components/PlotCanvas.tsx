// src/components/PlotCanvas.tsx
"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { UploadCloud } from 'lucide-react';

// PlotlyはSSR不可なのでdynamic import
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type ViewMode = "gradient" | "category";


interface PlotCanvasProps {
  data: any[];
  columns: string[];
  axis: { x: string; y: string; color: string };
  setAxis: (axis: { x: string; y: string; color: string }) => void;
  plotMode: string;
  onPointClick: (row: any) => void;
  plotRef: any;
  children: React.ReactNode;
}

export const PlotCanvas: React.FC<PlotCanvasProps> = ({
  data,
  columns,
  axis,
  setAxis,
  plotMode,
  onPointClick,
  plotRef, 
  children
}) => {
  const hasValidData = data.length > 0 && axis.x && axis.y;
  const styles = {
    select: "bg-white border border-slate-300 text-[12px] font-medium rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all",
  }
  const [viewMode, setViewMode] = useState<ViewMode>('gradient');
  // Plotlyに渡すデータを計算するロジック
  const getPlotData = () => {
    if (data.length === 0 || !axis.x || !axis.y) return [];

    // カテゴリカルモードの場合
    if (viewMode === 'category' && axis.color) {
      // 1. 第3軸（color）に含まれるユニークなラベルを抽出
      const categories = Array.from(new Set(data.map(d => String(d[axis.color]))));
      
      // 2. カテゴリごとにトレースを作成
      return categories.map(cat => ({
        name: cat,
        x: data.filter(d => String(d[axis.color]) === cat).map(d => d[axis.x]),
        y: data.filter(d => String(d[axis.color]) === cat).map(d => d[axis.y]),
        mode: 'markers',
        type: 'scatter',
        marker: { size: 10, opacity: 0.8, line: { color: 'white', width: 0.5 } },
        text: cat, // hover
      }));
    }

    // 単一のトレース
    return [{
      x: data.map(d => d[axis.x]),
      y: data.map(d => d[axis.y]),
      mode: 'markers',
      type: 'scatter',
      marker: { 
        color: axis.color ? data.map(d => d[axis.color]) : '#2563EB',
        size: 10,
        opacity: 0.8,
        colorscale: 'Viridis',
        showscale: !!axis.color,
        line: { color: 'white', width: 1 }
      },
    }];
  };
  return (
    <section className={`flex-[1.5] bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-row`}>
      {children}

      <div className="flex-1 p-4 flex flex-col">
        {/* Header: Visualisation title & Axis Selectors */}
        <div className="flex justify-between items-center mb-3 px-1">
          {/* スイッチ（タブ風）UI */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('gradient')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                viewMode === 'gradient' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-500'
              }`}
            >
              SINGLE
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                viewMode === 'category' ? 'bg-white shadow-sm text-cyan-600' : 'text-slate-500'
              }`}
            >
              MULTIPLE
            </button>
          </div>
        

          {columns.length > 0 && (
            <div className="flex gap-2 items-center">
              <select
                value={axis.x}
                onChange={(e) => setAxis({ ...axis, x: e.target.value })}
                className={styles.select}
              >
                {columns.map(c => <option key={c} value={c}>X: {c}</option>)}
              </select>
              <select
                value={axis.y}
                onChange={(e) => setAxis({ ...axis, y: e.target.value })}
                className={styles.select}
              >
                {columns.map(c => <option key={c} value={c}>Y: {c}</option>)}
              </select>
              {columns.length >= 3 && (
                <select
                  value={axis.color}
                  onChange={(e) => setAxis({ ...axis, color: e.target.value })}
                  className={styles.select}
                >
                  <option value="">(No Color)</option>
                  {columns.map(c => <option key={c} value={c}>Color: {c}</option>)}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 min-h-0 bg-white rounded-lg border border-slate-200 relative overflow-hidden">
          {hasValidData ? (
          <Plot
            {...({
              ref: plotRef,
              data: getPlotData(),
              layout: {
                autosize: true,
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                margin: { t: 15, r: 15, b: 35, l: 45 },
                font: { 
                  family: 'Inter, sans-serif', 
                  size: 10, 
                  color: '#1e293b'
                },
                xaxis: { gridcolor: '#f1f5f9', zeroline: false, linecolor: '#e2e8f0' },
                yaxis: { gridcolor: '#f1f5f9', zeroline: false, linecolor: '#e2e8f0' },
                hovermode: 'closest',
                dragmode: plotMode,
                showlegend: viewMode === 'category',
                legend: {
                  font: { size: 10 },
                  itemclick: 'toggleothers',
                },
              },
              config: { displayModeBar: false, responsive: true },
              style: { width: '100%', height: '100%' },
              useResizeHandler: true,
              onClick: (d: any) => {
                if (d.points[0]) onPointClick(data[d.points[0].pointIndex]);
              },
            } as any)} // ← ここで Props 全体を any として流し込む
          />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <UploadCloud size={32} strokeWidth={1.5} />
              <p className="text-xs font-medium">Import CSV or Paste data to visualize</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};