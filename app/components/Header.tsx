// src/components/Header.tsx
import React, { useState } from "react";
import { HelpModal } from "@/app/components/HelpModal";

interface HeaderProps {
    title: string;
    children: React.ReactNode
}

export const Header = ({ title, children }: HeaderProps) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  return (
    <>
    <header className="fixed top-0 left-0 right-0 h-14 flex justify-between items-center px-5 bg-white border-b border-slate-200 z-40">
      <div className="flex items-center">
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-cyan-500">
          {title}
        </h1>
        {/* ヘルプボタン */}
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="ml-3 w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all text-sm font-bold"
          title="使い方を見る"
        >
          ?
        </button>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-500">Paste (⌘+V) or</label>
        {children}
      </div>
    </header>
    <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};