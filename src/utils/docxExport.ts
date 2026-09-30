import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
  PageBreak,
} from 'docx';
import { DocumentPage } from '../types';

/**
 * Xử lý tạo phần tử văn bản hoặc bảng biểu từ đoạn text của một trang
 */
function parsePageElements(text: string, isLastPage: boolean, includePageBreak: boolean): (Paragraph | Table)[] {
  const lines = text.split('\n');
  const elements: (Paragraph | Table)[] = [];
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length === 0) return;

    const rows: TableRow[] = [];
    for (const rowLine of tableBuffer) {
      const rawCells = rowLine
        .split('|')
        .map((c) => c.trim())
        .filter((c, idx, arr) => (idx === 0 && c === '' ? false : idx === arr.length - 1 && c === '' ? false : true));

      // Bỏ qua dòng phân cách Markdown kiểu |---|---|
      if (rawCells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }

      const tableCells: TableCell[] = rawCells.map((cellText) => {
        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  font: 'Times New Roman',
                  size: 28, // 14pt (28 half-points)
                  color: '000000',
                }),
              ],
            }),
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: '333333' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: '333333' },
            left: { style: BorderStyle.SINGLE, size: 4, color: '333333' },
            right: { style: BorderStyle.SINGLE, size: 4, color: '333333' },
          },
          margins: {
            top: 120,
            bottom: 120,
            left: 150,
            right: 150,
          },
        });
      });

      if (tableCells.length > 0) {
        rows.push(new TableRow({ children: tableCells }));
      }
    }

    if (rows.length > 0) {
      elements.push(
        new Table({
          rows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        })
      );
      elements.push(new Paragraph({ children: [] }));
    }

    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Nhận diện dòng thuộc bảng biểu (| a | b | c |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      tableBuffer.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    // Bỏ qua dòng tiêu đề dạng 'TRANG 1', 'TRANG 2' để văn bản sạch theo yêu cầu mục 17
    if (/^TRANG\s+\d+$/i.test(trimmed)) {
      continue;
    }

    // Dòng kẻ phân cách '----------------------------------------'
    if (/^[-=_*]{5,}$/.test(trimmed)) {
      continue;
    }

    // Đoạn văn thông thường
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: 'Times New Roman',
            size: 28, // 14pt
            color: '000000',
          }),
        ],
        spacing: {
          line: 276, // 1.15 line spacing
          after: line.trim() === '' ? 120 : 60,
        },
      })
    );
  }

  flushTable();

  // Thêm ngắt trang (PageBreak) sau mỗi trang tài liệu nếu không phải trang cuối cùng
  if (!isLastPage && includePageBreak) {
    elements.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  return elements;
}

/**
 * Xuất danh sách trang sang Microsoft Word (.docx) chuẩn theo yêu cầu:
 * - Khổ giấy: A4 (lề chuẩn 20mm/25mm)
 * - Font: Times New Roman (cho TOÀN BỘ đoạn văn và bảng)
 * - Cỡ chữ: 14 pt (28 half-points)
 * - Màu chữ: Black (#000000)
 * - Page Break tự động giữa các trang ảnh
 * - Tên file: <Tên_tài_liệu>_OCR.docx
 */
export async function exportPagesToWord(
  pages: DocumentPage[],
  documentTitle: string = 'VanBan',
  includePageBreak: boolean = true
): Promise<void> {
  const allDocElements: (Paragraph | Table)[] = [];

  const pagesWithText = pages.filter((p) => p.rawText && p.rawText.trim().length > 0);

  if (pagesWithText.length === 0) {
    throw new Error('Chưa có nội dung OCR để xuất văn bản Word.');
  }

  pagesWithText.forEach((page, index) => {
    const isLast = index === pagesWithText.length - 1;
    const pageElements = parsePageElements(page.rawText, isLast, includePageBreak);
    allDocElements.push(...pageElements);
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width: 210mm in twips
              height: 16838, // A4 height: 297mm in twips
            },
            margin: {
              top: convertInchesToTwip(0.79), // ~20mm
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(0.98), // ~25mm
              right: convertInchesToTwip(0.79), // ~20mm
            },
          },
        },
        children: allDocElements,
      },
    ],
  });

  const cleanTitle = documentTitle.trim().replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_') || 'Tai_lieu';
  const filename = `${cleanTitle}_OCR.docx`;

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Xuất sang file TXT thuần (chỉ chứa nội dung OCR, không thêm nhận xét hay câu chào)
 */
export function exportPagesToTxt(
  pages: DocumentPage[],
  documentTitle: string = 'VanBan'
): void {
  const pagesWithText = pages.filter((p) => p.rawText && p.rawText.trim().length > 0);

  if (pagesWithText.length === 0) {
    throw new Error('Chưa có nội dung OCR để xuất file TXT.');
  }

  const textContent = pagesWithText.map((p) => p.rawText).join('\n\n\n');
  const cleanTitle = documentTitle.trim().replace(/[^a-zA-Z0-9_\u00C0-\u1EF9-]/g, '_') || 'Tai_lieu';
  const filename = `${cleanTitle}_OCR.txt`;

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
