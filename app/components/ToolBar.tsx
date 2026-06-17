// src/app/components/ToolBar.tsx
import { Download, Grid2x2, Grid2x2X, Hand, MousePointer2, Target, ZoomIn, ZoomOut } from "lucide-react";

export type PlotMode = "pan" | "select";

interface ToolBarProps {
  plotMode: PlotMode;
  showGrid: boolean;
  onAction: (action: string) => void;
}

export const ToolBar = ({ plotMode, showGrid, onAction }: ToolBarProps) => {
  const btn = (active: boolean) =>
    `p-2 rounded-lg transition-colors ${
      active
        ? "bg-indigo-50 text-indigo-600"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    }`;

  return (
    <div className="w-12 border-r border-slate-200 bg-white flex flex-col items-center py-3 gap-1 shrink-0">
      <button onClick={() => onAction("select")} className={btn(plotMode === "select")} title="Select mode — click to select points">
        <MousePointer2 size={18} />
      </button>
      <button onClick={() => onAction("pan")} className={btn(plotMode === "pan")} title="Pan mode — drag to move">
        <Hand size={18} />
      </button>

      <div className="h-px w-6 bg-slate-200 my-1" />

      <button onClick={() => onAction("zoomIn")} className={btn(false)} title="Zoom In">
        <ZoomIn size={18} />
      </button>
      <button onClick={() => onAction("zoomOut")} className={btn(false)} title="Zoom Out">
        <ZoomOut size={18} />
      </button>
      <button onClick={() => onAction("reset")} className={btn(false)} title="Reset Axes">
        <Target size={18} />
      </button>

      <div className="h-px w-6 bg-slate-200 my-1" />

      <button
        onClick={() => onAction("toggleGrid")}
        className={btn(showGrid)}
        title={showGrid ? "Hide grid" : "Show grid"}
      >
        {showGrid ? <Grid2x2 size={18} /> : <Grid2x2X size={18} />}
      </button>

      <div className="h-px w-6 bg-slate-200 my-1" />

      <button onClick={() => onAction("download")} className={btn(false)} title="Save as PNG">
        <Download size={18} />
      </button>
    </div>
  );
};
