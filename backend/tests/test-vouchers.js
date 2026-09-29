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

async function testVoucherApis() {
  console.log('--- Đang kiểm thử các API Quản lý & Xác thực Voucher ---');

  // 1. Test GET /api/vouchers
  const publicRes = await makeRequest({ path: '/api/vouchers' });
  console.log(`GET /api/vouchers - Status: ${publicRes.status}`);
  if (publicRes.status !== 200 || !Array.isArray(publicRes.data)) {
    throw new Error('Lỗi lấy danh sách voucher công khai.');
  }
  console.log(`✅ Lấy được ${publicRes.data.length} voucher công khai đang hoạt động.`);

  // 2. Test POST /api/vouchers/apply with NOVATECH50 (Valid spend: 600.000đ)
  const applyRes1 = await makeRequest({
    path: '/api/vouchers/apply',
    method: 'POST',
    body: { code: 'NOVATECH50', orderTotal: 600000 }
  });
  console.log(`Apply NOVATECH50 (600k) - Status: ${applyRes1.status}`, applyRes1.data);
  if (applyRes1.status !== 200 || !applyRes1.data.valid || applyRes1.data.discountAmount !== 50000) {
    throw new Error('Xác thực voucher NOVATECH50 không trả về mức giảm 50.000đ như mong đợi.');
  }
  console.log('✅ Áp dụng voucher cố định NOVATECH50 thành công: Giảm 50.000đ, còn 550.000đ');

  // 3. Test POST /api/vouchers/apply with NOVATECH50 under minimum spend (100.000đ)
  const applyRes2 = await makeRequest({
    path: '/api/vouchers/apply',
    method: 'POST',
    body: { code: 'NOVATECH50', orderTotal: 100000 }
  });
  console.log(`Apply NOVATECH50 (100k, dưới mức tối thiểu) - Status: ${applyRes2.status}`, applyRes2.data);
  if (applyRes2.status !== 400 || applyRes2.data.valid !== false) {
    throw new Error('Voucher không chặn đơn hàng dưới mức tối thiểu.');
  }
  console.log('✅ Chặn thành công đơn hàng chưa đạt giá trị tối thiểu.');

  // 4. Test POST /api/vouchers/apply with SALE10 (% giảm, 1.500.000đ -> giảm 10% = 150.000đ)
  const applyRes3 = await makeRequest({
    path: '/api/vouchers/apply',
    method: 'POST',
    body: { code: 'SALE10', orderTotal: 1500000 }
  });
  console.log(`Apply SALE10 (1.5tr) - Status: ${applyRes3.status}`, applyRes3.data);
  if (applyRes3.status !== 200 || !applyRes3.data.valid || applyRes3.data.discountAmount !== 150000) {
    throw new Error('Xác thực voucher SALE10 không trả về mức giảm 10% (150.000đ).');
  }
  console.log('✅ Áp dụng voucher phần trăm SALE10 thành công: Giảm 150.000đ, còn 1.350.000đ');

  // 5. Test mã không tồn tại
  const applyRes4 = await makeRequest({
    path: '/api/vouchers/apply',
    method: 'POST',
    body: { code: 'KHONGTONTAI999', orderTotal: 500000 }
  });
  if (applyRes4.status !== 404) {
    throw new Error('Không trả về mã 404 cho mã voucher không tồn tại.');
  }
  console.log('✅ Xử lý chính xác mã giảm giá không tồn tại (Status 404).');

  console.log('🎉 TẤT CẢ KIỂM THỬ CHO TASK 3 (VOUCHER APIS) ĐÃ ĐẠT!');
  process.exit(0);
}

testVoucherApis().catch(err => {
  console.error('❌ Lỗi kiểm thử Voucher:', err);
  process.exit(1);
});
