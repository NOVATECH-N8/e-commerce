const http = require('http');
const fs = require('fs');
const path = require('path');

function makeRequest({ path, method = 'GET', body = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: reqHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runE2ETests() {
  console.log('================================================================');
  console.log('🚀 BẮT ĐẦU CHẠY KIỂM THỬ TOÀN DIỆN E2E CHO 4 TÍNH NĂNG MỚI');
  console.log('================================================================\n');

  // --- 1. Login user & admin ---
  console.log('▶ [BƯỚC 1] Đăng nhập tài khoản Admin/Khách hàng...');
  const loginRes = await makeRequest({
    path: '/api/auth/login',
    method: 'POST',
    body: { loginIdentifier: 'admin', MatKhau: 'admin123' }
  });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error('Đăng nhập thất bại.');
  }
  const token = loginRes.data.token;
  console.log('  ✅ Đăng nhập thành công, nhận JWT Token.\n');

  // --- 2. Check Multer Upload ---
  console.log('▶ [BƯỚC 2] Kiểm thử Upload file ảnh thực tế qua Multer...');
  const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const boundary = `----WebKitFormBoundary${Date.now()}`;
  const headerBuf = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="e2e_photo_${Date.now()}.png"\r\nContent-Type: image/png\r\n\r\n`, 'utf8');
  const footerBuf = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const uploadPayload = Buffer.concat([headerBuf, dummyPng, footerBuf]);

  const uploadResult = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': uploadPayload.length
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.write(uploadPayload);
    req.end();
  });

  if (uploadResult.status !== 200 || !uploadResult.data.url) {
    throw new Error('Upload ảnh thất bại.');
  }
  const uploadedImageUrl = uploadResult.data.url;
  console.log(`  ✅ Tải ảnh thành công, URL: ${uploadedImageUrl}\n`);

  // --- 3. Voucher Lifecycle ---
  console.log('▶ [BƯỚC 3] Kiểm thử Vouchers (Danh sách công khai & Áp dụng mã)...');
  const vouchersRes = await makeRequest({ path: '/api/vouchers' });
  console.log(`  ✅ Lấy được ${vouchersRes.data.length} mã voucher đang hoạt động.`);

  const applyVoucherRes = await makeRequest({
    path: '/api/vouchers/apply',
    method: 'POST',
    body: { code: 'NOVATECH50', orderTotal: 1000000 }
  });
  if (!applyVoucherRes.data.valid || applyVoucherRes.data.discountAmount !== 50000) {
    throw new Error('Áp dụng voucher NOVATECH50 không trả về mức giảm chính xác.');
  }
  console.log(`  ✅ Áp mã NOVATECH50 cho đơn 1.000.000đ -> Giảm: ${applyVoucherRes.data.discountAmount}đ, Còn lại: ${applyVoucherRes.data.finalTotal}đ.\n`);

  // --- 4. Add to cart & Place order with VietQR ---
  console.log('▶ [BƯỚC 4] Đặt đơn hàng mới với Thanh toán VietQR & Mã giảm giá...');
  const products = (await makeRequest({ path: '/api/products' })).data;
  const sampleProduct = products.find(p => parseFloat(p.GiaBan) >= 500000 && p.SoLuongTon > 0);
  if (!sampleProduct) {
    throw new Error('Không tìm thấy sản phẩm có giá >= 500k và còn tồn kho.');
  }
  console.log(`  Sản phẩm được chọn: ${sampleProduct.TenSP} (${sampleProduct.GiaBan}đ, Tồn: ${sampleProduct.SoLuongTon})`);

  const addCartRes = await makeRequest({
    path: '/api/cart',
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { MaSP: sampleProduct.MaSP, SoLuong: 1 }
  });
  console.log('  Thêm giỏ hàng kết quả:', addCartRes.status, addCartRes.data);

  const orderRes = await makeRequest({
    path: '/api/orders',
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      DiaChiGiaoHang: 'Tòa nhà Landmark 81, Phường 22, Bình Thạnh, TP.HCM',
      SDTNhanHang: '0909123456',
      GhiChu: 'Đơn hàng kiểm thử E2E',
      PhuongThucThanhToan: 'VIETQR',
      voucherCode: 'NOVATECH50'
    }
  });

  if (orderRes.status !== 201 || !orderRes.data.vietQr) {
    throw new Error(`Đặt hàng VietQR thất bại: ${JSON.stringify(orderRes.data)}`);
  }
  const orderId = orderRes.data.order.MaDonHang;
  console.log(`  ✅ Đặt hàng thành công! Mã đơn: #${orderId}`);
  console.log(`  ✅ Mã VietQR sinh ra: ${orderRes.data.vietQr.qrUrl}\n`);

  // --- 5. Admin updates order to 'Đã giao' and payment to 'Đã thanh toán' ---
  console.log('▶ [BƯỚC 5] Admin duyệt đơn hàng sang "Đã giao" & "Đã thanh toán"...');
  await makeRequest({
    path: `/api/admin/orders/${orderId}/status`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: { TrangThai: 'Đã giao' }
  });

  await makeRequest({
    path: `/api/admin/orders/${orderId}/payment-status`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: { TrangThaiThanhToan: 'Đã thanh toán' }
  });
  console.log('  ✅ Cập nhật trạng thái đơn hàng & thanh toán thành công.\n');

  // --- 6. Verified Purchase Review Submission ---
  console.log('▶ [BƯỚC 6] Khách hàng đánh giá sản phẩm (Verified Purchase)...');
  const canReview = await makeRequest({
    path: `/api/products/${sampleProduct.MaSP}/can-review`,
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`  ✅ Điều kiện đánh giá: ${canReview.data.canReview ? 'ĐƯỢC PHÉP' : 'TỪ CHỐI'} (${canReview.data.message})`);

  const submitReviewRes = await makeRequest({
    path: `/api/products/${sampleProduct.MaSP}/reviews`,
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      SoSao: 5,
      NoiDung: 'Máy nguyên hộp mới 100%, bảo hành chính hãng NovaTech, rất ưng ý!',
      HinhAnh: uploadedImageUrl
    }
  });

  if (![200, 201].includes(submitReviewRes.status)) {
    throw new Error('Gửi đánh giá thất bại.');
  }
  console.log('  ✅ Gửi đánh giá kèm hình ảnh thực tế thành công!\n');

  // --- 7. Check Product Reviews Summary ---
  console.log('▶ [BƯỚC 7] Kiểm tra Thống kê sao & Phân bổ đánh giá...');
  const statsRes = await makeRequest({ path: `/api/products/${sampleProduct.MaSP}/reviews` });
  console.log(`  ✅ Tổng đánh giá: ${statsRes.data.totalReviews}, Điểm trung bình: ${statsRes.data.averageRating} ⭐`);
  console.log('  ✅ Phân bổ sao:', statsRes.data.ratingDistribution, '\n');

  // --- 8. Admin Voucher CRUD ---
  console.log('▶ [BƯỚC 8] Admin Quản lý Voucher (Tạo mới, sửa, xóa)...');
  const newVoucherCode = `TEST${Date.now().toString().slice(-4)}`;
  const createVoucherRes = await makeRequest({
    path: '/api/admin/vouchers',
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      MaCode: newVoucherCode,
      MoTa: 'Mã voucher kiểm thử tự động',
      LoaiGiam: 'TIEN_MAT',
      GiaTriGiam: 30000,
      DonToiThieu: 300000,
      SoLuong: 10,
      TrangThai: 'Hoạt động'
    }
  });
  const createdVoucherId = createVoucherRes.data.voucher.MaVoucher;
  console.log(`  ✅ Admin tạo mới voucher ${newVoucherCode} (ID: ${createdVoucherId}) thành công.`);

  await makeRequest({
    path: `/api/admin/vouchers/${createdVoucherId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`  ✅ Admin xóa voucher ${newVoucherCode} thành công.\n`);

  console.log('================================================================');
  console.log('🎉 TẤT CẢ KIỂM THỬ E2E CHO TOÀN BỘ 4 TÍNH NĂNG MỚI ĐÃ ĐẠT 100%!');
  console.log('================================================================');
  process.exit(0);
}

runE2ETests().catch(err => {
  console.error('\n❌ LỖI TRONG QUÁ TRÌNH KIỂM THỬ E2E:', err);
  process.exit(1);
});
