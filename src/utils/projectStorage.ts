import { DocumentPage, ProjectConfig, OcrProjectFile } from '../types';

const AUTO_SAVE_KEY = 'ocr_verbatim_autosave_v1';

/**
 * Xuất dự án ra file .ocrproject
 */
export function saveProjectToFile(
  pages: DocumentPage[],
  config: ProjectConfig,
  title: string = 'DuAn_OCR'
): void {
  const projectData: OcrProjectFile = {
    version: '1.0.0',
    timestamp: Date.now(),
    title,
    config,
    pages,
  };

  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const cleanTitle = title.trim().replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_') || 'DuAn_OCR';
  const filename = `${cleanTitle}.ocrproject`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Đọc file .ocrproject và trả về dữ liệu dự án
 */
export async function loadProjectFromFile(file: File): Promise<OcrProjectFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        if (!data || !Array.isArray(data.pages)) {
          throw new Error('Định dạng tệp .ocrproject không hợp lệ hoặc bị hỏng.');
        }
        resolve(data as OcrProjectFile);
      } catch (err: any) {
        reject(new Error(err.message || 'Không thể đọc tệp dự án.'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc tệp từ thiết bị.'));
    reader.readAsText(file);
  });
}

/**
 * Tự động lưu trạng thái dự án hiện tại vào bộ nhớ cục bộ
 */
export function autoSaveProject(pages: DocumentPage[], config: ProjectConfig): void {
  try {
    // Chỉ lưu nếu có dữ liệu
    if (pages.length === 0) {
      localStorage.removeItem(AUTO_SAVE_KEY);
      return;
    }

    const payload = {
      timestamp: Date.now(),
      config,
      // Lưu thông tin trang (lưu ý dung lượng localStorage ~5MB, nếu ảnh quá lớn chỉ lưu text và metadata nếu cần)
      pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        size: p.size,
        pageNumber: p.pageNumber,
        imageUrl: p.imageUrl.length < 500000 ? p.imageUrl : '', // Lưu ảnh nếu vừa phải
        rawText: p.rawText,
        suspiciousItems: p.suspiciousItems,
        status: p.status,
        isBlankPage: p.isBlankPage,
        isNoText: p.isNoText,
        isHandwriting: p.isHandwriting,
        userEdited: p.userEdited,
      })),
    };

    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Tránh crash nếu vượt quá dung lượng localStorage
    console.warn('Auto-save storage limit warning:', e);
  }
}

/**
 * Lấy dữ liệu tự động lưu nếu có
 */
export function getAutoSavedProject(): { pages: DocumentPage[]; config: ProjectConfig; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(AUTO_SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.pages) && data.pages.length > 0) {
      return data;
    }
  } catch (e) {
    console.warn('Error reading auto-save:', e);
  }
  return null;
}

/**
 * Xóa bản tự động lưu
 */
export function clearAutoSave(): void {
  try {
    localStorage.removeItem(AUTO_SAVE_KEY);
  } catch (e) {
    // Ignore
  }
}
