// src/app/components/HelpModal.tsx
"use client";

import React from 'react';
import {
  UploadCloud, MousePointer2, BarChart2, LayoutPanelTop,
  ArrowUpDown, Hand, ZoomIn, Grid2x2, Download, Target,
} from 'lucide-react';
import { Button } from '@/app/components/Button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Step: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
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

// ツールバーのアイコンを小さく inline 表示するヘルパー
const Icon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-600 align-middle mx-0.5">
    {children}
  </span>
);

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[580px] max-w-[95%] overflow-hidden border border-slate-200"
        onClick={e => e.stopPropagation()}
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
        <div className="px-7 py-6 space-y-6 overflow-y-auto max-h-[68vh]">

          {/* 1. データのインポート */}
          <Step icon={<UploadCloud size={16} />} title="データのインポート">
            3つの方法で CSV を読み込めます。
            <ul className="mt-1.5 space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li>プロットエリアのアイコンを<b>クリック</b>してファイル選択、またはファイルを<b>ドラッグ＆ドロップ</b></li>
              <li>ヘッダーの <b>Import CSV</b> ボタンからファイル選択</li>
              <li>クリップボードから <b>⌘V / Ctrl+V</b> でペースト</li>
            </ul>
            <p className="mt-1.5 text-xs text-slate-500">
              <b>UTF-8</b> と <b>Shift-JIS</b> を自動判別。列ヘッダーが欠損している場合は{' '}
              <code className="text-[11px] bg-slate-100 px-1 rounded">Col_N</code>{' '}
              で補完、最左列が空のときは行番号{' '}
              <code className="text-[11px] bg-slate-100 px-1 rounded">index</code>{' '}
              を自動付与します。
            </p>
          </Step>

          {/* 2. プロットの描画 */}
          <Step icon={<BarChart2 size={16} />} title="プロットの描画">
            X・Y・Color 軸をドロップダウンで選択するとスキャッタープロットが描画されます。
            <ul className="mt-1.5 space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li><b>SINGLE</b> — 単一色 / Color 列でグラデーション着色</li>
              <li><b>MULTIPLE</b> — Color 列の値ごとにグループ分けして表示</li>
              <li>相関係数 <b>r</b> と決定係数 <b>r²</b> がプロット左上に表示されます（ドラッグで移動可）</li>
            </ul>
          </Step>

          {/* 3. ツールバー */}
          <Step icon={<MousePointer2 size={16} />} title="ツールバーの操作">
            プロットエリア左のツールバーで操作モードを切り替えます。
            <div className="mt-2 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Icon><MousePointer2 size={12} /></Icon>
                <span><b>選択モード</b>（デフォルト）— クリックで点を選択・追加、再クリックで解除。スクロールでズーム。</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon><Hand size={12} /></Icon>
                <span><b>パンモード</b> — ドラッグでプロットを移動。</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon><ZoomIn size={12} /></Icon>
                <span><b>ズームIn / Out</b> — ボタンで段階的にズーム。</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon><Target size={12} /></Icon>
                <span><b>リセット</b> — 軸のスケールを自動調整に戻す。</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon><Grid2x2 size={12} /></Icon>
                <span><b>グリッド切替</b> — グリッド線の表示 / 非表示をトグル。ダウンロード画像にも反映されます。</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon><Download size={12} /></Icon>
                <span><b>PNG保存</b> — 表示中のプロットをそのまま 800×560px の画像としてダウンロード。</span>
              </div>
            </div>
          </Step>

          {/* 4. データ点の選択と Inspector */}
          <Step icon={<MousePointer2 size={16} />} title="データ点の選択と Inspector">
            選択モードでデータ点をクリックすると、右上に <b>Inspector</b> パネルが開きます。
            <ul className="mt-1.5 space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li>複数の点を順にクリックして <b>複数選択</b> が可能（再クリックで除去）</li>
              <li>複数選択時は Inspector に比較テーブルが表示され、値が異なる列が強調されます</li>
              <li>データテーブルでも選択行が indigo でハイライトされ、自動スクロールします</li>
              <li>Inspector はドラッグで自由に移動できます</li>
            </ul>
          </Step>

          {/* 5. データテーブル */}
          <Step icon={<ArrowUpDown size={16} />} title="データテーブルの編集・ソート">
            テーブルのセルは直接クリックして編集できます。
            <ul className="mt-1.5 space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li><b>Enter</b> またはフォーカスを外すと確定してプロットに即時反映</li>
              <li><b>Escape</b> で編集をキャンセルして元の値に戻ります</li>
              <li>列ヘッダーをクリックでソート（昇順 → 降順 → 解除）</li>
              <li>列の境界線をドラッグして列幅を調整できます</li>
            </ul>
          </Step>

          {/* 6. レイアウト */}
          <Step icon={<LayoutPanelTop size={16} />} title="レイアウトの変更">
            ヘッダーの <b>Vertical / Horizontal</b> ボタンでプロットとテーブルの並び方を切り替えられます。
            <ul className="mt-1.5 space-y-1 text-xs text-slate-500 list-disc list-inside">
              <li>各パネルのヘッダーバーを<b>ドラッグ</b>して上下（左右）の順序を入れ替え</li>
              <li>パネル間の<b>仕切り線をドラッグ</b>してサイズ比率を調整（15〜85%）</li>
              <li><b>▼ / ▶</b> ボタンでパネルを折りたたむと、もう一方が全体に拡大</li>
            </ul>
          </Step>

        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 flex justify-end">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </div>
    </div>
  );
};
