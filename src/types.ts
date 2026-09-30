export type PageStatus =
  | 'pending'       // ● Chưa OCR
  | 'processing'    // 🟡 Đang OCR
  | 'done'          // ✓ OCR hoàn thành
  | 'needs_review'  // ⚠ Cần kiểm tra
  | 'reviewed'      // ✓ Đã kiểm tra
  | 'error';        // ✕ OCR lỗi

export interface SuspiciousItem {
  id: string;
  page: number;
  line: number;
  text: string;
  issue: string;
  status?: 'unresolved' | 'kept' | 'edited';
  suggested?: string;
  box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
}

export interface DocumentPage {
  id: string;
  name: string;
  size: number;
  pageNumber: number;
  imageUrl: string;
  rawText: string;
  suspiciousItems: SuspiciousItem[];
  status: PageStatus;
  errorMessage?: string;
  isHandwriting?: boolean;
  isBlankPage?: boolean;
  isNoText?: boolean;
  userEdited?: boolean;
  ocrTimestamp?: number;
}

export interface ProjectConfig {
  documentTitle: string;
  concurrency: number; // 1, 2, 3, 5
  customApiKey?: string;
  includePageBreak: boolean;
  autoSave: boolean;
}

export interface OcrResult {
  pages: DocumentPage[];
  combinedText: string;
  allSuspicious: SuspiciousItem[];
  confidenceSummary: {
    totalPages: number;
    totalSuspicious: number;
    hasUnclear: boolean;
    warningMessage?: string;
  };
}

export interface SampleDoc {
  id: string;
  title: string;
  description: string;
  tag: string;
  imageDataUrl: string;
}

export interface OcrProjectFile {
  version: string;
  timestamp: number;
  title: string;
  config: ProjectConfig;
  pages: DocumentPage[];
}
