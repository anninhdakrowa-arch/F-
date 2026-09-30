import React, { useState, useEffect } from 'react';
import { SuspiciousItem } from '../types';
import {
  Edit3,
  Eye,
  FileText,
  Check,
  AlertCircle,
  Copy,
  Search,
  X,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
} from 'lucide-react';

interface TextEditorProps {
  text: string;
  onChangeText: (newText: string) => void;
  suspiciousItems: SuspiciousItem[];
  selectedSuspicious: SuspiciousItem | null;
  onSelectSuspicious: (item: SuspiciousItem) => void;
  isProcessing: boolean;
  pageNumber: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChangeText,
  suspiciousItems,
  selectedSuspicious,
  onSelectSuspicious,
  isProcessing,
  pageNumber,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProofreadingMode, setIsProofreadingMode] = useState(false); // Mặc định TẮT theo mục 15

  // Lắng nghe phím Ctrl + F để mở tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const lines = text ? text.split('\n') : [];

  const handleQuickCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render một dòng văn bản kèm highlight
  const renderHighlightedLine = (lineText: string, lineIndex: number) => {
    const lineNumber = lineIndex + 1;
    const isLineFocused = selectedSuspicious && selectedSuspicious.line === lineNumber;

    // Tách từ theo [?] hoặc [KHÔNG ĐỌC RÕ] hoặc từ khóa tìm kiếm
    const regexPattern = showSearch && searchQuery.trim()
      ? new RegExp(`(\\[\\?\\]|\\[KHÔNG ĐỌC RÕ\\]|${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')
      : /(\[\?\]|\[KHÔNG ĐỌC RÕ\])/g;

    const tokens = lineText.split(regexPattern);

    return (
      <div
        key={lineIndex}
        className={`flex group hover:bg-slate-50/80 transition-colors ${
          isLineFocused ? 'bg-amber-50/70 ring-1 ring-amber-300 rounded' : ''
        }`}
      >
        {/* Số dòng font-mono */}
        <span className="w-10 shrink-0 text-right pr-3 select-none text-slate-300 font-mono text-xs pt-1 group-hover:text-slate-400">
          {lineNumber}
        </span>

        {/* Nội dung dòng chữ Times New Roman 14pt chuẩn */}
        <div className="flex-1 font-times text-[18.66px] leading-[1.65] text-black whitespace-pre-wrap break-words min-h-[1.65em]">
          {tokens.map((token, tIdx) => {
            if (!token) return null;

            // Highlight tìm kiếm
            if (showSearch && searchQuery.trim() && token.toLowerCase() === searchQuery.toLowerCase()) {
              return (
                <mark key={tIdx} className="bg-yellow-200 text-slate-900 rounded px-0.5">
                  {token}
                </mark>
              );
            }

            // Highlight [?] hoặc [KHÔNG ĐỌC RÕ]
            if (token === '[?]' || token === '[KHÔNG ĐỌC RÕ]') {
              const matchedItem = suspiciousItems.find(
                (s) => s.line === lineNumber && s.text.includes(token)
              ) || {
                id: `line-${lineNumber}-${tIdx}`,
                page: pageNumber,
                line: lineNumber,
                text: token,
                issue: token === '[?]' ? 'Ký tự mờ không xác định được' : 'Vùng chữ mờ mất nét không đọc được',
              };

              return (
                <button
                  type="button"
                  key={tIdx}
                  onClick={() => onSelectSuspicious(matchedItem)}
                  className="inline-flex items-center px-1.5 py-0.2 rounded font-mono text-xs font-bold transition-all cursor-pointer mx-0.5 bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 shadow-2xs"
                  title={`Dòng ${lineNumber}: Bấm để mở hộp thoại đối chiếu và chọn GIỮ NGUYÊN / SỬA THỦ CÔNG`}
                >
                  <AlertCircle className="w-3 h-3 mr-0.5 text-amber-800" />
                  {token}
                </button>
              );
            }

            // Kiểm tra xem token có chứa từ nghi ngờ trong danh sách không
            const matchSuspicious = suspiciousItems.find(
              (s) => s.line === lineNumber && s.text && token.includes(s.text) && s.text !== '[?]' && s.text !== '[KHÔNG ĐỌC RÕ]'
            );

            if (matchSuspicious) {
              return (
                <button
                  type="button"
                  key={tIdx}
                  onClick={() => onSelectSuspicious(matchSuspicious)}
                  className="underline decoration-wavy decoration-amber-500 font-bold bg-amber-100/60 hover:bg-amber-200 text-slate-900 rounded px-1 cursor-pointer transition-colors"
                  title={`Điểm nghi ngờ: "${matchSuspicious.text}". Bấm để đối chiếu.`}
                >
                  {token}
                </button>
              );
            }

            return <span key={tIdx}>{token}</span>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden relative select-text">
      {/* Header text editor */}
      <div className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Văn Bản OCR Trang #{pageNumber}
          </span>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
            Times New Roman · 14 pt
          </span>
        </div>

        {/* Công cụ tìm kiếm, sao chép, chế độ sửa */}
        <div className="flex items-center gap-2">
          {/* Nút bật tìm kiếm Ctrl + F */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded transition-colors ${
              showSearch ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Tìm kiếm văn bản (Ctrl + F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleQuickCopy}
            disabled={!text}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40"
            title="Sao chép văn bản"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>

          <div className="h-3.5 w-px bg-slate-200" />

          {/* Chế độ Hiệu Đính theo mục 15 (Mặc định TẮT) */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mr-1" title="Chế độ Hiệu đính văn bản độc lập (Mục 15: Mặc định luôn TẮT)">
            <span>Hiệu đính:</span>
            <button
              onClick={() => setIsProofreadingMode(!isProofreadingMode)}
              className="text-slate-700 hover:text-slate-900"
            >
              {isProofreadingMode ? (
                <ToggleRight className="w-4 h-4 text-amber-600" />
              ) : (
                <ToggleLeft className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <span className={isProofreadingMode ? 'text-amber-700 font-bold' : 'text-slate-400'}>
              {isProofreadingMode ? 'BẬT' : 'TẮT'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-200" />

          {/* Nút chỉnh sửa trực tiếp */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              isEditMode
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isEditMode ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Xem đối chiếu</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa thủ công</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm nhanh nếu mở */}
      {showSearch && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 text-xs shrink-0 animate-in slide-in-from-top-2">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm từ hoặc cụm từ trong văn bản..."
            className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-slate-900 outline-none"
            autoFocus
          />
          {searchQuery && (
            <span className="text-[11px] text-slate-500 font-mono">
              {text.toLowerCase().split(searchQuery.toLowerCase()).length - 1} kết quả
            </span>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="p-1 text-slate-400 hover:text-slate-700 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Trang văn bản giấy A4 mô phỏng */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center">
        {isProcessing ? (
          <div className="w-full max-w-3xl bg-white shadow-md border border-slate-200 rounded-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-sm font-bold text-slate-800">Đang quét OCR trang #{pageNumber}...</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Giữ nguyên lỗi chính tả gốc, đối chiếu dấu tiếng Việt và lọc các điểm nghi ngờ.
            </p>
          </div>
        ) : !text ? (
          <div className="w-full max-w-3xl bg-white shadow-md border border-slate-200 rounded-sm p-16 flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-slate-200 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Trang #{pageNumber} chưa được nhận diện</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Nhấn nút "OCR – CHUYỂN ẢNH THÀNH TEXT" trên thanh công cụ hoặc "OCR lại" ở thanh bên.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-3xl bg-white shadow-md border border-slate-200 rounded-sm min-h-[90vh] p-8 md:p-12 relative flex flex-col">
            {isEditMode ? (
              <textarea
                value={text}
                onChange={(e) => onChangeText(e.target.value)}
                className="w-full flex-1 font-times text-[18.66px] leading-[1.65] text-black outline-none resize-none bg-transparent"
                style={{ minHeight: '80vh' }}
                placeholder="Nhập hoặc chỉnh sửa văn bản OCR..."
              />
            ) : (
              <div className="w-full flex-1">
                {lines.map((line, idx) => renderHighlightedLine(line, idx))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
