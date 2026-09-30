import React from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Search,
  ExternalLink,
  ShieldAlert,
  Check,
  Edit3,
} from 'lucide-react';
import { SuspiciousItem, DocumentPage } from '../types';

interface InspectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pages: DocumentPage[];
  allSuspicious: SuspiciousItem[];
  selectedSuspicious: SuspiciousItem | null;
  onSelectSuspicious: (item: SuspiciousItem) => void;
  onReviewItem: (item: SuspiciousItem) => void;
}

export const InspectionPanel: React.FC<InspectionPanelProps> = ({
  isOpen,
  onClose,
  pages,
  allSuspicious,
  selectedSuspicious,
  onSelectSuspicious,
  onReviewItem,
}) => {
  if (!isOpen) return null;

  const totalSuspicious = allSuspicious.length;
  const resolvedCount = allSuspicious.filter((s) => s.status === 'kept' || s.status === 'edited').length;
  const pendingCount = totalSuspicious - resolvedCount;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-40 border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-14 border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Kiểm Tra OCR & Thẩm Định Nghi Ngờ
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          title="Đóng bảng kiểm tra"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Cảnh báo & Tóm tắt theo mục 37 */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            1. Cảnh Báo Thẩm Định (Mục 37)
          </h3>

          {pendingCount > 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-950">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-amber-900">
                    ⚠ CẦN KIỂM TRA HÌNH ẢNH GỐC
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Đã hoàn thành OCR. Có <strong>{pendingCount}</strong> vị trí cần người dùng kiểm tra đối chiếu. Hệ thống tuân thủ nguyên tắc không tự ý đoán từ mờ hoặc tự sửa lỗi.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-emerald-900">
                    ✓ Đã Hoàn Thành Thẩm Định
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Không phát hiện vùng OCR có độ tin cậy thấp; người dùng vẫn nên đối chiếu tài liệu gốc đối với văn bản quan trọng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thống kê 3 chỉ số */}
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase">Số trang</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {pages.length}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase">Tổng nghi ngờ</span>
              <span className="text-base font-bold text-amber-600 tabular-nums">
                {totalSuspicious}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <span className="text-[10px] text-slate-500 block uppercase">Chưa xác nhận</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {pendingCount}
              </span>
            </div>
          </div>
        </div>

        {/* Danh sách các vị trí nghi ngờ theo mục 12 & 14 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Danh Sách Vị Trí Nghi Ngờ Chi Tiết
            </h3>
            <span className="text-[11px] text-slate-500">
              {resolvedCount}/{totalSuspicious} đã xử lý
            </span>
          </div>

          {allSuspicious.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500">
              Tất cả các trang đều rõ nét, không phát hiện vị trí nghi ngờ cần đánh dấu [?].
            </div>
          ) : (
            <div className="space-y-2">
              {allSuspicious.map((item) => {
                const isSelected = selectedSuspicious?.id === item.id;
                const isResolved = item.status === 'kept' || item.status === 'edited';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectSuspicious(item);
                      onReviewItem(item);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-xs'
                        : isResolved
                        ? 'bg-slate-50/80 border-slate-200 opacity-80'
                        : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-900 flex items-center gap-1 font-mono">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                          Trang {item.page}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-700">Dòng {item.line}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-mono">
                          {item.text}
                        </span>

                        {item.status === 'kept' && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Giữ nguyên
                          </span>
                        )}
                        {item.status === 'edited' && (
                          <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                            <Edit3 className="w-2.5 h-2.5" /> Đã sửa
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed mb-2">{item.issue}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-amber-800 font-medium">
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3 text-amber-600" />
                        <span>Đối chiếu ảnh & chữ</span>
                      </span>
                      <span className="underline">Mở hộp thoại xử lý</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tóm lược nội dung nhận diện từng trang */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            3. Trích Yếu Nhận Diện Các Trang
          </h3>
          <div className="space-y-2">
            {pages.map((p) => (
              <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 font-mono">TRANG #{p.pageNumber}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.rawText ? `${p.rawText.split('\n').length} dòng` : '0 dòng'}
                  </span>
                </div>
                <div className="font-times text-slate-600 line-clamp-2 italic text-[11px]">
                  {p.rawText || '(Trang trống)'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
