// src/app/components/HelpModal.tsx
"use client";

import React from 'react';
import {
  UploadCloud, MousePointer2, BarChart2, LayoutPanelTop, ArrowUpDown, GripHorizontal,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Step: React.FC<{ n: number; icon: React.ReactNode; title: string; children: React.ReactNode }> = ({
  n, icon, title, children,
}) => (
  <section className="flex gap-4">
    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-slate-800 mb-1 text-sm">{title}</h3>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  </section>
);

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-140 max-w-[95%] overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">User Guide</h2>
            <p className="text-xs text-slate-500 mt-0.5">Data Plot Studio の使いかた</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="px-7 py-6 space-y-5 overflow-y-auto max-h-[68vh]">

          <Step n={1} icon={<UploadCloud size={16} />} title="データのインポート">
            CSVファイルを3つの方法で読み込めます。
            <ul className="mt-1.5 space-y-0.5 text-slate-500 text-xs list-disc list-inside">
              <li>プロットエリアへ <b>ドラッグ＆ドロップ</b></li>
              <li>ヘッダーの <b>Import CSV</b> ボタンからファイル選択</li>
              <li>クリップボードから <b>⌘V / Ctrl+V</b> でペースト</li>
            </ul>
            <p className="mt-1.5 text-xs text-slate-500">
              文字コードは <b>UTF-8</b> と <b>Shift-JIS</b> を自動判別。
              列ヘッダーが欠損している場合は <code className="text-[11px] bg-slate-100 px-1 rounded">Col_N</code> で補完、
              最左列が空のときは行番号 <code className="text-[11px] bg-slate-100 px-1 rounded">index</code> を自動付与します。
            </p>
          </Step>

          <Step n={2} icon={<BarChart2 size={16} />} title="プロットの操作">
            X・Y・Color 軸をドロップダウンで選択すると散布図が描画されます。
            <ul className="mt-1.5 space-y-0.5 text-slate-500 text-xs list-disc list-inside">
              <li><b>SINGLE</b> — 単一色 / カラーバーで色分け</li>
              <li><b>MULTIPLE</b> — Color 列の値ごとにグループ表示</li>
              <li>左のツールバーでズーム・パン・リセット・PNG保存が可能</li>
              <li>プロット右下の <b>R / R²</b> はドラッグで移動できます</li>
            </ul>
          </Step>

          <Step n={3} icon={<MousePointer2 size={16} />} title="データ点のクリック">
            プロット上のデータ点をクリックすると、右上に <b>Inspector</b> パネルが開いてその行の詳細を確認できます。
            同時にデータテーブルの対応行がハイライトされ、自動でスクロールして中央に表示されます。
          </Step>

          <Step n={4} icon={<ArrowUpDown size={16} />} title="データテーブルの編集・ソート">
            テーブルのセルは直接編集でき、編集値はフォーカスを外した時点でプロットに即時反映されます。
            列ヘッダーをクリックするとその列でソートできます（昇順→降順→解除）。
            列の境界線をドラッグして列幅を変更することも可能です。
          </Step>

          <Step n={5} icon={<LayoutPanelTop size={16} />} title="レイアウトの変更">
            ヘッダーの <b>Vertical / Horizontal</b> ボタンでプロットとテーブルの並び方を切り替えられます。
            <ul className="mt-1.5 space-y-0.5 text-slate-500 text-xs list-disc list-inside">
              <li>各パネルのヘッダーバーをドラッグして順序を入れ替え</li>
              <li>パネル間の仕切り線をドラッグしてサイズ比率を調整</li>
              <li><b>▼ / ▶</b> ボタンでパネルを折りたたみ、もう一方を全画面に拡大</li>
            </ul>
          </Step>

        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 text-right flex flex-col items-center">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-all active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
