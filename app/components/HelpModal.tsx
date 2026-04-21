// app/components/HelpModal.tsx
import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[540px] max-w-[95%] overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">User Guide</h2>
            <p className="text-xs text-slate-500 mt-1">Master the Data Plot Studio workflow</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            &times;
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8 space-y-6 text-slate-600 overflow-y-auto max-h-[70vh]">
          <section className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Import Your Data</h3>
              <p className="text-sm leading-relaxed">
                Paste your data into the upload zone directly or click Import CSV button to upload your file. 
                We support both <b>UTF-8</b> and <b>Shift-JIS</b> encodings automatically.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Data Grid Editing</h3>
              <p className="text-sm leading-relaxed">View your raw data in the interactive table. You can directly edit cell values, and the changes will reflect in your plots instantly.</p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">3</div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Visual Analytics</h3>
              <p className="text-sm leading-relaxed">Switch to the "Visualization" tab. Select your X and Y axes from the dropdown menus to generate high-quality charts.</p>
            </div>
          </section>

          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700 leading-tight">
              <b>Pro Tip:</b> If your CSV has missing headers, we'll automatically assign temporary IDs so you can keep working without errors.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};