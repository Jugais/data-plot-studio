// src/components/Header.tsx
import React from "react";

interface HeaderProps {
    title: string;
    children: React.ReactNode
}

export const Header = ({ title, children }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 flex justify-between items-center px-5 bg-white border-b border-slate-200 z-40">
      <h1 className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-cyan-500">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-500">Paste (⌘+V) or</label>
        {children}
      </div>
    </header>
  );
};