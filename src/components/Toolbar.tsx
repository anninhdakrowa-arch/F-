import React from 'react';
import {
  Upload,
  FolderPlus,
  Play,
  SearchCheck,
  Columns2,
  Copy,
  FileDown,
  FileText,
  Trash2,
  BookOpen,
  Loader2,
  Save,
  FolderOpen,
  Settings,
} from 'lucide-react';

interface ToolbarProps {
  onUploadClick: () => void;
  onUploadFolderClick: () => void;
  onSaveProject: () => void;
  onOpenProjectClick: () => void;
  onOpenSettings: () => void;
  onStartOcr: () => void;
  onInspectErrors: () => void;
  onToggleCompare: () => void;
  onCopyText: () => void;
  onDownloadWord: () => void;
  onDownloadTxt: () => void;
  onClear: () => void;
  onOpenSamples: () => void;
  isProcessing: boolean;
  hasImages: boolean;
  hasResult: boolean;
  isCompareActive: boolean;
  isInspectionOpen: boolean;
  suspiciousCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUploadClick,
  onUploadFolderClick,
  onSaveProject,
  onOpenProjectClick,
  onOpenSettings,
  onStartOcr,
  onInspectErrors,
  onToggleCompare,
  onCopyText,
  onDownloadWord,
  onDownloadTxt,
  onClear,
  onOpenSamples,
  isProcessing,
  hasImages,
  hasResult,
  isCompareActive,
  isInspectionOpen,
  suspiciousCount,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shadow-2xs shrink-0 select-none">
      {/* Cụm chức năng nạp tệp & dự án */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onUploadClick}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          title="Thêm ảnh từ máy tính (Phím tắt: Ctrl + O)"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>+ TẢI ẢNH</span>
        </button>

        <button
          onClick={onUploadFolderClick}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors cursor-pointer"
          title="Thêm toàn bộ ảnh trong thư mục (Phím tắt: Ctrl + Shift + O)"
        >
          <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
          <span>Thêm thư mục</span>
        </button>

        <button
          onClick={onOpenProjectClick}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors cursor-pointer"
          title="Mở tệp dự án .ocrproject đã lưu trước đó"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>Mở dự án</span>
        </button>

        <button
          onClick={onSaveProject}
          disabled={!hasImages}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 rounded-md text-xs font-medium transition-colors cursor-pointer"
          title="Lưu toàn bộ dự án thành file .ocrproject (Phím tắt: Ctrl + S)"
        >
          <Save className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lưu dự án</span>
        </button>

        <button
          onClick={onOpenSamples}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-md text-xs font-medium transition-colors cursor-pointer"
          title="Chọn tài liệu hành chính hoặc bảng biểu mẫu"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span>Mẫu</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Nút OCR Hàng Loạt */}
        <button
          onClick={onStartOcr}
          disabled={!hasImages || isProcessing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>ĐANG OCR NGUYÊN VĂN...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>OCR – CHUYỂN ẢNH THÀNH TEXT</span>
            </>
          )}
        </button>
      </div>

      {/* Cụm đối chiếu & kiểm tra lỗi */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onInspectErrors}
          disabled={!hasResult}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
            isInspectionOpen
              ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
          title="Bảng kiểm tra OCR tìm vùng nghi ngờ theo mục 12"
        >
          <SearchCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>KIỂM TRA LỖI</span>
          {suspiciousCount > 0 && (
            <span className="bg-amber-500 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full">
              {suspiciousCount}
            </span>
          )}
        </button>

        <button
          onClick={onToggleCompare}
          disabled={!hasImages}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
            isCompareActive
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
          title="Chia đôi màn hình song song đối chiếu ảnh và văn bản"
        >
          <Columns2 className="w-3.5 h-3.5" />
          <span>SO SÁNH ẢNH / TEXT</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Cụm xuất bản */}
        <button
          onClick={onCopyText}
          disabled={!hasResult}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs font-medium transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          <span>SAO CHÉP</span>
        </button>

        <button
          onClick={onDownloadWord}
          disabled={!hasResult}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-300 hover:bg-blue-100 text-blue-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs transition-colors cursor-pointer"
          title="Xuất file Word A4, Times New Roman 14pt (Phím tắt: Ctrl + E)"
        >
          <FileDown className="w-3.5 h-3.5 text-blue-700" />
          <span>TẢI WORD</span>
        </button>

        <button
          onClick={onDownloadTxt}
          disabled={!hasResult}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs font-medium transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>TẢI TXT</span>
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Nút Cài đặt */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
          title="Cài đặt API Key, luồng xử lý và Windows build"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Nút Xóa */}
        <button
          onClick={onClear}
          disabled={!hasImages}
          className="flex items-center gap-1 px-2 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md text-xs font-medium transition-colors cursor-pointer"
          title="Xóa danh sách làm mới phiên (Phím tắt: Delete)"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>XÓA</span>
        </button>
      </div>
    </div>
  );
};
