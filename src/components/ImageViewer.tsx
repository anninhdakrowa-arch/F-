import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Move,
  Layers,
} from 'lucide-react';
import { DocumentPage, SuspiciousItem } from '../types';

interface ImageViewerProps {
  pages: DocumentPage[];
  activePageIndex: number;
  onPageChange: (index: number) => void;
  selectedSuspicious: SuspiciousItem | null;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  pages,
  activePageIndex,
  onPageChange,
  selectedSuspicious,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const activePage = pages[activePageIndex];

  // Khôi phục vị trí khi đổi trang
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
  }, [activePageIndex]);

  // Điều khiển phóng to / thu nhỏ
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.4));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Kéo chuột di chuyển ảnh (pan)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1 && position.x === 0 && position.y === 0) {
      // Cho phép kéo cả khi ở mức thường nếu muốn định vị
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom bằng lăn chuột
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.4), 4));
  };

  if (!activePage) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50 border-r border-slate-200">
        <Layers className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-600">Chưa có hình ảnh tài liệu</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Nhấn nút "+ TẢI ẢNH" hoặc chọn "Tài liệu mẫu" để bắt đầu đối chiếu.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-100 border-r border-slate-200 select-none overflow-hidden relative">
      {/* Thanh điều hướng trang & thanh công cụ zoom */}
      <div className="h-10 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-3 flex items-center justify-between z-10 shrink-0">
        {/* Bộ chọn trang */}
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <button
            onClick={() => onPageChange(Math.max(0, activePageIndex - 1))}
            disabled={activePageIndex === 0}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-semibold text-slate-900 px-1 font-mono tabular-nums">
            TRANG {activePageIndex + 1} / {pages.length}
          </span>

          <button
            onClick={() => onPageChange(Math.min(pages.length - 1, activePageIndex + 1))}
            disabled={activePageIndex === pages.length - 1}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Công cụ ảnh */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono text-slate-500 w-12 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-3.5 w-px bg-slate-200 mx-1" />

          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title="Vừa màn hình (Fit)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRotate}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
            title="Xoay 90 độ"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vùng canvas hiển thị ảnh */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`flex-1 overflow-hidden flex items-center justify-center p-4 relative ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-h-full max-w-full shadow-lg bg-white rounded-xs ring-1 ring-slate-900/10"
        >
          <img
            src={activePage.imageUrl}
            alt={`Tài liệu trang ${activePageIndex + 1}`}
            className="max-h-[82vh] max-w-full object-contain pointer-events-none block"
          />

          {/* Điểm gắn cờ vị trí nghi ngờ nếu được chọn từ danh sách kiểm tra */}
          {selectedSuspicious && selectedSuspicious.page === activePage.pageNumber && (
            <div className="absolute inset-x-0 bottom-4 mx-auto w-fit bg-amber-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5 animate-pulse">
              <span>Đang đối chiếu: "{selectedSuspicious.text}" (Dòng {selectedSuspicious.line})</span>
            </div>
          )}
        </div>

        {/* Chú thích kéo rê phía dưới */}
        <div className="absolute bottom-2 left-3 text-[11px] text-slate-500 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded border border-slate-200 pointer-events-none flex items-center gap-1">
          <Move className="w-3 h-3 text-slate-400" />
          <span>Cuộn chuột để phóng to · Kéo rê để soi chi tiết</span>
        </div>
      </div>
    </div>
  );
};
