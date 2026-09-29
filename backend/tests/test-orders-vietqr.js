const http = require('http');

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

async function testOrderVietQr() {
  console.log('--- Đang kiểm thử Đặt hàng kết hợp Voucher và Thanh toán VietQR ---');

  // 1. Login user
  const loginRes = await makeRequest({
    path: '/api/auth/login',
    method: 'POST',
    body: { loginIdentifier: 'admin', MatKhau: 'admin123' }
  });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error('Đăng nhập thất bại.');
  }
  const token = loginRes.data.token;
  console.log('✅ Đăng nhập tài khoản thành công.');

  // 2. Add product to cart
  const productsRes = await makeRequest({ path: '/api/products' });
  const product = productsRes.data.find(p => p.GiaBan >= 500000 && p.SoLuongTon > 0);
  if (!product) {
    throw new Error('Không tìm thấy sản phẩm đủ điều kiện (>= 500k và còn hàng).');
  }
  console.log(`Chọn sản phẩm: ${product.TenSP} (${product.GiaBan}đ)`);

  const addCartRes = await makeRequest({
    path: '/api/cart',
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { MaSP: product.MaSP, SoLuong: 1 }
  });
  if (addCartRes.status !== 200 && addCartRes.status !== 201) {
    throw new Error(`Thêm vào giỏ hàng thất bại: ${JSON.stringify(addCartRes.data)}`);
  }
  console.log('✅ Thêm sản phẩm vào giỏ hàng thành công.');

  // 3. Place order with VietQR and voucher NOVATECH50
  const orderRes = await makeRequest({
    path: '/api/orders',
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      DiaChiGiaoHang: '123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh',
      SDTNhanHang: '0988776655',
      GhiChu: 'Giao giờ hành chính',
      PhuongThucThanhToan: 'VIETQR',
      voucherCode: 'NOVATECH50'
    }
  });

  console.log(`Place order - Status: ${orderRes.status}`);
  if (orderRes.status !== 201 || !orderRes.data.order) {
    throw new Error(`Đặt đơn hàng thất bại: ${JSON.stringify(orderRes.data)}`);
  }

  const { order, vietQr } = orderRes.data;
  console.log('✅ Đặt đơn hàng thành công!');
  console.log(`- Mã đơn: #${order.MaDonHang}`);
  console.log(`- Phương thức: ${order.PhuongThucThanhToan}`);
  console.log(`- Tiền giảm giá: ${order.TienGiamGia}đ`);
  console.log(`- Tổng tiền sau giảm: ${order.TongTien}đ`);

  if (!vietQr || !vietQr.qrUrl) {
    throw new Error('Thiếu thông tin VietQR trong kết quả trả về.');
  }
  console.log(`✅ Thông tin VietQR sinh ra chính xác:`);
  console.log(`  - Ngân hàng: ${vietQr.bankId} | STK: ${vietQr.accountNo} | Tên: ${vietQr.accountName}`);
  console.log(`  - Nội dung CK: ${vietQr.memo}`);
  console.log(`  - Link QR Napas: ${vietQr.qrUrl}`);

  // 4. Test admin update payment status
  const updatePayRes = await makeRequest({
    path: `/api/admin/orders/${order.MaDonHang}/payment-status`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: { TrangThaiThanhToan: 'Đã thanh toán' }
  });
  if (updatePayRes.status !== 200 || updatePayRes.data.order.TrangThaiThanhToan !== 'Đã thanh toán') {
    throw new Error('Admin cập nhật trạng thái thanh toán thất bại.');
  }
  console.log('✅ Cập nhật trạng thái thanh toán sang "Đã thanh toán" thành công.');

  console.log('🎉 TẤT CẢ KIỂM THỬ CHO TASK 5 (ORDERS & VIETQR) ĐÃ ĐẠT!');
  process.exit(0);
}

testOrderVietQr().catch(err => {
  console.error('❌ Lỗi kiểm thử Orders VietQR:', err);
  process.exit(1);
});
