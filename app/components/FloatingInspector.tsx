// src/app/components/FloatingInspector.tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FloatingInspectorProps {
  selectedRows: Record<string, any>[];
  onClose: () => void;
}

export const FloatingInspector = ({ selectedRows, onClose }: FloatingInspectorProps) => {
  const show = selectedRows.length > 0;
  const isSingle = selectedRows.length === 1;
  const keys = show ? Object.keys(selectedRows[0]) : [];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          // すりガラス: DraggableStatsBadge と同系統のデザイン
          className="fixed top-16 right-6 z-[100] cursor-grab active:cursor-grabbing
            bg-white/70 backdrop-blur-md border border-white/80 shadow-lg rounded-xl p-4"
          style={{ width: isSingle ? 272 : Math.min(200 + selectedRows.length * 96, 560) }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                Inspector
              </h3>
              {!isSingle && (
                <span className="text-[10px] bg-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded font-mono font-semibold">
                  {selectedRows.length} rows
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="pointer-events-auto cursor-default overflow-auto max-h-80" style={{ maxWidth: '100%' }}>
            {isSingle ? (
              /* 単一選択: 縦リスト */
              <div className="space-y-1 text-[11px]">
                {keys.map(k => (
                  <div key={k} className="flex justify-between items-baseline gap-3 border-b border-slate-200/70 pb-1 last:border-0">
                    <span className="text-slate-400 font-medium truncate flex-1">{k}</span>
                    <span className="font-mono text-slate-700 break-all">
                      {selectedRows[0][k] === null ? (
                        <span className="text-slate-300">null</span>
                      ) : String(selectedRows[0][k])}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              /* 複数選択: 比較テーブル */
              <table className="text-[11px] border-collapse w-full">
                <thead>
                  <tr>
                    <th className="text-left pr-3 pb-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 sticky left-0 bg-white/60 backdrop-blur-sm z-10 whitespace-nowrap">
                      Field
                    </th>
                    {selectedRows.map((_, i) => (
                      <th key={i} className="pb-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-indigo-400 px-2 whitespace-nowrap">
                        #{i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keys.map(k => {
                    const vals = selectedRows.map(r => r[k]);
                    const allSame = vals.every(v => String(v) === String(vals[0]));
                    return (
                      <tr key={k} className="border-t border-slate-200/60">
                        <td className="pr-3 py-1 text-slate-400 font-medium sticky left-0 bg-white/60 backdrop-blur-sm z-10 whitespace-nowrap">
                          {k}
                        </td>
                        {vals.map((v, i) => (
                          <td
                            key={i}
                            className={`px-2 py-1 font-mono text-center whitespace-nowrap ${
                              allSame ? 'text-slate-400' : 'text-slate-700 font-semibold'
                            }`}
                          >
                            {v === null ? <span className="text-slate-300">null</span> : String(v)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!isSingle && (
            <p className="mt-2 text-[9px] text-slate-400 border-t border-slate-200/60 pt-2">
              Bold values differ between rows
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
