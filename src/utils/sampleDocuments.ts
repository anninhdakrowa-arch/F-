import { SampleDoc } from '../types';

/**
 * Tạo hình ảnh tài liệu mẫu chân thực bằng HTML Canvas (khổ A4 độ phân giải cao)
 */
function createDocumentCanvas(drawFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void): string {
  const canvas = document.createElement('canvas');
  // Kích thước tương đương 150 DPI khổ A4: 1240 x 1754
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Nền giấy hơi ngà tự nhiên của tài liệu in scan
  ctx.fillStyle = '#fcfbfa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Hiệu ứng vân giấy nhẹ / viền văn bản scan
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  for (let i = 0; i < 50; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
  }

  drawFn(ctx, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

/**
 * Danh sách tài liệu mẫu tiếng Việt chuẩn thể thức
 */
export function getSampleDocuments(): SampleDoc[] {
  // Mẫu 1: Quyết định hành chính (QĐ-UBND) có lỗi đánh máy gốc "nhiêm vụ" và ký hiệu hơi mờ
  const doc1 = createDocumentCanvas((ctx, w, h) => {
    ctx.fillStyle = '#111827';
    ctx.textBaseline = 'top';

    // Cơ quan ban hành (bên trái)
    ctx.font = 'normal 24px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('ỦY BAN NHÂN DÂN', 300, 100);
    ctx.font = 'bold 24px "Times New Roman", serif';
    ctx.fillText('TỈNH ĐỒNG NAI', 300, 135);
    ctx.font = 'normal 22px "Times New Roman", serif';
    ctx.fillText('Số: 142/QĐ-UBND', 300, 185);

    // Kẻ gạch ngang cơ quan
    ctx.beginPath();
    ctx.moveTo(220, 168);
    ctx.lineTo(380, 168);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#111827';
    ctx.stroke();

    // Quốc hiệu & Tiêu ngữ (bên phải)
    ctx.font = 'bold 24px "Times New Roman", serif';
    ctx.fillText('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 860, 100);
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText('Độc lập - Tự do - Hạnh phúc', 860, 135);

    // Kẻ gạch ngang tiêu ngữ
    ctx.beginPath();
    ctx.moveTo(740, 168);
    ctx.lineTo(980, 168);
    ctx.stroke();

    // Địa danh, ngày tháng
    ctx.font = 'italic 22px "Times New Roman", serif';
    ctx.textAlign = 'right';
    ctx.fillText('Biên Hòa, ngày 18 tháng 11 năm 2024', 1100, 220);

    // Tên loại văn bản & trích yếu
    ctx.textAlign = 'center';
    ctx.font = 'bold 30px "Times New Roman", serif';
    ctx.fillText('QUYẾT ĐỊNH', w / 2, 300);
    ctx.font = 'bold 24px "Times New Roman", serif';
    ctx.fillText('Về việc phân công thực hiện nhiệm vụ công tác quý IV năm 2024', w / 2, 345);

    // Kẻ gạch dưới trích yếu
    ctx.beginPath();
    ctx.moveTo(w / 2 - 180, 385);
    ctx.lineTo(w / 2 + 180, 385);
    ctx.stroke();

    // Nội dung căn cứ
    ctx.textAlign = 'left';
    ctx.font = 'italic 22px "Times New Roman", serif';
    let y = 430;
    const canCu = [
      'Căn cứ Luật Tổ chức chính quyền địa phương ngày 19 tháng 6 năm 2015;',
      'Căn cứ Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư;',
      'Xét đề nghị của Giám đốc Sở Nội vụ tại Tờ trình số 512/TTr-SNV ngày 10/11/2024,',
    ];
    canCu.forEach((txt) => {
      ctx.fillText(txt, 140, y);
      y += 40;
    });

    // QUYẾT ĐỊNH:
    y += 20;
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px "Times New Roman", serif';
    ctx.fillText('QUYẾT ĐỊNH:', w / 2, y);

    // Các điều
    y += 60;
    ctx.textAlign = 'left';
    ctx.font = 'normal 22px "Times New Roman", serif';

    // Lưu ý: Cố ý có lỗi đánh máy gốc trong ảnh để kiểm tra AI không được tự sửa
    const content = [
      'Điều 1. Phân công các phòng ban chuyên môn phối hợp cùng Chi b[?] An ninh',
      'để tổ chức thực hiện nhiêm vụ bảo đảm an ninh trật tự tại địa phương.',
      'Điều 2. Chánh Văn phòng UBND tỉnh, Giám đốc Sở Tư pháp, thủ trưởng các cơ quan,',
      'đơn vị có liên quan chịu trách nhiệm thi hành Quyết định này kể từ ngày ký./.',
    ];
    content.forEach((line) => {
      ctx.fillText(line, 140, y);
      y += 42;
    });

    // Nơi nhận & Ký tên
    y += 80;
    ctx.font = 'italic bold 18px "Times New Roman", serif';
    ctx.fillText('Nơi nhận:', 140, y);
    ctx.font = 'normal 17px "Times New Roman", serif';
    ctx.fillText('- Như Điều 2;', 140, y + 30);
    ctx.fillText('- Chủ tịch, các PCT UBND tỉnh;', 140, y + 55);
    ctx.fillText('- Lưu: VT, TH (03b).', 140, y + 80);

    // Ký thay
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText('TM. ỦY BAN NHÂN DÂN', 950, y);
    ctx.fillText('CHỦ TỊCH', 950, y + 35);

    // Con dấu đỏ mô phỏng
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.75)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(920, y + 150, 75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(920, y + 150, 68, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
    ctx.font = 'bold 15px "Times New Roman", serif';
    ctx.fillText('ỦY BAN NHÂN DÂN TỈNH', 920, y + 115);
    ctx.fillText('ĐỒNG NAI', 920, y + 175);

    // Chữ ký mô phỏng mực xanh
    ctx.strokeStyle = 'rgba(30, 64, 175, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(900, y + 140);
    ctx.bezierCurveTo(940, y + 110, 970, y + 170, 1020, y + 130);
    ctx.stroke();

    // Họ tên người ký
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px "Times New Roman", serif';
    ctx.fillText('Nguyễn Văn An', 950, y + 260);
  });

  // Mẫu 2: Bảng số liệu thống kê công tác có bảng biểu nhiều cột
  const doc2 = createDocumentCanvas((ctx, w, h) => {
    ctx.fillStyle = '#111827';
    ctx.textBaseline = 'top';

    // Tiêu đề
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px "Times New Roman", serif';
    ctx.fillText('BẢNG TỔNG HỢP TIẾN ĐỘ THỰC HIỆN CÔNG TÁC QUÝ III/2024', w / 2, 100);
    ctx.font = 'italic 20px "Times New Roman", serif';
    ctx.fillText('(Kèm theo Báo cáo số 88/BC-STP ngày 25 tháng 9 năm 2024)', w / 2, 140);

    // Vẽ bảng
    const tableTop = 220;
    const colWidths = [100, 380, 240, 240];
    const colLefts = [140, 240, 620, 860];
    const rowHeight = 65;

    const headers = ['STT', 'Nội dung công việc', 'Kế hoạch giao', 'Tỷ lệ hoàn thành (%)'];
    const rows = [
      ['01', 'Rà soát văn bản quy phạm pháp luật', '150 văn bản', '98,5%'],
      ['02', 'Số hóa hồ sơ hộ tịch lịch sử', '25.000 hồ sơ', '82,0%'],
      ['03', 'Tuyên truyền phổ biến GDPL trực tuyến', '12 đợt', '100%'],
      ['04', 'Kiểm tra công tác cải cách hành chính', '08 đơn vị', '75,0%'],
      ['05', 'Giải quyết hồ sơ đúng hạn tại Bộ phận 1 cửa', '1.420 hồ sơ', '99,8%'],
    ];

    // Vẽ tiêu đề cột
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(140, tableTop, 960, rowHeight);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(140, tableTop, 960, rowHeight);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 20px "Times New Roman", serif';
    headers.forEach((hTxt, idx) => {
      ctx.textAlign = idx === 1 ? 'left' : 'center';
      const x = idx === 1 ? colLefts[idx] + 20 : colLefts[idx] + colWidths[idx] / 2;
      ctx.fillText(hTxt, x, tableTop + 22);
    });

    // Vẽ các dòng dữ liệu
    rows.forEach((row, rIdx) => {
      const y = tableTop + (rIdx + 1) * rowHeight;
      ctx.strokeRect(140, y, 960, rowHeight);

      // Kẻ vạch dọc cột
      colLefts.forEach((cl) => {
        ctx.beginPath();
        ctx.moveTo(cl, tableTop);
        ctx.lineTo(cl, tableTop + (rows.length + 1) * rowHeight);
        ctx.stroke();
      });

      row.forEach((cTxt, cIdx) => {
        ctx.font = 'normal 20px "Times New Roman", serif';
        ctx.textAlign = cIdx === 1 ? 'left' : 'center';
        const x = cIdx === 1 ? colLefts[cIdx] + 20 : colLefts[cIdx] + colWidths[cIdx] / 2;
        ctx.fillText(cTxt, x, y + 22);
      });
    });

    // Ghi chú dưới bảng
    const noteY = tableTop + (rows.length + 1) * rowHeight + 40;
    ctx.textAlign = 'left';
    ctx.font = 'italic 19px "Times New Roman", serif';
    ctx.fillText('Ghi chú: Số liệu được chốt đến 17h00 ngày 24/9/2024.', 140, noteY);
    ctx.fillText('Các đơn vị chưa đạt chỉ tiêu cần khẩn trương khắc phục trong quý IV.', 140, noteY + 30);
  });

  return [
    {
      id: 'sample-qd-ubnd',
      title: 'Quyết định hành chính (QĐ-UBND)',
      description: 'Có Quốc hiệu, Tiêu ngữ, số hiệu văn bản, lỗi gõ máy gốc "nhiêm vụ" và con dấu đỏ.',
      tag: 'Văn bản hành chính',
      imageDataUrl: doc1,
    },
    {
      id: 'sample-bang-bieu',
      title: 'Báo cáo có Bảng biểu số liệu',
      description: 'Bảng thống kê 4 cột, chứa tỷ lệ phần trăm (%), số lượng và số thứ tự.',
      tag: 'Bảng biểu & Thống kê',
      imageDataUrl: doc2,
    },
  ];
}
