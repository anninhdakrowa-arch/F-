import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Cho phép payload hình ảnh base64 lớn
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * Lấy AI Client (hỗ trợ custom API Key từ người dùng gửi lên qua header hoặc dùng key server)
 */
function getAiClient(customKey?: string): GoogleGenAI | null {
  const key = customKey || process.env.GEMINI_API_KEY || '';
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION_VERBATIM = `BẠN LÀ MỘT HỆ THỐNG OCR CHUYÊN NGHIỆP DÙNG ĐỂ CHUYỂN VĂN BẢN TRONG HÌNH ẢNH THÀNH VĂN BẢN CÓ THỂ CHỈNH SỬA.
MỤC TIÊU CAO NHẤT: SAO CHÉP NGUYÊN VĂN NỘI DUNG NHÌN THẤY TRONG HÌNH ẢNH.
ƯU TIÊN ĐỘ CHÍNH XÁC CỦA VĂN BẢN HƠN LÀM CHO CÂU CHỮ ĐẸP HAY ĐÚNG NGỮ PHÁP.

NGUYÊN TẮC TUYỆT ĐỐI (20 ĐIỀU CẤM):
1. Không tự sửa lỗi chính tả.
2. Không sửa lỗi đánh máy có trong ảnh. (Ví dụ ảnh ghi "thực hiện nhiêm vụ" thì PHẢI chép đúng "thực hiện nhiêm vụ", tuyệt đối KHÔNG sửa thành "thực hiện nhiệm vụ").
3. Không tự thêm từ còn thiếu.
4. Không tự bỏ từ.
5. Không tự thay đổi câu chữ.
6. Không tự viết lại câu cho hay hơn.
7. Không tự diễn giải nội dung.
8. Không tự tóm tắt.
9. Không tự chuẩn hóa văn phong.
10. Không tự đổi thuật ngữ.
11. Không tự đổi tên người, tên cơ quan, địa danh.
12. Không tự đổi số, ngày tháng, ký hiệu văn bản (Ví dụ: "QĐ số 123/QĐ-CA" không được tự đoán thành "123/QĐ-CAT"; "01/7/2026" KHÔNG được đổi thành "1/7/2026").
13. Không tự đổi chữ hoa thành chữ thường hoặc ngược lại (Ví dụ: "CÔNG AN XÃ ĐĂK RƠ WA" phải giữ nguyên toàn bộ chữ hoa).
14. Không tự thêm hoặc bỏ dấu câu.
15. Không tự sửa dấu chấm, phẩy, hai chấm, chấm phẩy, ngoặc, gạch ngang, ngoặc kép...
16. Không tự sửa dấu tiếng Việt (ă, â, ê, ô, ơ, ư, á, à, ả, ã, ạ, đ/Đ...).
17. Không tự suy đoán chữ bị mờ.
18. Không tự đoán chữ bị che khuất.
19. Không tự đoán chữ viết tay nếu không chắc chắn (nếu phát hiện chữ viết tay không chắc chắn, ghi nhận cảnh báo).
20. Không tự thay thế nội dung không đọc rõ bằng nội dung AI cho rằng "hợp lý".

XỬ LÝ VĂN BẢN KHÔNG RÕ:
- Ký tự không rõ: Đánh dấu [?] (Ví dụ: "Chi b[?] An ninh").
- Từ/cụm từ không đọc được: Đánh dấu [KHÔNG ĐỌC RÕ].
Tuyệt đối KHÔNG tự đoán.

BẢO TOÀN CẤU TRÚC VĂN BẢN:
- Giữ nguyên tiêu đề, quốc hiệu, tiêu ngữ, số hiệu, ngày tháng, đề mục, đoạn văn, xuống dòng, danh sách, chữ in hoa, căn cứ, phần ký tên.
- Nếu có bảng biểu: Xuất theo định dạng bảng Markdown (| Cột 1 | Cột 2 |) bảo toàn số hàng, số cột và nội dung từng ô.

QUY TRÌNH KIỂM TRA 2 LẦN:
Sau khi OCR lần 1, tiến hành đọc lại hình ảnh từ đầu đến cuối, đối chiếu từng dòng giữa hình ảnh và bản chép để phát hiện:
- Ký tự hoặc dấu thanh tiếng Việt nghi ngờ / không rõ.
- Chữ số, ngày tháng, ký hiệu văn bản có khả năng đọc nhầm.
- Chữ viết tắt hoặc vết mờ.
- Phát hiện xem trang có phải là trang trắng (isBlankPage: true), ảnh không chứa văn bản (isNoText: true), hoặc có chữ viết tay cần chú ý (isHandwriting: true) hay không.

YÊU CẦU ĐỊNH DẠNG ĐẦU RA JSON:
Trả về duy nhất JSON hợp lệ (không kèm markdown ngoài) theo cấu trúc:
{
  "rawText": "Chuỗi văn bản OCR nguyên văn của trang",
  "isBlankPage": false,
  "isNoText": false,
  "isHandwriting": false,
  "suspiciousItems": [
    {
      "id": "s1",
      "line": 5,
      "text": "từ/ký tự nghi ngờ",
      "issue": "mô tả chi tiết lý do nghi ngờ (mờ nét, dấu hỏi/ngã, nghi ngờ n/m, chữ số mờ)"
    }
  ],
  "verificationNotes": "Báo cáo kiểm tra chất lượng của trang"
}`;

/**
 * Kiểm tra kết nối API Gemini
 */
app.post('/api/test-connection', async (req, res) => {
  try {
    const customKey = req.headers['x-gemini-api-key'] as string | undefined;
    const client = getAiClient(customKey);

    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'Chưa có API Key. Vui lòng nhập API Key hoặc cấu hình GEMINI_API_KEY trong hệ thống.',
      });
    }

    // Gửi test ping ngắn
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Ping',
    });

    if (response && response.text) {
      return res.json({
        success: true,
        message: 'Kết nối API Gemini thành công! Hệ thống sẵn sàng OCR.',
      });
    }

    throw new Error('Không nhận được phản hồi từ API Gemini.');
  } catch (error: any) {
    console.error('Test Connection Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi khi kiểm tra kết nối với API Gemini.',
    });
  }
});

