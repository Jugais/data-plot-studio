// src/app/components/DataTable.tsx
"use client";

import { flexRender, Table } from "@tanstack/react-table";
import { useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface DataTableProps {
  table: Table<any>;
  dataLength: number;
  selectedRows: any[];
}

export const DataTable = ({ table, dataLength, selectedRows }: DataTableProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const firstSelectedRef = useRef<HTMLTableRowElement>(null);

  // 選択行 Set（高速検索用）
  const selectedSet = new Set(selectedRows);

  // 選択が変わったら最初の選択行へスクロール
  useEffect(() => {
    if (selectedRows.length > 0 && firstSelectedRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const row = firstSelectedRef.current;
      const containerRect = container.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const scrollTop =
        container.scrollTop +
        (rowRect.top - containerRect.top) -
        containerRect.height / 2 +
        rowRect.height / 2;
      container.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, [selectedRows]);

  const SortIcon = ({ col }: { col: any }) => {
    const sorted = col.getIsSorted();
    if (sorted === "asc") return <ChevronUp size={10} className="text-blue-500 shrink-0" />;
    if (sorted === "desc") return <ChevronDown size={10} className="text-blue-500 shrink-0" />;
    return <ChevronsUpDown size={10} className="text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

  const visibleRows = table.getRowModel().rows;

  let firstSelected = true;

  return (
    <section className="flex-1 bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
      {dataLength > 0 ? (
        <div ref={scrollContainerRef} className="overflow-auto flex-1 text-[11px] font-mono bg-white">
          <table
            className="border-collapse"
            style={{ width: table.getTotalSize(), minWidth: "100%", tableLayout: "fixed" }}
          >
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10 border-b border-slate-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="relative text-left p-0 font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-100 last:border-r-0"
                      style={{ width: header.getSize() }}
                    >
                      <div
                        className={`group flex items-center gap-1 px-3 py-2 overflow-hidden ${
                          header.column.getCanSort() ? "cursor-pointer select-none hover:bg-slate-100" : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span className="truncate flex-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && <SortIcon col={header.column} />}
                      </div>
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none z-20 ${
                          header.column.getIsResizing() ? "bg-blue-500" : "bg-transparent hover:bg-slate-300"
                        }`}
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map(row => {
                const isSelected = selectedSet.has(row.original);
                const isFirst = isSelected && firstSelected;
                if (isFirst) firstSelected = false;

                return (
                  <tr
                    key={row.id}
                    ref={isFirst ? firstSelectedRef : null}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-indigo-50 outline outline-1 outline-indigo-200 outline-offset-[-1px]"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-0 border-r border-slate-100 last:border-r-0" style={{ width: cell.column.getSize() }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 bg-white">
          <p className="text-xs font-medium uppercase">No data uploaded</p>
        </div>
      )}
    </section>
  );
};
