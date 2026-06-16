// src/app/components/Header.tsx
"use client";

import React, { useState } from "react";
import { HelpModal } from "@/app/components/HelpModal";
import { LayoutPanelLeft, LayoutPanelTop } from "lucide-react";
import type { Direction } from "@/app/components/PanelLayout";

interface HeaderProps {
  title: string;
  children: React.ReactNode;
  direction: Direction;
  onDirectionChange: (d: Direction) => void;
}

export const Header = ({ title, children, direction, onDirectionChange }: HeaderProps) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 flex justify-between items-center px-5 bg-white border-b border-slate-200 z-40">
        {/* Left: title + help */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-cyan-500">
            {title}
          </h1>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all text-sm font-bold"
            title="User Guide"
          >
            ?
          </button>
        </div>

        {/* Center: layout toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => onDirectionChange("vertical")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              direction === "vertical"
                ? "bg-white shadow-sm text-slate-700"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="Arrange vertically"
          >
            <LayoutPanelTop size={13} />
            <span>Vertical</span>
          </button>
          <button
            onClick={() => onDirectionChange("horizontal")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              direction === "horizontal"
                ? "bg-white shadow-sm text-slate-700"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="Arrange horizontally"
          >
            <LayoutPanelLeft size={13} />
            <span>Horizontal</span>
          </button>
        </div>

        {/* Right: paste hint + import button */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500">Paste (⌘+V) or</label>
          {children}
        </div>
      </header>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};
