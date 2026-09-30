import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  Cpu,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Monitor,
  Terminal,
} from 'lucide-react';
import { ProjectConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProjectConfig;
  onSaveConfig: (newConfig: ProjectConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [apiKey, setApiKey] = useState(config.customApiKey || '');
  const [concurrency, setConcurrency] = useState<number>(config.concurrency || 2);
  const [includePageBreak, setIncludePageBreak] = useState<boolean>(config.includePageBreak ?? true);
  const [documentTitle, setDocumentTitle] = useState<string>(config.documentTitle || 'Tai_lieu');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'windows'>('general');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey.trim()) {
        headers['x-gemini-api-key'] = apiKey.trim();
      }

      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Kết nối thành công! Gemini API đang hoạt động ổn định.',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Kiểm tra thất bại. Vui lòng kiểm tra lại API Key.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Không thể kết nối đến máy chủ API.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      documentTitle: documentTitle.trim() || 'Tai_lieu',
      customApiKey: apiKey.trim(),
      concurrency,
      includePageBreak,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Cài Đặt Hệ Thống & API</h2>
              <p className="text-xs text-slate-500">Cấu hình kết nối, luồng xử lý và xuất bản tài liệu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Cấu hình OCR & API
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'windows'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Đóng gói Windows / Desktop</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'general' ? (
            <>
              {/* Tên tài liệu */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Tên Tài Liệu Mặc Định</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder="Ví dụ: Nghi_quyet_Chi_bo"
                />
                <p className="text-[11px] text-slate-500">
                  File Word xuất ra sẽ tự động đặt tên theo dạng: <span className="font-mono">{documentTitle || 'Tai_lieu'}_OCR.docx</span>
                </p>
              </div>

              {/* Gemini API Key */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gemini API Key (Tùy chọn)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Để trống để dùng key mặc định hệ thống</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md font-mono text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    placeholder="AIzaSy..."
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang kiểm tra...</span>
                      </>
                    ) : (
                      <span>Kiểm tra kết nối</span>
                    )}
                  </button>
                </div>

                {/* Kết quả kiểm tra */}
                {testResult && (
                  <div
                    className={`p-3 rounded-md flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Giới hạn luồng xử lý đồng thời (Concurrency) */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>Số Tác Vụ OCR Đồng Thời (Hàng Đợi Batch)</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Mặc định 2 tác vụ song song để đảm bảo tốc độ cao và tránh bị rate limit từ nhà cung cấp API khi xử lý 50-100 trang.
                </p>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[1, 2, 3, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setConcurrency(num)}
                      className={`py-2 text-center rounded-md font-bold transition-all border ${
                        concurrency === num
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {num} {num === 2 ? '(Chuẩn)' : 'luồng'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngắt trang PageBreak */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-700 block">Ngắt Trang (Page Break) trong File Word</label>
                    <p className="text-[11px] text-slate-500">
                      Mỗi ảnh scan tương ứng một trang A4 độc lập trong Word.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includePageBreak}
                    onChange={(e) => setIncludePageBreak(e.target.checked)}
                    className="w-4 h-4 accent-slate-900 rounded"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Tab Windows / Desktop packaging */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-blue-900">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-blue-700" />
                  <span>Đóng Gói Ứng Dụng Chạy Trên Windows / Máy Tính Văn Phòng</span>
                </h4>
                <p className="leading-relaxed">
                  Ứng dụng được thiết kế tương thích hoàn toàn để đóng gói thành tệp cài đặt Windows (.exe) độc lập qua <strong>Electron</strong> hoặc chạy trực tiếp bằng tệp thực thi batch script.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-800">Cách 1: Chạy trực tiếp trên Windows (Portable)</h5>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-md font-mono text-[11px] space-y-1">
                  <div># 1. Cài đặt các gói phụ thuộc</div>
                  <div className="text-emerald-400">npm install</div>
                  <div># 2. Khởi chạy ứng dụng cục bộ</div>
                  <div className="text-emerald-400">npm run dev</div>
                  <div># Truy cập trên trình duyệt: http://localhost:3000</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-800">Cách 2: Đóng gói thành file chạy Windows .exe</h5>
                <p className="text-slate-600">
                  Dự án đã sẵn sàng để tích hợp <span className="font-mono font-bold">electron-builder</span> hoặc <span className="font-mono font-bold">nativefier</span> để xuất tệp setup cài đặt cho Windows 10/11 mà không cần chỉnh sửa mã nguồn.
                </p>
                <div className="bg-slate-100 p-3 rounded-md font-mono text-[11px] text-slate-800">
                  npx nativefier --name "OCR-Nguyen-Van" "http://localhost:3000" --platform "windows"
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-md text-xs transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-md text-xs transition-colors shadow-xs"
          >
            Lưu Thiết Lập
          </button>
        </div>
      </div>
    </div>
  );
};
