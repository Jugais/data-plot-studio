// src/components/DataTable.tsx

import { flexRender, Table } from "@tanstack/react-table";

interface DataTableProps {
  table: Table<any>;
  dataLength: number;
}

export const DataTable = ({table, dataLength}: DataTableProps) => {
  return (
    <section className="flex-1 bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {dataLength > 0 ?(
        <div className="overflow-auto flex-1 text-[11px] font-mono bg-white">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10 border-b border-slate-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="text-left p-3 font-semibold text-slate-600 uppercase tracking-wider border-r border-slate-100 last:border-r-0">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-0 border-r border-slate-100 last:border-r-0">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>): (
          // show placeholder
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 bg-white">
            <p className="text-xs font-medium uppercase">No data uploaded</p>
          </div>
        )}
    </section> 
  )
}
