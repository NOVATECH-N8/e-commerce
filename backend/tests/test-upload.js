const fs = require('fs');
const path = require('path');
const http = require('http');

async function testUpload() {
  console.log('--- Đang kiểm thử tính năng Upload file qua Multer ---');

  // 1. Create a tiny 1x1 dummy PNG image buffer
  const dummyPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  const boundary = `----WebKitFormBoundary${Date.now()}`;
  const filename = `test_dummy_${Date.now()}.png`;

  // Build multipart/form-data body
  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="image"; filename="${filename}"\r\n`,
    `Content-Type: image/png\r\n\r\n`
  ];
  const headerBuf = Buffer.from(bodyParts.join(''), 'utf8');
  const footerBuf = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const payload = Buffer.concat([headerBuf, dummyPngBuffer, footerBuf]);

  const reqOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': payload.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          console.log(`HTTP Status: ${res.statusCode}`);
          console.log(`Phản hồi: ${data}`);

          if (res.statusCode !== 200) {
            return reject(new Error(`Upload thất bại với status code ${res.statusCode}: ${data}`));
          }

          const parsed = JSON.parse(data);
          if (!parsed.url || !parsed.filename) {
            return reject(new Error('Dữ liệu trả về thiếu trường url hoặc filename.'));
          }

          // Check if file physically exists in backend/uploads
          const filePath = path.join(__dirname, '../uploads', parsed.filename);
          if (!fs.existsSync(filePath)) {
            return reject(new Error(`File không tồn tại trên ổ cứng tại: ${filePath}`));
          }
          console.log(`✅ File đã được lưu vật lý tại: ${filePath}`);

          // Test static route GET /uploads/filename
          http.get(`http://localhost:5000${parsed.url}`, (staticRes) => {
            if (staticRes.statusCode === 200) {
              console.log(`✅ Truy cập ảnh tĩnh qua route ${parsed.url} thành công! Status 200.`);
              resolve(parsed);
            } else {
              reject(new Error(`Không thể truy cập ảnh tĩnh: Status ${staticRes.statusCode}`));
            }
          }).on('error', reject);

        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}

testUpload()
  .then((result) => {
    console.log('🎉 TẤT CẢ KIỂM THỬ CHO TASK 1 (MULTER UPLOAD) ĐÃ ĐẠT!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Kiểm thử thất bại:', err.message);
    process.exit(1);
  });
