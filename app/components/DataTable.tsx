// src/components/DataTable.tsx
"use client";

import { flexRender, Table } from "@tanstack/react-table";

interface DataTableProps {
  table: Table<any>;
  dataLength: number;
  selectedRow?: any;
}

export const DataTable = ({ table, dataLength, selectedRow }: DataTableProps) => {
  return (
    <section className="flex-1 bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {dataLength > 0 ? (
        <div className="overflow-x-auto flex-1 text-[11px] font-mono bg-white">
          <table 
            className="border-collapse"
            style={{
              minWidth: '100%', 
              width: table.getTotalSize(), 
              tableLayout: 'fixed' 
            }}
          >
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10 border-b border-slate-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="relative text-left p-0 font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-100 last:border-r-0"
                      // 最初は自動計算されたサイズが適用されます
                      style={{ width: header.getSize() }}
                    >
                      {/* ヘッダーの中身にパディングを持たせるためのラッパー */}
                      <div className="px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>

                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none z-20 ${
                          header.column.getIsResizing() 
                            ? 'bg-blue-500 opacity-100' 
                            : 'bg-transparent hover:bg-slate-300 opacity-100'
                        }`}
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map(row => {
                const isSelected = selectedRow && row.original === selectedRow;
                return (
                  <tr 
                    key={row.id} 
                    className={`transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-slate-50/50"
                    }`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td 
                        key={cell.id} 
                        className="p-0 border-r border-slate-100 last:border-r-0"
                        style={{ width: cell.column.getSize() }}
                      >
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
