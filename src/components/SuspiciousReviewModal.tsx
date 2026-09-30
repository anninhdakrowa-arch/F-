import React, { useState } from 'react';
import { X, Check, Edit3, AlertTriangle, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { SuspiciousItem } from '../types';

interface SuspiciousReviewModalProps {
  item: SuspiciousItem | null;
  onClose: () => void;
  onKeepOriginal: (item: SuspiciousItem) => void;
  onManualEdit: (item: SuspiciousItem, newWord: string) => void;
  pageImageUrl?: string;
}

export const SuspiciousReviewModal: React.FC<SuspiciousReviewModalProps> = ({
  item,
  onClose,
  onKeepOriginal,
  onManualEdit,
  pageImageUrl,
}) => {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  const handleSaveEdit = () => {
    onManualEdit(item, editText);
    setIsEditing(false);
    onClose();
  };

  const handleKeep = () => {
    onKeepOriginal(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Đối Chiếu Điểm Nghi Ngờ (Trang {item.page} · Dòng {item.line})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung so sánh theo mục 14 */}
        <div className="p-5 space-y-4 text-xs">
          {/* Vùng so sánh OCR vs Ảnh */}
          <div className="grid grid-cols-2 gap-3">
            {/* Cột OCR Text */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                OCR NHẬN DIỆN
              </span>
              <div className="text-base font-bold text-amber-900 bg-amber-100/70 px-2.5 py-1.5 rounded font-mono break-all inline-block">
                {item.text}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 italic leading-relaxed">
                Lý do: {item.issue}
              </p>
            </div>

            {/* Cột Vùng Ảnh Tương Ứng */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center text-center overflow-hidden">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 w-full text-left">
                VÙNG ẢNH GỐC
              </span>
              {pageImageUrl ? (
                <div className="w-full h-24 bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden relative group">
                  <img
                    src={pageImageUrl}
                    alt="Vùng ảnh đối chiếu"
                    className="max-h-full max-w-full object-contain scale-150 transform transition-transform"
                  />
                  <div className="absolute inset-0 ring-2 ring-amber-500/40 pointer-events-none" />
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-slate-400">
                  <Eye className="w-6 h-6 mb-1" />
                </div>
              )}
              <span className="text-[10px] text-slate-400 mt-1">Đối chiếu với dòng {item.line} trên ảnh</span>
            </div>
          </div>

          {/* Form sửa thủ công nếu kích hoạt */}
          {isEditing && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <label className="font-bold text-blue-900 block text-[11px]">
                Nhập nội dung sửa thủ công sau khi đã kiểm tra ảnh gốc:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-blue-300 rounded text-xs font-times text-black bg-white focus:outline-blue-600"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded text-xs transition-colors shrink-0"
                >
                  Xác nhận sửa
                </button>
              </div>
            </div>
          )}

          {/* Thông điệp cấm tự sửa */}
          <div className="p-2.5 bg-slate-100 rounded text-[11px] text-slate-600 leading-relaxed">
            <strong>Ghi nhớ:</strong> Nếu ảnh gốc ghi sai chính tả hoặc gõ máy (ví dụ <em>"nhiêm vụ"</em>), theo nguyên tắc hãy chọn <strong>GIỮ NGUYÊN</strong> để bảo đảm tính trung thực của tài liệu.
          </div>
        </div>

        {/* Nút hành động theo mục 14 */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>SỬA THỦ CÔNG</span>
              </button>
            )}

            <button
              onClick={handleKeep}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>GIỮ NGUYÊN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
