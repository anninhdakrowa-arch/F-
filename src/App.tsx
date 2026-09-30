import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ImageViewer } from './components/ImageViewer';
import { TextEditor } from './components/TextEditor';
import { PageListSidebar } from './components/PageListSidebar';
import { InspectionPanel } from './components/InspectionPanel';
import { SettingsModal } from './components/SettingsModal';
import { DuplicateWarningModal } from './components/DuplicateWarningModal';
import { SuspiciousReviewModal } from './components/SuspiciousReviewModal';
import { SampleModal } from './components/SampleModal';
import {
  DocumentPage,
  ProjectConfig,
  SuspiciousItem,
  SampleDoc,
  PageStatus,
} from './types';
import { exportPagesToWord, exportPagesToTxt } from './utils/docxExport';
import { getSampleDocuments } from './utils/sampleDocuments';
import {
  saveProjectToFile,
  loadProjectFromFile,
  autoSaveProject,
  getAutoSavedProject,
  clearAutoSave,
} from './utils/projectStorage';
import {
  UploadCloud,
  FolderPlus,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  History,
  Info,
} from 'lucide-react';

const DEFAULT_CONFIG: ProjectConfig = {
  documentTitle: 'Tai_lieu',
  concurrency: 2,
  includePageBreak: true,
  autoSave: true,
};

