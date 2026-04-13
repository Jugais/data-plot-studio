// src/app/page.tsx
"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { AnimatePresence } from 'framer-motion';

import { LoadingState } from '@/app/components/LoadingState';
import { ToolBar } from '@/app/components/ToolBar';
import { ImportButton } from '@/app/components/ImportButton';

import Papa from "papaparse";
import { Header } from '@/app/components/Header';
import { DataTable } from '@/app/components/DataTable';
import { FloatingInspector } from '@/app/components/FloatingInspector';
import { Footer } from '@/app/components/Footer';
import { PlotCanvas } from '@/app/components/PlotCanvas';

type DataRow = { [key: string]: any };

export default function PlotApp() {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DataRow | null>(null);
  const [axis, setAxis] = useState({ x: "", y: "", color: "" });
  
  const [plotMode, setPlotMode] = useState<'zoom' | 'pan'>('zoom');
  const plotRef = useRef<any>(null); // PlotlyインスタンスへのRef

  const parseData = useCallback((text: string) => {
    if (!text || text.trim() === "") return;

    setIsLoading(true);
    setSelectedRow(null);
    // @ts-ignore
    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      
      complete: (results) => {
        const headers = results.meta.fields || [];
        const body = results.data as DataRow[];

        setColumns(headers);
        setData(body);

        if (headers.length > 0 && body.length > 0) {
            setAxis({
              x: headers[0],
              y: headers[1],
              color: ""
            });
          }
        
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      },
      error: (error:Papa.ParseError) => {
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

  // Table
  const columnHelper = createColumnHelper<DataRow>();
  const tableColumns = useMemo(() => 
    columns.map(col => columnHelper.accessor(col, {
      header: col,
      cell: info => (
        <input 
          className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 w-full px-3 py-1.5 font-mono text-[11px] text-slate-800"
          value={info.getValue() ?? ""}
          onChange={(e) => {
            const newValue = e.target.value;
            const castedValue = newValue === "" ? null : !isNaN(Number(newValue)) ? Number(newValue) : newValue;
            setData(old => old.map((row, index) => index === info.row.index ? { ...row, [col]: castedValue } : row));
          }}
        />
      )
    })), [columns, columnHelper]);

  const table = useReactTable({
    data, 
    columns: tableColumns, 
    getCoreRowModel: getCoreRowModel(),
  });

  const handleToolbarAction = (action: string) => {
    if (!plotRef.current) return;
    const Plotly = (window as any).Plotly; // グローバルPlotlyインスタンスを取得
    const graphDiv = plotRef.current.el;

    const xRange = graphDiv.layout.xaxis.range;
    const yRange = graphDiv.layout.yaxis.range;
    
    switch(action) {
      case 'pan': setPlotMode('pan'); break;
      case 'zoom': setPlotMode('zoom'); break;
      case 'zoomIn': 
        Plotly.relayout(graphDiv, {
          'xaxis.range': [xRange[0] + (xRange[1] - xRange[0]) * 0.1, xRange[1] - (xRange[1] - xRange[0]) * 0.1],
          'yaxis.range': [yRange[0] + (yRange[1] - yRange[0]) * 0.1, yRange[1] - (yRange[1] - yRange[0]) * 0.1]
        });
        break;
      case 'zoomOut': 
        Plotly.relayout(graphDiv, {
          'xaxis.range': [xRange[0] - (xRange[1] - xRange[0]) * 0.125, xRange[1] + (xRange[1] - xRange[0]) * 0.125],
          'yaxis.range': [yRange[0] - (yRange[1] - yRange[0]) * 0.125, yRange[1] + (yRange[1] - yRange[0]) * 0.125]
        });
        break;
      case 'reset': 
        Plotly.relayout(graphDiv, { 'xaxis.autorange': true, 'yaxis.autorange': true }); 
        break;
      case 'download':
        Plotly.downloadImage(graphDiv, {
          format: 'png',
          width: 1200,
          height: 800,
          filename: 'atomic_plot_export'
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
      <Header title='Data Plot Studio'>
        <ImportButton onUpload={parseData}>Import CSV</ImportButton>
      </Header>

      <main className="mt-4 pt-14 p-5 flex flex-col gap-5 h-screen">
        <PlotCanvas 
          data={data}
          columns={columns}
          axis={axis}
          setAxis={setAxis}
          plotMode={plotMode}
          onPointClick={setSelectedRow}
          plotRef={plotRef}
        >
          <ToolBar plotMode={plotMode} onAction={handleToolbarAction}/>
        </PlotCanvas>
        <DataTable table={table} dataLength={data.length}/>
      </main>
      
      <FloatingInspector selectedRow={selectedRow} onClose={() => setSelectedRow(null)}/>
      <Footer />
    </div>
  );
}

