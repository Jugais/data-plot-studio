// src/components/ToolBar.tsx

import { Download, Hand, Search, Target, ZoomIn, ZoomOut } from "lucide-react";

interface ToolBarProps {
  plotMode: "zoom" | "pan";
  onAction: (action: string) => void;
}


export const ToolBar = ({plotMode, onAction}: ToolBarProps) => {
  const btnClass = (active: boolean) => 
    `p-2 rounded-lg transition-colors ${
      active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`;
  return (
    <div className="w-12 border-r border-slate-200 bg-white flex flex-col items-center py-3 gap-1 shrink-0">
      
      <button onClick={() => onAction('zoom')} className={btnClass(plotMode === 'zoom')} title="Zoom mode">
        <Search size={18} />
      </button>
      <button onClick={() => onAction('pan')} className={btnClass(plotMode === 'pan')} title="Pan mode (Hand)">
        <Hand size={18} />
      </button>
      
      <div className="h-px w-6 bg-slate-200 my-1" />

      <button onClick={() => onAction('zoomIn')} className={btnClass(false)} title="Zoom In">
        <ZoomIn size={18} />
      </button>
      <button onClick={() => onAction('zoomOut')} className={btnClass(false)} title="Zoom Out">
        <ZoomOut size={18} />
      </button>
      <button onClick={() => onAction('reset')} className={btnClass(false)} title="Reset Axes">
        <Target size={18} />
      </button>

      <div className="h-px w-6 bg-slate-200 my-1" />

      <button onClick={() => onAction('download')} className={btnClass(false)} title="Save as PNG (No Grid)">
        <Download size={18} />
      </button>
    </div>
  )
}

