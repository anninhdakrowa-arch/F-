import React from 'react';
import { FileText, Copy, Download, Sparkles, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onCopy: () => void;
  onDownloadWord: () => void;
  onDownloadTxt: () => void;
  copied: boolean;
  hasResult: boolean;
  totalSuspicious: number;
}

export const Header: React.FC<HeaderProps> = ({
  onCopy,
  onDownloadWord,
  onDownloadTxt,
  copied,
  hasResult,
  totalSuspicious,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
          <FileText className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900">
              OCR NGUYÊN VĂN
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Bảo Toàn Gốc
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Sao chép trung thực 100% hình ảnh · Không tự sửa chính tả · Chuẩn Word A4
          </p>
        </div>
      </div>

      {/* Zone 2: Trạng thái & cảnh báo */}
      {hasResult && (
        <div className="hidden lg:flex items-center gap-2 text-xs">
          {totalSuspicious > 0 ? (
            <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Phát hiện {totalSuspicious} vị trí cần kiểm tra ảnh gốc</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã hoàn thành OCR nguyên văn</span>
            </div>
          )}
        </div>
      )}

      {/* Zone 3: Hành động nhanh */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          disabled={!hasResult}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            copied
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
          title="Sao chép toàn bộ văn bản vào bộ nhớ tạm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
        </button>

        <button
          onClick={onDownloadWord}
          disabled={!hasResult}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
          title="Tải văn bản chuẩn Microsoft Word (.docx) Times New Roman 14pt A4"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Tải Word (.docx)</span>
        </button>
      </div>
    </header>
  );
};
