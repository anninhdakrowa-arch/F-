import React from 'react';
import { AlertTriangle, Copy, Trash2, Check } from 'lucide-react';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  duplicateCount: number;
  duplicateNames: string[];
  onKeepBoth: () => void;
  onRemoveDuplicates: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  duplicateCount,
  duplicateNames,
  onKeepBoth,
  onRemoveDuplicates,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900">
            Phát Hiện {duplicateCount} Ảnh Có Khả Năng Trùng Lặp
          </h3>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Hệ thống phát hiện một số hình ảnh đã tồn tại trong danh sách trang hoặc có tên trùng khớp:
          </p>

          <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-md max-h-32 overflow-y-auto text-[11px] font-mono text-slate-700 space-y-1">
            {duplicateNames.slice(0, 10).map((name, idx) => (
              <div key={idx} className="truncate">
                • {name}
              </div>
            ))}
            {duplicateNames.length > 10 && (
              <div className="text-slate-400 italic">...và {duplicateNames.length - 10} tệp khác</div>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-3">
            Theo nguyên tắc, hệ thống không tự ý xóa. Bạn muốn xử lý như thế nào?
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onKeepBoth}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Giữ Cả Hai</span>
            </button>

            <button
              onClick={onRemoveDuplicates}
              className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Bản Trùng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
