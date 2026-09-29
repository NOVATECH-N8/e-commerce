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

async function testReviewApis() {
  console.log('--- Đang kiểm thử các API Đánh giá & Bình luận (Reviews) ---');

  // 1. Get first product ID
  const productsRes = await makeRequest({ path: '/api/products' });
  if (productsRes.status !== 200 || !productsRes.data.length) {
    throw new Error('Không thể lấy danh sách sản phẩm để test.');
  }
  const productId = productsRes.data[0].MaSP;
  console.log(`Đang kiểm thử với Sản phẩm ID: ${productId} (${productsRes.data[0].TenSP})`);

  // 2. Test GET /api/products/:id/reviews
  const getReviewsRes = await makeRequest({ path: `/api/products/${productId}/reviews` });
  console.log(`GET /api/products/${productId}/reviews - Status: ${getReviewsRes.status}`);
  if (getReviewsRes.status !== 200) {
    throw new Error('Lỗi khi lấy danh sách đánh giá sản phẩm.');
  }
  console.log(`✅ Lấy đánh giá thành công: Tổng ${getReviewsRes.data.totalReviews} đánh giá, Trung bình: ${getReviewsRes.data.averageRating} ⭐`);

  // 3. Login as admin to get token
  const loginRes = await makeRequest({
    path: '/api/auth/login',
    method: 'POST',
    body: { loginIdentifier: 'admin', MatKhau: 'admin123' }
  });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error(`Đăng nhập admin thất bại: ${JSON.stringify(loginRes.data)}`);
  }
  const token = loginRes.data.token;
  console.log('✅ Đăng nhập Admin lấy token thành công.');

  // 4. Test GET /api/products/:id/can-review
  const canReviewRes = await makeRequest({
    path: `/api/products/${productId}/can-review`,
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Check can-review - Status: ${canReviewRes.status}`, canReviewRes.data);
  if (canReviewRes.status !== 200 || canReviewRes.data.canReview !== true) {
    throw new Error('Kiểm tra quyền đánh giá trả về không hợp lệ.');
  }
  console.log('✅ Kiểm tra quyền đánh giá (Verified Purchase check) hoạt động chính xác.');

  // 5. Test POST /api/products/:id/reviews (Submit review)
  const submitRes = await makeRequest({
    path: `/api/products/${productId}/reviews`,
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      SoSao: 5,
      NoiDung: 'Sản phẩm nguyên seal, hiệu năng cực kỳ mượt mà, camera xuất sắc!',
      HinhAnh: '/uploads/sample_review.jpg'
    }
  });
  console.log(`Submit review - Status: ${submitRes.status}`, submitRes.data);
  if (![200, 201].includes(submitRes.status) || !submitRes.data.review) {
    throw new Error('Gửi đánh giá thất bại.');
  }
  console.log('✅ Gửi đánh giá sản phẩm thành công!');

  // 6. Test GET /api/admin/reviews
  const adminReviewsRes = await makeRequest({
    path: '/api/admin/reviews',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Admin get reviews - Status: ${adminReviewsRes.status}`);
  if (adminReviewsRes.status !== 200 || !Array.isArray(adminReviewsRes.data)) {
    throw new Error('Admin lấy danh sách đánh giá thất bại.');
  }
  console.log(`✅ Admin lấy được ${adminReviewsRes.data.length} đánh giá trong hệ thống.`);

  console.log('🎉 TẤT CẢ KIỂM THỬ CHO TASK 4 (REVIEW APIS) ĐÃ ĐẠT!');
  process.exit(0);
}

testReviewApis().catch(err => {
  console.error('❌ Lỗi kiểm thử Reviews:', err);
  process.exit(1);
});
