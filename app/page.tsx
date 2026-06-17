// src/app/page.tsx
"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { AnimatePresence } from 'framer-motion';

import { LoadingState } from '@/app/components/LoadingState';
import { ToolBar, type PlotMode } from '@/app/components/ToolBar';
import { ImportButton } from '@/app/components/ImportButton';
import Papa from "papaparse";
import { Header } from '@/app/components/Header';
import { DataTable } from '@/app/components/DataTable';
import { FloatingInspector } from '@/app/components/FloatingInspector';
import { Footer } from '@/app/components/Footer';
import { PlotCanvas } from '@/app/components/PlotCanvas';
import { PanelLayout, type Direction } from '@/app/components/PanelLayout';

type DataRow = { [key: string]: any };

function calcStats(data: DataRow[], xKey: string, yKey: string) {
  const pairs = data
    .map(d => ({ x: Number(d[xKey]), y: Number(d[yKey]) }))
    .filter(p => isFinite(p.x) && isFinite(p.y));
  const n = pairs.length;
  if (n < 2) return null;
  const meanX = pairs.reduce((s, p) => s + p.x, 0) / n;
  const meanY = pairs.reduce((s, p) => s + p.y, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (const p of pairs) {
    const dx = p.x - meanX, dy = p.y - meanY;
    num += dx * dy; denX += dx * dx; denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return null;
  const r = num / Math.sqrt(denX * denY);
  return { r: parseFloat(r.toFixed(4)), r2: parseFloat((r * r).toFixed(4)), n };
}

/**
 * CSVパース後のヘッダー補完
 * - 空・null・"null" の列 → `Col_N`（N は 1-indexed の列番号）
 * - ただし最左列（index 0）が空の場合は `index` という名前にして行番号を注入
 * - 重複列名は `Name_2`, `Name_3` と連番を付与
 */
function fixHeaders(
  rawFields: string[],
  body: DataRow[]
): { headers: string[]; data: DataRow[] } {
  const isBlank = (s: string | null | undefined) =>
    s === null || s === undefined || s.trim() === "" || s.trim().toLowerCase() === "null";

  // 1. 各列の補完名を決める
  const nameCount: Record<string, number> = {};
  let firstColumnIsIndex = false;

  const headers = rawFields.map((f, i) => {
    let name: string;
    if (isBlank(f)) {
      name = i === 0 ? "index" : `Col_${i + 1}`;
      if (i === 0) firstColumnIsIndex = true;
    } else {
      name = f.trim();
    }
    return name;
  });

  // 2. 重複解消
  const seen: Record<string, number> = {};
  const deduped = headers.map(h => {
    if (seen[h] === undefined) {
      seen[h] = 1;
      return h;
    } else {
      seen[h]++;
      return `${h}_${seen[h]}`;
    }
  });

  // 3. 最左列が "index" なら行番号を注入
  let fixedBody = body;
  if (firstColumnIsIndex) {
    fixedBody = body.map((row, i) => {
      // PapaParseは空ヘッダーを "" や "_N" で返すことがある。
      // 元の空キーを削除して "index" キーで行番号を設定する
      const oldKey = rawFields[0]; // 元の空ヘッダー文字列
      const { [oldKey]: _removed, ...rest } = row as any;
      return { index: i + 1, ...rest };
    });
  }

  // 4. 元のキー名 → 新キー名 のマッピングでデータをリネーム
  // (firstColumnIsIndex 以外の補完列)
  const renamedBody = fixedBody.map(row => {
    const newRow: DataRow = {};
    rawFields.forEach((origKey, i) => {
      const newKey = deduped[i];
      if (i === 0 && firstColumnIsIndex) {
        newRow["index"] = (row as any)["index"]; // already set above
      } else {
        newRow[newKey] = (row as any)[origKey] ?? (row as any)[newKey];
      }
    });
    return newRow;
  });

  return { headers: deduped, data: renamedBody };
}

export default function PlotApp() {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DataRow[]>([]);
  const [axis, setAxis] = useState({ x: "", y: "", color: "" });
  const [plotMode, setPlotMode] = useState<PlotMode>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [direction, setDirection] = useState<Direction>("vertical");
  const plotRef = useRef<any>(null);

  const stats = useMemo(() => {
    if (!axis.x || !axis.y || data.length === 0) return null;
    return calcStats(data, axis.x, axis.y);
  }, [data, axis.x, axis.y]);

  const handlePlotResize = useCallback(() => {
    if (!plotRef.current?.el) return;
    const Plotly = (window as any).Plotly;
    if (Plotly) Plotly.Plots.resize(plotRef.current.el);
  }, []);

  const parseData = useCallback((text: string) => {
    if (!text || text.trim() === "") return;
    setIsLoading(true);
    setSelectedRows([]);
    // @ts-ignore
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawFields = results.meta.fields || [];
        const rawBody = results.data as DataRow[];

        const { headers, data: fixedData } = fixHeaders(rawFields, rawBody);

        setColumns(headers);
        setData(fixedData);
        if (headers.length > 0 && fixedData.length > 0) {
          setAxis({ x: headers[0], y: headers[1] ?? headers[0], color: "" });
        }
        setTimeout(() => setIsLoading(false), 2000);
      },
      error: (error: Papa.ParseError) => {
        console.error("PapaParse Error:", error);
        setIsLoading(false);
      }
    });
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    const pasteData = e.clipboardData.getData('text');
    if (pasteData) parseData(pasteData);
  }, [parseData]);

  const columnHelper = createColumnHelper<DataRow>();
  const tableColumns = useMemo(() =>
    columns.map(col => columnHelper.accessor(col, {
      header: col,
      enableSorting: true,
      cell: info => {
        const rowIndex = info.row.index;
        // data から直接読む（info.getValue() は再レンダー時に stale になることがある）
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const externalValue = React.useMemo(() => {
          const v = data[rowIndex]?.[col];
          return v === null || v === undefined ? "" : String(v);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [data, rowIndex]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [localValue, setLocalValue] = React.useState<string>(externalValue);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isFocused, setIsFocused] = React.useState(false);

        // フォーカス中は外部値で上書きしない
        // eslint-disable-next-line react-hooks/rules-of-hooks
        React.useEffect(() => {
          if (!isFocused) setLocalValue(externalValue);
        }, [externalValue, isFocused]);

        const commit = () => {
          const castedValue = localValue === "" ? null : !isNaN(Number(localValue)) ? Number(localValue) : localValue;
          setData(old => old.map((row, idx) =>
            idx === rowIndex ? { ...row, [col]: castedValue } : row
          ));
        };

        return (
          <input
            className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 w-full px-3 py-1.5 font-mono text-[11px] text-slate-800"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => { setIsFocused(false); commit(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.currentTarget.blur(); }
              if (e.key === "Escape") { setLocalValue(externalValue); e.currentTarget.blur(); }
            }}
          />
        );
      }
    })),
  [columns, columnHelper, data]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    columnResizeMode: 'onChange',
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleToolbarAction = (action: string) => {
    // モード切替はプロットがなくても受け付ける
    if (action === 'pan' || action === 'select') {
      const newMode = action as PlotMode;
      setPlotMode(newMode);
      if (plotRef.current?.el) {
        const Plotly = (window as any).Plotly;
        const dm = newMode === 'pan' ? 'pan' : 'zoom';
        // dragmode だけ relayout — range には触れずズームスケールを維持
        Plotly.relayout(plotRef.current.el, { dragmode: dm });
      }
      return;
    }
    if (!plotRef.current) return;
    const Plotly = (window as any).Plotly;
    const graphDiv = plotRef.current.el;
    const xRange = graphDiv.layout.xaxis.range;
    const yRange = graphDiv.layout.yaxis.range;
    switch (action) {
      case 'zoomIn':
        Plotly.relayout(graphDiv, {
          'xaxis.range': [xRange[0] + (xRange[1] - xRange[0]) * 0.1, xRange[1] - (xRange[1] - xRange[0]) * 0.1],
          'yaxis.range': [yRange[0] + (yRange[1] - yRange[0]) * 0.1, yRange[1] - (yRange[1] - yRange[0]) * 0.1],
        }); break;
      case 'zoomOut':
        Plotly.relayout(graphDiv, {
          'xaxis.range': [xRange[0] - (xRange[1] - xRange[0]) * 0.125, xRange[1] + (xRange[1] - xRange[0]) * 0.125],
          'yaxis.range': [yRange[0] - (yRange[1] - yRange[0]) * 0.125, yRange[1] + (yRange[1] - yRange[0]) * 0.125],
        }); break;
      case 'reset':
        Plotly.relayout(graphDiv, { 'xaxis.autorange': true, 'yaxis.autorange': true }); break;
      case 'toggleGrid':
        setShowGrid(prev => !prev);
        break;
      case 'download':
        // 表示中の状態をそのままダウンロード
        Plotly.downloadImage(graphDiv, {
          format: 'png',
          width: 800,
          height: 560,
          filename: `plot_${axis.x}_${axis.y}`,
        });
        break;
    }
  };

  return (
    <div
      className="h-screen flex flex-col bg-white text-slate-950 font-sans antialiased overflow-hidden"
      onPaste={handlePaste}
    >
      <AnimatePresence>{isLoading && <LoadingState />}</AnimatePresence>
      <Header title="Data Plot Studio" direction={direction} onDirectionChange={setDirection}>
        <ImportButton onUpload={parseData}>Import CSV</ImportButton>
      </Header>

      <main className="pt-14 p-5 flex flex-col flex-1 min-h-0 overflow-hidden">
        <PanelLayout
          direction={direction}
          onPlotResize={handlePlotResize}
          plotPanel={
            <PlotCanvas
              data={data}
              columns={columns}
              axis={axis}
              setAxis={setAxis}
              plotMode={plotMode}
              onPointClick={(row) => setSelectedRows([row])}
              onToggleSelect={(row) => {
                setSelectedRows(prev =>
                  prev.includes(row) ? prev.filter(r => r !== row) : [...prev, row]
                );
              }}
              plotRef={plotRef}
              stats={stats}
              onUpload={parseData}
              selectedRows={selectedRows}
              showGrid={showGrid}
            >
              <ToolBar plotMode={plotMode} showGrid={showGrid} onAction={handleToolbarAction} />
            </PlotCanvas>
          }
          tablePanel={
            <DataTable table={table} dataLength={data.length} selectedRows={selectedRows} />
          }
        />
      </main>

      <FloatingInspector selectedRows={selectedRows} onClose={() => setSelectedRows([])} />
      <Footer />
    </div>
  );
}
