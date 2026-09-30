import React from 'react';
import { X, BookOpen, ArrowRight, ShieldCheck, Table2, FileText } from 'lucide-react';
import { SampleDoc } from '../types';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: SampleDoc[];
  onSelectSample: (sample: SampleDoc) => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  samples,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kho Tài Liệu Hành Chính Mẫu
              </h2>
              <p className="text-xs text-slate-500">
                Thử nghiệm quy trình OCR sao chép nguyên văn và đối chiếu 2 lần ngay lập tức
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {samples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-900 hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-36 bg-slate-100 rounded-md overflow-hidden border border-slate-200 mb-3 flex items-center justify-center relative">
                  <img
                    src={sample.imageDataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {sample.tag}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {sample.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-blue-600">
                <span>Chọn tài liệu này</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Bạn cũng có thể tải ảnh của riêng bạn bằng nút "+ TẢI ẢNH".</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium rounded-md text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