/**
 * OCR từng trang đơn lẻ (Cho phép chạy hàng đợi phân tán, hiển thị tiến trình mượt mà, pause/resume, retry trang lỗi)
 */
app.post('/api/ocr-page', async (req, res) => {
  try {
    const { pageNumber, dataUrl } = req.body;
    const customKey = req.headers['x-gemini-api-key'] as string | undefined;
    const client = getAiClient(customKey);

    if (!dataUrl) {
      return res.status(400).json({ error: 'Thiếu dữ liệu hình ảnh (dataUrl).' });
    }

    if (!client) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server hoặc qua mục Cài đặt API.',
      });
    }

    const pageNum = pageNumber || 1;

    let mimeType = 'image/png';
    let base64Data = dataUrl;

    if (dataUrl.includes(';base64,')) {
      const parts = dataUrl.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/png';
      base64Data = parts[1];
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: `Thực hiện OCR NGUYÊN VĂN và KIỂM TRA 2 LẦN cho trang số ${pageNum}. Tuân thủ nghiêm ngặt 20 điều cấm và bảo toàn tối đa dấu câu, dấu tiếng Việt, cấu trúc bảng biểu.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_VERBATIM,
        temperature: 0,
        responseMimeType: 'application/json',
      },
    });

    let parsedResult = {
      rawText: '',
      isBlankPage: false,
      isNoText: false,
      isHandwriting: false,
      suspiciousItems: [] as any[],
      verificationNotes: '',
    };

    try {
      parsedResult = JSON.parse(response.text || '{}');
    } catch (err) {
      parsedResult = {
        rawText: response.text || '',
        isBlankPage: false,
        isNoText: false,
        isHandwriting: false,
        suspiciousItems: [],
        verificationNotes: 'Đã hoàn thành OCR nguyên văn.',
      };
    }

    const suspiciousWithPage = (parsedResult.suspiciousItems || []).map((item: any, idx: number) => ({
      id: item.id || `p${pageNum}-s${idx + 1}`,
      page: pageNum,
      line: item.line || 1,
      text: item.text || '[?]',
      issue: item.issue || 'Cần kiểm tra lại hình ảnh gốc',
      status: 'unresolved',
    }));

    res.json({
      pageNumber: pageNum,
      rawText: parsedResult.rawText || '',
      isBlankPage: Boolean(parsedResult.isBlankPage),
      isNoText: Boolean(parsedResult.isNoText),
      isHandwriting: Boolean(parsedResult.isHandwriting),
      suspiciousItems: suspiciousWithPage,
      verificationNotes: parsedResult.verificationNotes || '',
      status: suspiciousWithPage.length > 0 ? 'needs_review' : 'done',
    });
  } catch (error: any) {
    console.error(`OCR Page Error (Page ${req.body?.pageNumber}):`, error);
    res.status(500).json({
      pageNumber: req.body?.pageNumber || 1,
      error: error.message || 'Lỗi trong quá trình nhận diện OCR trang này.',
      status: 'error',
    });
  }
});

/**
 * Endpoint OCR nhiều ảnh tương thích ngược
 */
app.post('/api/ocr', async (req, res) => {
  try {
    const { pages } = req.body;
    const customKey = req.headers['x-gemini-api-key'] as string | undefined;
    const client = getAiClient(customKey);

    if (!Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({ error: 'Vui lòng cung cấp ít nhất một hình ảnh.' });
    }

    if (!client) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng cấu hình API Key trong bảng Cài đặt.',
      });
    }

    const processedPages = [];
    let combinedTextParts = [];
    const allSuspicious = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageNum = page.pageNumber || i + 1;

      let mimeType = 'image/png';
      let base64Data = page.dataUrl;

      if (page.dataUrl.includes(';base64,')) {
        const parts = page.dataUrl.split(';base64,');
        mimeType = parts[0].replace('data:', '') || 'image/png';
        base64Data = parts[1];
      }

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: `Thực hiện OCR NGUYÊN VĂN và KIỂM TRA 2 LẦN cho trang số ${pageNum}. Tuân thủ nghiêm ngặt 20 điều cấm.`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_VERBATIM,
          temperature: 0,
          responseMimeType: 'application/json',
        },
      });

      let parsedResult = {
        rawText: '',
        isBlankPage: false,
        isNoText: false,
        isHandwriting: false,
        suspiciousItems: [] as any[],
        verificationNotes: '',
      };

      try {
        parsedResult = JSON.parse(response.text || '{}');
      } catch (err) {
        parsedResult = {
          rawText: response.text || '',
          isBlankPage: false,
          isNoText: false,
          isHandwriting: false,
          suspiciousItems: [],
          verificationNotes: 'Đã hoàn thành OCR nguyên văn.',
        };
      }

      const suspiciousWithPage = (parsedResult.suspiciousItems || []).map((item: any, idx: number) => ({
        id: item.id || `p${pageNum}-s${idx + 1}`,
        page: pageNum,
        line: item.line || 1,
        text: item.text || '[?]',
        issue: item.issue || 'Cần kiểm tra lại hình ảnh gốc',
        status: 'unresolved',
      }));

      const pageStatus = suspiciousWithPage.length > 0 ? 'needs_review' : 'done';

      processedPages.push({
        id: `page-${pageNum}`,
        pageNumber: pageNum,
        imageUrl: page.dataUrl,
        rawText: parsedResult.rawText || '',
        suspiciousItems: suspiciousWithPage,
        status: pageStatus,
        isBlankPage: Boolean(parsedResult.isBlankPage),
        isNoText: Boolean(parsedResult.isNoText),
        isHandwriting: Boolean(parsedResult.isHandwriting),
      });

      allSuspicious.push(...suspiciousWithPage);
      combinedTextParts.push(parsedResult.rawText);
    }

    const combinedText = combinedTextParts.join('\n\n----------------------------------------\n\n');
    const hasUnclear = allSuspicious.length > 0;

    res.json({
      pages: processedPages,
      combinedText,
      allSuspicious,
      confidenceSummary: {
        totalPages: pages.length,
        totalSuspicious: allSuspicious.length,
        hasUnclear,
        warningMessage: hasUnclear
          ? '⚠ CẦN KIỂM TRA HÌNH ẢNH GỐC đối với các vị trí nghi ngờ được đánh dấu.'
          : '✓ Đã hoàn thành OCR. Không phát hiện vùng văn bản không rõ cần cảnh báo.',
      },
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({
      error: error.message || 'Lỗi trong quá trình nhận diện OCR hình ảnh.',
    });
  }
});

// Khởi chạy Vite trong chế độ middleware khi chạy dev
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server OCR đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
