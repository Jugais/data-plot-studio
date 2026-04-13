// src/components/FloatingInspector.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';

interface FloatingInspectorProps {
  selectedRow: Record<string, any> | null;
  onClose: () => void;
}

export const FloatingInspector = (
	{selectedRow, onClose}: FloatingInspectorProps) => {
		return (
			<AnimatePresence>
				{selectedRow && (
					<motion.div 
						drag
						dragMomentum={false}
						// ドラッグ開始のターゲットを制限する（ハンドル以外でのドラッグを無効化したい場合は dragControls を使いますが、
						// 今回はシンプルに pointer-events の制御で解決します）
						initial={{ opacity: 0, x: 20, scale: 0.95 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: 20, scale: 0.95 }}
						className="fixed top-16 right-6 w-72 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl z-100 border border-slate-700 cursor-grab active:cursor-grabbing"
					>
						{/* ハンドル部分：ここを pointer-events-none にしないことで、ドラッグの起点にする */}
						<div className="flex justify-between items-center mb-3">
							<h3 className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Inspector</h3>
							<button 
								onClick={(e) => {
									e.stopPropagation(); // ドラッグイベントへの伝播を止める
									onClose();
								}} 
								className="text-slate-500 hover:text-white transition-colors p-1"
							>
								<X size={16} />
							</button>
						</div>
						{/* データ表示部分：ドラッグと干渉しないよう pointer-events-auto を明示 */}
						<div className="space-y-1.5 max-h-80 overflow-auto pr-1 custom-scrollbar-dark text-[11px] pointer-events-auto cursor-default">
							{Object.entries(selectedRow).map(([k, v]) => (
								<div key={k} className="flex justify-between items-baseline gap-3 border-b border-slate-800 pb-1 last:border-0">
									<span className="text-slate-400 font-medium truncate flex-1">{k}</span>
									<span className="font-mono text-blue-100 break-all">{v === null ? 'null' : String(v)}</span>
								</div>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		)
	}