export default function App() {
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [config, setConfig] = useState<ProjectConfig>(DEFAULT_CONFIG);

  // Trạng thái xử lý hàng đợi OCR
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Modals & Panels
  const [isInspectionOpen, setIsInspectionOpen] = useState<boolean>(false);
  const [isCompareActive, setIsCompareActive] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [reviewItem, setReviewItem] = useState<SuspiciousItem | null>(null);
  const [selectedSuspicious, setSelectedSuspicious] = useState<SuspiciousItem | null>(null);

  // Trùng lặp
  const [duplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);
  const [pendingDuplicates, setPendingDuplicates] = useState<DocumentPage[]>([]);

  // Tự động khôi phục
  const [hasRecovery, setHasRecovery] = useState<boolean>(false);
  const [recoveryData, setRecoveryData] = useState<{ pages: DocumentPage[]; config: ProjectConfig } | null>(null);

  // Thông báo / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Refs input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const [samples, setSamples] = useState<SampleDoc[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Khởi tạo mẫu & kiểm tra auto-save
  useEffect(() => {
    try {
      const generatedSamples = getSampleDocuments();
      setSamples(generatedSamples);

      const saved = getAutoSavedProject();
      if (saved && saved.pages.length > 0) {
        setHasRecovery(true);
        setRecoveryData(saved);
      }
    } catch (e) {
      console.error('Initialization error:', e);
    }
  }, []);

  // Tự động lưu khi danh sách trang hoặc nội dung thay đổi
  useEffect(() => {
    if (config.autoSave && pages.length > 0) {
      autoSaveProject(pages, config);
    }
  }, [pages, config]);

  const activePage = pages[activePageIndex];

  // Gom toàn bộ vị trí nghi ngờ từ tất cả các trang
  const allSuspicious = pages.flatMap((p) => p.suspiciousItems || []);
  const processedCount = pages.filter((p) => p.status === 'done' || p.status === 'needs_review' || p.status === 'reviewed').length;
  const errorCount = pages.filter((p) => p.status === 'error').length;

  // Xử lý nạp các tệp hình ảnh
  const processFiles = useCallback(
    (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        setErrorMessage('Không tìm thấy tệp hình ảnh hợp lệ.');
        return;
      }

      setErrorMessage(null);
      const existingNames = new Set(pages.map((p) => p.name.toLowerCase()));
      const duplicatesFound: string[] = [];
      const newPagesList: DocumentPage[] = [];

      let readCounter = 0;
      imageFiles.forEach((file, index) => {
        const fileName = file.name;
        if (existingNames.has(fileName.toLowerCase())) {
          duplicatesFound.push(fileName);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          newPagesList.push({
            id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: fileName,
            size: file.size,
            pageNumber: pages.length + index + 1,
            imageUrl: dataUrl,
            rawText: '',
            suspiciousItems: [],
            status: 'pending',
          });

          readCounter++;
          if (readCounter === imageFiles.length) {
            // Sắp xếp tự nhiên theo tên tệp (01.jpg, 02.jpg...)
            newPagesList.sort((a, b) =>
              a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
            );

            // Cập nhật lại số thứ tự trang tuần tự
            newPagesList.forEach((p, idx) => {
              p.pageNumber = pages.length + idx + 1;
            });

            if (duplicatesFound.length > 0) {
              setDuplicateNames(duplicatesFound);
              setPendingDuplicates(newPagesList);
              setDuplicateModalOpen(true);
            } else {
              setPages((prev) => {
                const combined = [...prev, ...newPagesList];
                combined.forEach((p, idx) => {
                  p.pageNumber = idx + 1;
                });
                return combined;
              });
              showToast(`Đã thêm ${newPagesList.length} ảnh vào danh sách.`);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [pages]
  );

  // Xử lý giữ cả hai hoặc xóa bản trùng
  const handleKeepBoth = () => {
    setPages((prev) => {
      const combined = [...prev, ...pendingDuplicates];
      combined.forEach((p, idx) => {
        p.pageNumber = idx + 1;
      });
      return combined;
    });
    setDuplicateModalOpen(false);
    setPendingDuplicates([]);
    showToast(`Đã giữ toàn bộ ${pendingDuplicates.length} ảnh.`);
  };

  const handleRemoveDuplicates = () => {
    const existingNames = new Set(pages.map((p) => p.name.toLowerCase()));
    const filtered = pendingDuplicates.filter((p) => !existingNames.has(p.name.toLowerCase()));

    setPages((prev) => {
      const combined = [...prev, ...filtered];
      combined.forEach((p, idx) => {
        p.pageNumber = idx + 1;
      });
      return combined;
    });
    setDuplicateModalOpen(false);
    setPendingDuplicates([]);
    showToast(`Đã bỏ qua các bản trùng, thêm ${filtered.length} ảnh mới.`);
  };

  // Kéo thả toàn màn hình
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Sắp xếp trang theo tên file (01, 02, 03...)
  const handleSortByName = () => {
    setPages((prev) => {
      const sorted = [...prev].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      sorted.forEach((p, idx) => {
        p.pageNumber = idx + 1;
      });
      return sorted;
    });
    showToast('Đã sắp xếp danh sách theo tên tệp (01, 02, 03...).');
  };

  // Di chuyển thứ tự trang
  const handleMovePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages((prev) => {
      const list = [...prev];
      const [item] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, item);
      list.forEach((p, idx) => {
        p.pageNumber = idx + 1;
      });
      return list;
    });
    setActivePageIndex(toIndex);
  };

  // Xóa 1 ảnh mà không làm ảnh hưởng ảnh khác
  const handleDeletePage = (index: number) => {
    setPages((prev) => {
      const list = prev.filter((_, idx) => idx !== index);
      list.forEach((p, idx) => {
        p.pageNumber = idx + 1;
      });
      return list;
    });
    if (activePageIndex >= pages.length - 1) {
      setActivePageIndex(Math.max(0, pages.length - 2));
    }
    showToast('Đã xóa ảnh.');
  };

  // Xóa toàn bộ
  const handleClearAll = () => {
    if (isProcessing) return;
    setPages([]);
    setActivePageIndex(0);
    clearAutoSave();
    setSelectedSuspicious(null);
    setIsInspectionOpen(false);
    showToast('Đã làm mới danh sách trang.');
  };

  // Phục hồi dự án auto-save
  const handleRecoverProject = () => {
    if (recoveryData) {
      setPages(recoveryData.pages);
      if (recoveryData.config) setConfig(recoveryData.config);
      setActivePageIndex(0);
      setHasRecovery(false);
      showToast('Đã khôi phục phiên làm việc trước đó!');
    }
  };

  const handleDismissRecovery = () => {
    setHasRecovery(false);
    clearAutoSave();
  };

  // OCR một trang cụ thể
  const ocrSinglePageCore = async (
    pageIndex: number,
    pagesList: DocumentPage[],
    signal?: AbortSignal
  ): Promise<DocumentPage> => {
    const page = pagesList[pageIndex];
    if (!page) throw new Error('Trang không tồn tại.');

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.customApiKey?.trim()) {
      headers['x-gemini-api-key'] = config.customApiKey.trim();
    }

    const res = await fetch('/api/ocr-page', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pageNumber: page.pageNumber,
        dataUrl: page.imageUrl,
      }),
      signal,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Lỗi OCR trang ${page.pageNumber}`);
    }

    return {
      ...page,
      rawText: data.rawText || '',
      suspiciousItems: data.suspiciousItems || [],
      isBlankPage: Boolean(data.isBlankPage),
      isNoText: Boolean(data.isNoText),
      isHandwriting: Boolean(data.isHandwriting),
      status: data.status || 'done',
      ocrTimestamp: Date.now(),
      errorMessage: undefined,
    };
  };

  // OCR lại 1 trang đơn lẻ theo mục 10
  const handleOcrSinglePage = async (pageIndex: number) => {
    if (isProcessing || !pages[pageIndex]) return;

    setPages((prev) => {
      const next = [...prev];
      next[pageIndex] = { ...next[pageIndex], status: 'processing' };
      return next;
    });

    try {
      const updated = await ocrSinglePageCore(pageIndex, pages);
      setPages((prev) => {
        const next = [...prev];
        next[pageIndex] = updated;
        return next;
      });
      showToast(`Đã hoàn thành OCR trang #${updated.pageNumber}`);
    } catch (err: any) {
      setPages((prev) => {
        const next = [...prev];
        next[pageIndex] = {
          ...next[pageIndex],
          status: 'error',
          errorMessage: err.message || 'Lỗi xử lý trang',
        };
        return next;
      });
      setErrorMessage(`Lỗi OCR trang #${pages[pageIndex].pageNumber}: ${err.message}`);
    }
  };

  // OCR Hàng loạt với Hàng đợi kiểm soát Concurrency và Khả năng chịu lỗi
  const runBatchOcr = async (targetIndices: number[]) => {
    if (targetIndices.length === 0) return;

    setIsProcessing(true);
    setIsPaused(false);
    setErrorMessage(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const concurrencyLimit = config.concurrency || 2;
    let nextIndexPtr = 0;
    let activeTasks = 0;

    // Đánh dấu các trang sắp chạy sang trạng thái processing hoặc pending
    setPages((prev) => {
      const list = [...prev];
      targetIndices.forEach((idx) => {
        if (list[idx]) {
          list[idx] = { ...list[idx], status: 'pending' };
        }
      });
      return list;
    });

    return new Promise<void>((resolve) => {
      const pump = () => {
        if (controller.signal.aborted) {
          setIsProcessing(false);
          setIsPaused(true);
          resolve();
          return;
        }

        // Kiểm tra xem đã xử lý xong toàn bộ danh sách chưa
        if (nextIndexPtr >= targetIndices.length && activeTasks === 0) {
          setIsProcessing(false);
          abortControllerRef.current = null;
          showToast(`Hoàn tất OCR ${targetIndices.length} trang!`);
          resolve();
          return;
        }

        // Kích hoạt các tác vụ trong giới hạn concurrency
        while (activeTasks < concurrencyLimit && nextIndexPtr < targetIndices.length && !controller.signal.aborted) {
          const pageIdx = targetIndices[nextIndexPtr++];
          activeTasks++;

          // Cập nhật trạng thái trang đang chạy 🟡
          setPages((prev) => {
            const next = [...prev];
            if (next[pageIdx]) next[pageIdx] = { ...next[pageIdx], status: 'processing' };
            return next;
          });

          ocrSinglePageCore(pageIdx, pages, controller.signal)
            .then((updatedPage) => {
              setPages((prev) => {
                const next = [...prev];
                next[pageIdx] = updatedPage;
                return next;
              });
            })
            .catch((err) => {
              if (controller.signal.aborted) return;
              console.error(`Page ${pageIdx + 1} OCR error:`, err);

              // Xử lý lỗi theo mục 9: Trang 17 lỗi thì Trang 18 vẫn tiếp tục!
              setPages((prev) => {
                const next = [...prev];
                if (next[pageIdx]) {
                  next[pageIdx] = {
                    ...next[pageIdx],
                    status: 'error',
                    errorMessage: err.message || 'Lỗi nhận diện trang',
                  };
                }
                return next;
              });
            })
            .finally(() => {
              activeTasks--;
              pump();
            });
        }
      };

      pump();
    });
  };

  // Bắt đầu OCR tất cả các trang
  const handleStartOcrAll = () => {
    if (pages.length === 0 || isProcessing) return;
    const allIndices = pages.map((_, idx) => idx);
    runBatchOcr(allIndices);
  };

  // Dừng OCR theo mục 44
  const handleStopOcr = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setIsPaused(true);
    showToast('Đã dừng OCR. Các trang đã hoàn thành được giữ nguyên.');
  };

  // Tiếp tục OCR theo mục 45
  const handleResumeOcr = () => {
    const uncompletedIndices = pages
      .map((p, idx) => (p.status === 'pending' || p.status === 'processing' || p.status === 'error' ? idx : -1))
      .filter((idx) => idx !== -1);

    if (uncompletedIndices.length === 0) {
      showToast('Tất cả các trang đều đã hoàn thành.');
      return;
    }
    runBatchOcr(uncompletedIndices);
  };

  // OCR lại các trang lỗi theo mục 11
  const handleOcrFailedPages = () => {
    const errorIndices = pages
      .map((p, idx) => (p.status === 'error' ? idx : -1))
      .filter((idx) => idx !== -1);

    if (errorIndices.length === 0) {
      showToast('Không có trang nào bị lỗi.');
      return;
    }
    showToast(`Đang chạy lại ${errorIndices.length} trang lỗi...`);
    runBatchOcr(errorIndices);
  };

  // Cập nhật văn bản trong editor
  const handleChangeText = (newText: string) => {
    if (!activePage) return;
    setPages((prev) => {
      const next = [...prev];
      next[activePageIndex] = {
        ...next[activePageIndex],
        rawText: newText,
        userEdited: true,
      };
      return next;
    });
  };

  // Xử lý hộp thoại đối chiếu nghi ngờ: GIỮ NGUYÊN (mục 14)
  const handleKeepOriginal = (item: SuspiciousItem) => {
    setPages((prev) => {
      const next = [...prev];
      const pageIdx = item.page - 1;
      if (next[pageIdx]) {
        const updatedItems = next[pageIdx].suspiciousItems.map((s) =>
          s.id === item.id ? { ...s, status: 'kept' as const } : s
        );
        const allResolved = updatedItems.every((s) => s.status === 'kept' || s.status === 'edited');
        next[pageIdx] = {
          ...next[pageIdx],
          suspiciousItems: updatedItems,
          status: allResolved ? 'reviewed' : next[pageIdx].status,
        };
      }
      return next;
    });
    showToast(`Đã giữ nguyên từ "${item.text}" theo đúng ảnh gốc.`);
  };

  // Xử lý hộp thoại đối chiếu nghi ngờ: SỬA THỦ CÔNG (mục 14)
  const handleManualEdit = (item: SuspiciousItem, newWord: string) => {
    setPages((prev) => {
      const next = [...prev];
      const pageIdx = item.page - 1;
      if (next[pageIdx]) {
        // Thay thế từ trong dòng văn bản
        const lines = next[pageIdx].rawText.split('\n');
        const lineIdx = item.line - 1;
        if (lines[lineIdx] && item.text) {
          lines[lineIdx] = lines[lineIdx].replace(item.text, newWord);
        }

        const updatedItems = next[pageIdx].suspiciousItems.map((s) =>
          s.id === item.id ? { ...s, text: newWord, status: 'edited' as const } : s
        );

        const allResolved = updatedItems.every((s) => s.status === 'kept' || s.status === 'edited');

        next[pageIdx] = {
          ...next[pageIdx],
          rawText: lines.join('\n'),
          suspiciousItems: updatedItems,
          status: allResolved ? 'reviewed' : next[pageIdx].status,
          userEdited: true,
        };
      }
      return next;
    });
    showToast(`Đã cập nhật sửa thủ công thành "${newWord}".`);
  };

  // Lưu dự án .ocrproject theo mục 24
  const handleSaveProject = () => {
    if (pages.length === 0) return;
    saveProjectToFile(pages, config, config.documentTitle);
    showToast('Đã lưu dự án thành tệp .ocrproject');
  };

  // Mở dự án .ocrproject
  const handleOpenProjectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const project = await loadProjectFromFile(file);
      setPages(project.pages || []);
      if (project.config) setConfig(project.config);
      setActivePageIndex(0);
      showToast(`Đã mở thành công dự án "${project.title}" (${project.pages.length} trang).`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi mở tệp dự án.');
    } finally {
      e.target.value = '';
    }
  };

  // Xuất file Word theo chuẩn mục 17, 18, 19, 21
  const handleDownloadWord = async () => {
    try {
      await exportPagesToWord(pages, config.documentTitle, config.includePageBreak);
      showToast('Đã xuất thành công file Word .docx chuẩn A4 Times New Roman 14pt!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xuất tài liệu Word.');
    }
  };

  // Xuất file TXT theo mục 20
  const handleDownloadTxt = () => {
    try {
      exportPagesToTxt(pages, config.documentTitle);
      showToast('Đã xuất thành công file TXT nguyên văn!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi xuất file TXT.');
    }
  };

  // Sao chép toàn bộ văn bản
  const handleCopyText = () => {
    const textToCopy = pages.map((p) => p.rawText).filter(Boolean).join('\n\n\n');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    showToast('Đã sao chép toàn bộ văn bản vào clipboard!');
  };

  // Chọn tài liệu mẫu
  const handleSelectSample = (sample: SampleDoc) => {
    const newPage: DocumentPage = {
      id: `sample-${Date.now()}`,
      name: `${sample.title}.png`,
      size: 1024 * 350,
      pageNumber: pages.length + 1,
      imageUrl: sample.imageDataUrl,
      rawText: '',
      suspiciousItems: [],
      status: 'pending',
    };
    setPages((prev) => {
      const combined = [...prev, newPage];
      combined.forEach((p, idx) => (p.pageNumber = idx + 1));
      return combined;
    });
    setActivePageIndex(pages.length);
    showToast(`Đã thêm mẫu "${sample.title}".`);
  };

  // Xử lý phím tắt theo mục 31
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + O: Thêm ảnh
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      // Ctrl + Shift + O: Thêm thư mục
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        folderInputRef.current?.click();
      }
      // Ctrl + S: Lưu dự án
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      // Ctrl + E: Xuất Word
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleDownloadWord();
      }
      // Delete: Xóa trang đang chọn
      if (e.key === 'Delete' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (pages.length > 0 && !isProcessing) {
          e.preventDefault();
          handleDeletePage(activePageIndex);
        }
      }
      // F5: OCR lại trang đang xem
      if (e.key === 'F5') {
        if (pages.length > 0 && !isProcessing) {
          e.preventDefault();
          handleOcrSinglePage(activePageIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pages, activePageIndex, isProcessing, config]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 select-none relative"
    >
      {/* Input ẩn cho file ảnh, thư mục, và file dự án .ocrproject */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) processFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        onChange={(e) => {
          if (e.target.files) processFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={projectInputRef}
        type="file"
        accept=".ocrproject,application/json"
        onChange={handleOpenProjectFile}
        className="hidden"
      />

      {/* Lớp phủ kéo thả tệp theo mục 32 */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-8 text-white pointer-events-none animate-in fade-in duration-100">
          <UploadCloud className="w-20 h-20 text-amber-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold">THẢ ẢNH VÀO ĐÂY</h2>
          <p className="text-sm text-slate-300 mt-2">
            Hỗ trợ kéo thả đồng thời 10, 50 hoặc 100 ảnh hoặc cả thư mục
          </p>
        </div>
      )}

      {/* Header chuẩn */}
      <Header
        onCopy={handleCopyText}
        onDownloadWord={handleDownloadWord}
        onDownloadTxt={handleDownloadTxt}
        copied={false}
        hasResult={pages.some((p) => p.rawText.length > 0)}
        totalSuspicious={allSuspicious.length}
      />

      {/* Toolbar đầy đủ chức năng theo yêu cầu */}
      <Toolbar
        onUploadClick={() => fileInputRef.current?.click()}
        onUploadFolderClick={() => folderInputRef.current?.click()}
        onSaveProject={handleSaveProject}
        onOpenProjectClick={() => projectInputRef.current?.click()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartOcr={handleStartOcrAll}
        onInspectErrors={() => setIsInspectionOpen(!isInspectionOpen)}
        onToggleCompare={() => setIsCompareActive(!isCompareActive)}
        onCopyText={handleCopyText}
        onDownloadWord={handleDownloadWord}
        onDownloadTxt={handleDownloadTxt}
        onClear={handleClearAll}
        onOpenSamples={() => setIsSampleModalOpen(true)}
        isProcessing={isProcessing}
        hasImages={pages.length > 0}
        hasResult={pages.some((p) => p.rawText.length > 0)}
        isCompareActive={isCompareActive}
        isInspectionOpen={isInspectionOpen}
        suspiciousCount={allSuspicious.length}
      />

      {/* Banner thông báo phục hồi Auto-Save theo mục 25 */}
      {hasRecovery && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-2.5 flex items-center justify-between text-xs text-amber-950 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">
              Phát hiện một dự án chưa hoàn thành ({recoveryData?.pages.length} trang). Bạn có muốn khôi phục?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRecoverProject}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded text-xs transition-colors"
            >
              Khôi phục dự án
            </button>
            <button
              onClick={handleDismissRecovery}
              className="px-2 py-1 text-amber-800 hover:text-amber-950 font-medium"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center justify-between text-xs text-red-800 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-900 font-bold px-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toast thông báo nhanh */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Khu vực nội dung chính */}
      <main className="flex-1 flex overflow-hidden relative" style={{ height: 'calc(100vh - 105px)' }}>
        {pages.length === 0 ? (
          /* Màn hình khởi tạo (Zero-state) */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-800 mb-6">
              <UploadCloud className="w-8 h-8 text-slate-700" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Hệ Thống OCR Chuyên Nghiệp — Sao Chép Nguyên Văn
            </h1>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-lg">
              Ưu tiên độ chính xác tuyệt đối. Bảo toàn 100% chính tả gốc, dấu tiếng Việt, dấu câu, cấu trúc bảng biểu, xử lý mượt mà từ 1 đến 100 ảnh.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>+ TẢI ẢNH TỪ MÁY</span>
              </button>

              <button
                onClick={() => folderInputRef.current?.click()}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-blue-600" />
                <span>THÊM THƯ MỤC</span>
              </button>
            </div>

            <div className="mt-3">
              <button
                onClick={() => setIsSampleModalOpen(true)}
                className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 flex items-center gap-1 mx-auto"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Hoặc thử nghiệm ngay với Kho tài liệu mẫu</span>
              </button>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left w-full text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900 block mb-1">Không Tự Sửa Lỗi</span>
                <span className="text-slate-500 leading-normal">
                  Giữ nguyên mọi lỗi gõ máy, chính tả hoặc từ ngữ trong ảnh gốc.
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900 block mb-1">Xử Lý 100 Ảnh Mượt Mà</span>
                <span className="text-slate-500 leading-normal">
                  Hàng đợi tự động, trang lỗi không làm dừng quy trình, có nút OCR lại trang lỗi.
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900 block mb-1">Xuất Word Chuẩn A4</span>
                <span className="text-slate-500 leading-normal">
                  Định dạng Times New Roman 14pt toàn bộ tài liệu, tự động ngắt trang.
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Bố cục làm việc với danh sách trang + Split-view */
          <div className="flex-1 flex w-full h-full overflow-hidden">
            {/* Cột 1: Danh Sách Trang & Hàng Đợi Batch */}
            <PageListSidebar
              pages={pages}
              activePageIndex={activePageIndex}
              onSelectPage={(idx) => {
                setActivePageIndex(idx);
                setSelectedSuspicious(null);
              }}
              onMovePage={handleMovePage}
              onDeletePage={handleDeletePage}
              onSortByName={handleSortByName}
              onOcrSinglePage={handleOcrSinglePage}
              onOcrFailedPages={handleOcrFailedPages}
              onStopOcr={handleStopOcr}
              onResumeOcr={handleResumeOcr}
              isProcessing={isProcessing}
              isPaused={isPaused}
              processedCount={processedCount}
              errorCount={errorCount}
            />

            {/* Cột 2: Ảnh gốc của trang đang chọn */}
            <div
              className={`h-full transition-all duration-200 ${
                isCompareActive ? 'flex-1' : 'hidden'
              }`}
            >
              <ImageViewer
                pages={pages}
                activePageIndex={activePageIndex}
                onPageChange={(idx) => {
                  setActivePageIndex(idx);
                  setSelectedSuspicious(null);
                }}
                selectedSuspicious={selectedSuspicious}
              />
            </div>

            {/* Cột 3: Văn bản OCR của trang đang chọn */}
            <div className={`h-full ${isCompareActive ? 'flex-1' : 'w-full'}`}>
              <TextEditor
                text={activePage?.rawText || ''}
                onChangeText={handleChangeText}
                suspiciousItems={activePage?.suspiciousItems || []}
                selectedSuspicious={selectedSuspicious}
                onSelectSuspicious={(item) => {
                  setSelectedSuspicious(item);
                  setReviewItem(item);
                }}
                isProcessing={activePage?.status === 'processing'}
                pageNumber={activePage?.pageNumber || activePageIndex + 1}
              />
            </div>
          </div>
        )}

        {/* Bảng Kiểm Tra OCR & Thẩm Định Nghi Ngờ */}
        <InspectionPanel
          isOpen={isInspectionOpen}
          onClose={() => setIsInspectionOpen(false)}
          pages={pages}
          allSuspicious={allSuspicious}
          selectedSuspicious={selectedSuspicious}
          onSelectSuspicious={(item) => {
            setSelectedSuspicious(item);
            const pageIdx = item.page - 1;
            if (pageIdx >= 0 && pageIdx < pages.length) {
              setActivePageIndex(pageIdx);
            }
          }}
          onReviewItem={(item) => setReviewItem(item)}
        />
      </main>

      {/* Modal Đối Chiếu Vị Trí Nghi Ngờ theo mục 14 */}
      <SuspiciousReviewModal
        item={reviewItem}
        onClose={() => setReviewItem(null)}
        onKeepOriginal={handleKeepOriginal}
        onManualEdit={handleManualEdit}
        pageImageUrl={activePage?.imageUrl}
      />

      {/* Modal Cảnh Báo Ảnh Trùng theo mục 38 */}
      <DuplicateWarningModal
        isOpen={duplicateModalOpen}
        duplicateCount={duplicateNames.length}
        duplicateNames={duplicateNames}
        onKeepBoth={handleKeepBoth}
        onRemoveDuplicates={handleRemoveDuplicates}
      />

      {/* Modal Cài Đặt API & Luồng */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => {
          setConfig(newConfig);
          showToast('Đã lưu thiết lập cấu hình.');
        }}
      />

      {/* Modal Tài Liệu Mẫu */}
      <SampleModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        samples={samples}
        onSelectSample={handleSelectSample}
      />
    </div>
  );
}
