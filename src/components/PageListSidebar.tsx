import React from 'react';
import {
  FileImage,
  ArrowUp,
  ArrowDown,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  FileQuestion,
  SortAsc,
  Play,
  Square,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { DocumentPage, PageStatus } from '../types';

interface PageListSidebarProps {
  pages: DocumentPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onDeletePage: (index: number) => void;
  onSortByName: () => void;
  onOcrSinglePage: (index: number) => void;
  onOcrFailedPages: () => void;
  onStopOcr: () => void;
  onResumeOcr: () => void;
  isProcessing: boolean;
  isPaused: boolean;
  processedCount: number;
  errorCount: number;
}

export const PageListSidebar: React.FC<PageListSidebarProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onMovePage,
  onDeletePage,
  onSortByName,
  onOcrSinglePage,
  onOcrFailedPages,
  onStopOcr,
  onResumeOcr,
  isProcessing,
  isPaused,
  processedCount,
  errorCount,
}) => {
  const percent = pages.length > 0 ? Math.round((processedCount / pages.length) * 100) : 0;
  const remainingCount = Math.max(0, pages.length - processedCount);

  // Render nhãn trạng thái theo mục 42
  const renderStatusBadge = (status: PageStatus) => {
    switch (status) {
      case 'processing':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
            <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-600" />
            <span>Đang OCR</span>
          </span>
        );
      case 'done':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
            <span>Hoàn thành</span>
          </span>
        );
      case 'needs_review':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
            <span>Cần kiểm tra</span>
          </span>
        );
      case 'reviewed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
            <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
            <span>Đã kiểm tra</span>
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
            <XCircle className="w-2.5 h-2.5 text-red-600" />
            <span>OCR lỗi</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span>Chưa OCR</span>
          </span>
        );
    }
  };

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Header sidebar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <FileImage className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Danh Sách Trang ({pages.length})
            </span>
          </div>

          <button
            onClick={onSortByName}
            disabled={pages.length < 2 || isProcessing}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 transition-colors"
            title="Sắp xếp theo tên tệp (01, 02, 03...)"
          >
            <SortAsc className="w-3 h-3" />
            <span>Sắp xếp</span>
          </button>
        </div>

        {/* Thanh tiến trình chi tiết theo mục 43 */}
        {pages.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="font-semibold text-slate-700">
                {isProcessing ? 'Đang OCR' : isPaused ? 'Tạm dừng' : 'Tiến trình'}: {processedCount}/{pages.length} ({percent}%)
              </span>
              <span className="text-slate-500">Còn {remainingCount}</span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${percent}%` }}
                className={`h-full transition-all duration-300 ${
                  errorCount > 0 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
              />
            </div>

            {/* Các nút điều khiển hàng đợi batch theo mục 44, 45, 11 */}
            <div className="flex items-center gap-1 pt-1.5">
              {isProcessing ? (
                <button
                  onClick={onStopOcr}
                  className="flex-1 py-1 px-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  title="Dừng xử lý hàng đợi mà không làm mất các trang đã hoàn thành"
                >
                  <Square className="w-3 h-3" />
                  <span>DỪNG OCR</span>
                </button>
              ) : isPaused && remainingCount > 0 ? (
                <button
                  onClick={onResumeOcr}
                  className="flex-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  title="Tiếp tục OCR các trang chưa xong"
                >
                  <Play className="w-3 h-3 text-emerald-700 fill-emerald-700" />
                  <span>TIẾP TỤC OCR</span>
                </button>
              ) : null}

              {errorCount > 0 && !isProcessing && (
                <button
                  onClick={onOcrFailedPages}
                  className="py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                  title="Chỉ xử lý lại những trang bị thất bại theo mục 11"
                >
                  <RotateCcw className="w-3 h-3 text-amber-700" />
                  <span>OCR LẠI {errorCount} TRANG LỖI</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Danh sách cuộn các trang */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {pages.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
            <FileQuestion className="w-8 h-8 mb-2 text-slate-300" />
            <span>Chưa có ảnh nào được thêm</span>
          </div>
        ) : (
          pages.map((page, index) => {
            const isActive = index === activePageIndex;
            const isLarge = page.size > 5 * 1024 * 1024; // > 5MB

            return (
              <div
                key={page.id}
                onClick={() => onSelectPage(index)}
                className={`p-2 rounded-lg border text-xs transition-all cursor-pointer relative group flex gap-2.5 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {/* Thumbnail ảnh */}
                <div className="w-14 h-18 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center relative">
                  <img
                    src={page.imageUrl}
                    alt={page.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <span
                    className={`absolute bottom-0 inset-x-0 text-center text-[9px] font-mono font-bold py-0.2 ${
                      isActive ? 'bg-slate-900/90 text-white' : 'bg-slate-800/80 text-white'
                    }`}
                  >
                    #{page.pageNumber}
                  </span>
                </div>

                {/* Thông tin trang */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold truncate text-[11px] leading-tight">
                        {page.name || `Trang ${page.pageNumber}`}
                      </span>

                      {/* Các nút di chuyển lên xuống */}
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovePage(index, index - 1);
                          }}
                          disabled={index === 0 || isProcessing}
                          className="p-0.5 hover:bg-slate-200 hover:text-slate-900 rounded disabled:opacity-20"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMovePage(index, index + 1);
                          }}
                          disabled={index === pages.length - 1 || isProcessing}
                          className="p-0.5 hover:bg-slate-200 hover:text-slate-900 rounded disabled:opacity-20"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(index);
                          }}
                          disabled={isProcessing}
                          className="p-0.5 hover:bg-red-100 text-red-600 rounded disabled:opacity-20"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-1.5">{renderStatusBadge(page.status)}</div>

                    {/* Cảnh báo trang trắng hoặc chữ viết tay theo mục 39, 41 */}
                    {page.isBlankPage && (
                      <span className="text-[10px] text-amber-600 block italic">
                        Có thể là trang trắng
                      </span>
                    )}
                    {page.isHandwriting && (
                      <span className="text-[10px] text-amber-600 block italic">
                        ⚠ Có chữ viết tay
                      </span>
                    )}

                    {/* Cảnh báo dung lượng lớn theo mục 33 */}
                    {isLarge && (
                      <span className="text-[9px] text-amber-600 flex items-center gap-0.5" title="Ảnh có kích thước lớn, quá trình OCR có thể lâu hơn">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Ảnh lớn ({Math.round(page.size / (1024 * 1024))}MB)</span>
                      </span>
                    )}
                  </div>

                  {/* Nút OCR lại trang này theo mục 10 */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      {page.rawText ? `${page.rawText.split('\n').length} dòng` : '0 dòng'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOcrSinglePage(index);
                      }}
                      disabled={isProcessing}
                      className={`text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-colors ${
                        isActive
                          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title="Chỉ OCR lại trang này theo mục 10"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>OCR lại</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
