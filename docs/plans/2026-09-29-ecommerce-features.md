# Kế hoạch cải tổ & hoàn thiện tính năng E-commerce NovaTech

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Hoàn thiện 4 tính năng thương mại điện tử cốt lõi còn thiếu cho dự án NovaTech: Đánh giá & Bình luận (sao + ảnh + xác thực mua hàng), Hệ thống Mã giảm giá Voucher động, Thanh toán VietQR Napas 24/7 tự động, và Upload ảnh trực tiếp từ máy tính với Multer.

**Architecture:** Mở rộng kiến trúc MVC nguyên bản của dự án. Backend bổ sung 2 Model Sequelize (`DANHGIA`, `KHUYENMAI`), tích hợp `multer` phục vụ static uploads tại `/uploads`, xây dựng API RESTful cho reviews và vouchers, bổ sung logic trừ voucher và sinh mã VietQR trong `placeOrder`. Frontend bổ sung tab Đánh giá tại ProductDetails, thay thế hardcode voucher ở Cart/Checkout bằng API thực tế, tích hợp Modal VietQR và thêm trang quản trị Voucher & Reviews trong Admin CMS.

**Tech Stack:** React 19, Tailwind CSS v4, Lucide React, Node.js, Express, Sequelize (SQLite/MySQL), Multer, VietQR Napas247 QuickLink API.

---

### Task 1: Cài đặt thư viện Multer & Cấu hình Upload File ở Backend

**Files:**
- Modify: `backend/package.json`
- Create: `backend/middleware/upload.js`
- Modify: `backend/server.js:15-35`
- Create test script: `backend/tests/test-upload.js`

**Step 1: Cài đặt thư viện `multer` trong backend**
- Command: `npm install multer` tại thư mục `backend`

**Step 2: Tạo middleware xử lý upload lưu vào thư mục `backend/uploads/`**
- File `backend/middleware/upload.js`:
  - Khởi tạo diskStorage với destination: `path.join(__dirname, '../uploads')`
  - Đặt tên file duy nhất: `${Date.now()}-${file.originalname}`
  - Filter chỉ chấp nhận file ảnh: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - Giới hạn kích thước file tối đa: 5MB

**Step 3: Cấu hình thư mục tĩnh và route upload trong `backend/server.js`**
- Thêm `app.use('/uploads', express.static(path.join(__dirname, 'uploads')));`
- Thêm route `POST /api/upload`: nhận `single('image')` hoặc `array('images', 5)`, trả về `{ url: '/uploads/filename.ext' }`

**Step 4: Kiểm thử upload file**
- Chạy script test tạo file ảnh tạm và gửi multipart request đến `http://localhost:5000/api/upload`
- Đảm bảo server trả về status 200 và url ảnh hợp lệ.

**Step 5: Checkpoint commit**
- `git add backend/`
- `git commit -m "feat(backend): add multer file upload middleware and /api/upload route"`

---

### Task 2: Cơ sở dữ liệu - Khởi tạo Models `DANHGIA` và `KHUYENMAI`

**Files:**
- Modify: `backend/models/index.js`
- Modify: `backend/seed-fake.js` (hoặc script test migration)

**Step 1: Khai báo Model `DANHGIA` trong `backend/models/index.js`**
- Thuộc tính:
  - `MaDanhGia`: INTEGER, PK, autoIncrement
  - `MaSP`: INTEGER, FK -> SanPham
  - `MaKH`: INTEGER, FK -> NguoiDung
  - `SoSao`: INTEGER (1 - 5, allowNull: false)
  - `NoiDung`: TEXT (allowNull: true)
  - `HinhAnh`: STRING(500) (allowNull: true)
  - `TrangThai`: STRING(50) (defaultValue: 'Hiển thị')
  - `NgayDanhGia`: DATE (defaultValue: DataTypes.NOW)

**Step 2: Khai báo Model `KHUYENMAI` trong `backend/models/index.js`**
- Thuộc tính:
  - `MaVoucher`: INTEGER, PK, autoIncrement
  - `MaCode`: STRING(50), unique, allowNull: false
  - `MoTa`: STRING(255)
  - `LoaiGiam`: STRING(20) ('TIEN_MAT' | 'PHAN_TRAM')
  - `GiaTriGiam`: DECIMAL(12, 2), allowNull: false
  - `GiaTriToiDa`: DECIMAL(12, 2), allowNull: true
  - `DonToiThieu`: DECIMAL(12, 2), defaultValue: 0
  - `SoLuong`: INTEGER, defaultValue: 100
  - `NgayBatDau`: DATEONLY
  - `NgayHetHan`: DATEONLY
  - `TrangThai`: STRING(50) (defaultValue: 'Hoạt động')

**Step 3: Cập nhật các cột thanh toán và voucher cho Model `DONHANG`**
- Thêm trường:
  - `PhuongThucThanhToan`: STRING(50), defaultValue: 'COD'
  - `TrangThaiThanhToan`: STRING(50), defaultValue: 'Chưa thanh toán'
  - `MaVoucher`: INTEGER, allowNull: true
  - `TienGiamGia`: DECIMAL(12, 2), defaultValue: 0

**Step 4: Thiết lập quan hệ (Associations)**
- `SanPham.hasMany(DanhGia, { foreignKey: 'MaSP', as: 'DanhGias' })`
- `DanhGia.belongsTo(SanPham, { foreignKey: 'MaSP', as: 'SanPham' })`
- `NguoiDung.hasMany(DanhGia, { foreignKey: 'MaKH', as: 'DanhGias' })`
- `DanhGia.belongsTo(NguoiDung, { foreignKey: 'MaKH', as: 'NguoiDung' })`
- `DonHang.belongsTo(KhuyenMai, { foreignKey: 'MaVoucher', as: 'Voucher' })`

**Step 5: Đồng bộ database và thêm dữ liệu mẫu**
- Thêm 3-4 voucher mẫu (vd: `NOVATECH50`, `GIAM100K`, `TRIAN10`) và vài đánh giá mẫu trong quá trình khởi tạo.
- Khởi chạy server xác nhận SQLite đồng bộ các bảng mới không lỗi.

**Step 6: Checkpoint commit**
- `git commit -m "feat(database): add DanhGia and KhuyenMai models with relationships"`

---

### Task 3: Backend - Xây dựng Controller & API Quản lý Voucher (Khuyến mãi)

**Files:**
- Create: `backend/controllers/voucherController.js`
- Modify: `backend/server.js`

**Step 1: Viết API kiểm tra và áp dụng mã voucher cho khách (`POST /api/vouchers/apply`)**
- Input: `{ code, orderTotal }`
- Logic kiểm tra:
  1. Tìm voucher theo `MaCode` (viết hoa, trim).
  2. Kiểm tra `TrangThai === 'Hoạt động'`.
  3. Kiểm tra ngày hết hạn `NgayHetHan >= today`.
  4. Kiểm tra số lượng còn lại `SoLuong > 0`.
  5. Kiểm tra giá trị đơn tối thiểu `orderTotal >= DonToiThieu`.
  6. Tính số tiền được giảm:
     - Nếu `LoaiGiam === 'TIEN_MAT'`: `giam = GiaTriGiam`
     - Nếu `LoaiGiam === 'PHAN_TRAM'`: `giam = orderTotal * (GiaTriGiam / 100)`, không vượt quá `GiaTriToiDa` (nếu có).
  7. Trả về: `{ success: true, voucher: {...}, discountAmount: giam, finalTotal: orderTotal - giam }`

**Step 2: Viết API danh sách voucher công khai (`GET /api/vouchers`)**
- Trả về các voucher đang hoạt động để hiển thị ở Giỏ hàng cho khách chọn nhanh.

**Step 3: Viết các API CRUD Voucher cho Admin (`/api/admin/vouchers`)**
- `GET /api/admin/vouchers`: Lấy tất cả voucher kèm số lượng và trạng thái.
- `POST /api/admin/vouchers`: Tạo voucher mới (có validate không trùng mã).
- `PUT /api/admin/vouchers/:id`: Sửa thông tin voucher.
- `DELETE /api/admin/vouchers/:id`: Xóa hoặc đổi trạng thái sang 'Đã hủy'.

**Step 4: Đăng ký routes vào `backend/server.js` và kiểm thử API qua cURL/Postman**
- Gọi thử `POST /api/vouchers/apply` với mã hợp lệ và mã không hợp lệ, xác nhận phản hồi đúng.

**Step 5: Checkpoint commit**
- `git commit -m "feat(backend): implement voucher validation and admin CRUD APIs"`

---

### Task 4: Backend - Xây dựng Controller & API Đánh giá & Bình luận (Reviews)

**Files:**
- Create: `backend/controllers/reviewController.js`
- Modify: `backend/server.js`

**Step 1: Viết API lấy danh sách đánh giá của sản phẩm (`GET /api/products/:id/reviews`)**
- Lấy tất cả đánh giá có `TrangThai === 'Hiển thị'` của sản phẩm.
- Include thông tin người dùng (`TenKH`, che bớt SĐT/email để bảo mật).
- Tính toán thống kê:
  - `averageRating`: Điểm trung bình sao (vd: 4.7)
  - `totalReviews`: Tổng số đánh giá
  - `ratingDistribution`: Số lượng đánh giá theo từng mức 1, 2, 3, 4, 5 sao.

**Step 2: Viết API gửi đánh giá sản phẩm (`POST /api/products/:id/reviews`, có verifyToken)**
- Input: `{ SoSao, NoiDung, HinhAnh }`
- Nghiệp vụ kiểm tra mua hàng (Verified Purchase):
  - Tìm trong `DonHang` của `req.user.MaKH` có trạng thái `'Đã giao'` (hoặc `'Hoàn thành'`).
  - Kiểm tra xem đơn hàng đó có chứa `MaSP` này trong `ChiTietDonHang` không.
  - Nếu chưa mua hoặc đơn chưa giao thành công, trả về lỗi 403: "Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công."
  - Tạo bản ghi mới trong bảng `DANHGIA`.

**Step 3: Viết API quản lý đánh giá cho Admin (`/api/admin/reviews`)**
- `GET /api/admin/reviews`: Lấy tất cả đánh giá của toàn bộ hệ thống, lọc theo sản phẩm hoặc số sao.
- `PUT /api/admin/reviews/:id/status`: Ẩn/Hiện đánh giá.
- `DELETE /api/admin/reviews/:id`: Xóa đánh giá spam.

**Step 4: Đăng ký routes trong `backend/server.js` và kiểm thử**

**Step 5: Checkpoint commit**
- `git commit -m "feat(backend): implement product reviews and verified purchase check APIs"`

---

### Task 5: Backend - Cập nhật Tạo Đơn Hàng & Tích hợp Thanh toán VietQR

**Files:**
- Modify: `backend/controllers/orderController.js`
- Modify: `backend/server.js`

**Step 1: Nâng cấp hàm `placeOrder` trong `backend/controllers/orderController.js`**
- Tiếp nhận thêm các trường từ body: `PhuongThucThanhToan` ('COD' | 'VIETQR'), `voucherCode`.
- Nếu có `voucherCode`:
  - Kiểm tra tính hợp lệ của voucher trong transaction.
  - Tính số tiền giảm giá `TienGiamGia`.
  - Trừ 1 lượt sử dụng của voucher (`voucher.SoLuong -= 1`).
  - Gán `MaVoucher` và `TienGiamGia` vào đơn hàng.
  - Tính `TongTien` cuối cùng sau khi trừ voucher.

**Step 2: Tích hợp sinh URL thanh toán VietQR động**
- Cấu hình thông tin tài khoản thụ hưởng trong `backend/.env` (hoặc hằng số config mặc định cho đồ án):
  - `BANK_ID`: 'MB' (MBBank) hoặc 'VCB' (Vietcombank)
  - `ACCOUNT_NO`: '0333888999'
  - `ACCOUNT_NAME`: 'CONG TY NOVATECH'
- Nếu `PhuongThucThanhToan === 'VIETQR'`:
  - Tạo link VietQR chuẩn Napas:
    `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${order.TongTien}&addInfo=NOVATECH%20DH${order.MaDonHang}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`
  - Đính kèm URL này và thông tin chuyển khoản vào phản hồi API đơn hàng.

**Step 3: Thêm API cho khách hoặc Admin cập nhật trạng thái thanh toán**
- Route `PUT /api/orders/:id/payment-status` (Admin chuyển sang 'Đã thanh toán' khi nhận được tiền).

**Step 4: Kiểm thử luồng đặt hàng kèm Voucher và VietQR**

**Step 5: Checkpoint commit**
- `git commit -m "feat(backend): integrate dynamic voucher deduction and VietQR generation in placeOrder"`

---

### Task 6: Frontend - Quản lý Voucher & Áp dụng mã trong Giỏ hàng & Thanh toán

**Files:**
- Modify: `frontend/src/pages/Cart.jsx`
- Modify: `frontend/src/pages/Checkout.jsx`
- Create modal/component: `frontend/src/components/VoucherSelectorModal.jsx`

**Step 1: Nâng cấp trang Giỏ hàng ([Cart.jsx](file:///d:/Nam3-Ky2/e-commerce-website/frontend/src/pages/Cart.jsx))**
- Xóa bỏ logic voucher hardcode cũ.
- Kết nối gọi API `POST /api/vouchers/apply` với số tiền giỏ hàng hiện tại.
- Hiển thị nút "Chọn hoặc nhập mã giảm giá", mở modal danh sách voucher đang có để khách chọn nhanh bằng 1 click.
- Hiển thị rõ số tiền giảm và tổng thanh toán mới, lưu voucher đã áp dụng vào state để chuyển sang Checkout.

**Step 2: Nâng cấp trang Thanh toán ([Checkout.jsx](file:///d:/Nam3-Ky2/e-commerce-website/frontend/src/pages/Checkout.jsx))**
- Thêm mục lựa chọn phương thức thanh toán:
  - 🔘 **Thanh toán khi nhận hàng (COD)**
  - 🔘 **Chuyển khoản qua mã QR (VietQR Napas 24/7)** - Đề xuất khuyên dùng, giảm thiểu tiếp xúc tiền mặt.
- Gửi `voucherCode` và `PhuongThucThanhToan` lên API `POST /api/orders`.

**Step 3: Xây dựng màn hình xác nhận đơn hàng kèm mã VietQR**
- Khi chọn VietQR:
  - Hiển thị khung quét mã QR thanh toán chuẩn Napas sinh ra từ VietQR API.
  - Hiển thị chi tiết: Ngân hàng, Số tài khoản, Chủ tài khoản, Số tiền, Nội dung chuyển khoản (`NOVATECH DH...`).
  - Thêm nút "Sao chép số tài khoản", "Sao chép nội dung", "Tải mã QR về máy".

**Step 4: Kiểm thử giao diện và luồng thanh toán giỏ hàng trên trình duyệt**

**Step 5: Checkpoint commit**
- `git commit -m "feat(frontend): connect real vouchers API and VietQR payment modal in checkout"`

---

### Task 7: Frontend - Tích hợp Đánh giá & Bình luận tại Trang Chi tiết Sản phẩm

**Files:**
- Modify: `frontend/src/pages/ProductDetails.jsx`
- Create: `frontend/src/components/ProductReviews.jsx`

**Step 1: Tạo component `ProductReviews.jsx`**
- Gọi API `GET /api/products/:id/reviews` để lấy danh sách đánh giá và thông số sao trung bình.
- Hiển thị bảng tổng hợp đánh giá (Rating Summary):
  - Điểm trung bình (vd: 4.8 / 5) kèm dãy 5 sao màu vàng.
  - Thanh phần trăm số lượng đánh giá cho các mức từ 5 sao xuống 1 sao.
  - Bộ lọc xem theo số sao (Tất cả, 5 sao, 4 sao, Có hình ảnh).

**Step 2: Xây dựng Form gửi đánh giá mới (Review Form)**
- Nút bấm "Viết đánh giá của bạn".
- Chọn số sao tương tác (hover/click chuyển đổi màu sao vàng rực rỡ).
- Khung nhập nhận xét chi tiết.
- Nút chọn ảnh từ máy tính (Upload ảnh chụp thực tế sản phẩm thông qua API `/api/upload` của Multer).
- Bấm "Gửi đánh giá": Nếu tài khoản chưa từng mua sản phẩm này, hiển thị Toast thông báo thân thiện giải thích lý do cần mua hàng trước khi đánh giá.

**Step 3: Nhúng component vào cuối trang `ProductDetails.jsx` và đồng bộ số sao thực tế ở đầu trang**

**Step 4: Kiểm thử trải nghiệm đánh giá và hiển thị ảnh đánh giá**

**Step 5: Checkpoint commit**
- `git commit -m "feat(frontend): integrate product reviews, star rating stats, and review submission with image upload"`

---

### Task 8: Frontend Admin CMS - Quản lý Voucher, Đánh giá & Nâng cấp Upload ảnh Sản phẩm

**Files:**
- Create: `frontend/src/pages/admin/VoucherAdmin.jsx`
- Create: `frontend/src/pages/admin/ReviewAdmin.jsx`
- Modify: `frontend/src/pages/admin/ProductAdmin.jsx`
- Modify: `frontend/src/pages/admin/AdminLayout.jsx`
- Modify: `frontend/src/App.jsx`

**Step 1: Tạo trang Quản lý Voucher ([VoucherAdmin.jsx](file:///d:/Nam3-Ky2/e-commerce-website/frontend/src/pages/admin/VoucherAdmin.jsx))**
- Bảng danh sách mã giảm giá: Mã, Loại giảm, Mức giảm, Đơn tối thiểu, Lượt còn lại, Hạn dùng, Trạng thái.
- Form tạo mới / sửa Voucher: Modal pop-up thân thiện, tự động sinh mã hoặc nhập tay.
- Nút Xóa / Bật / Tắt kích hoạt nhanh voucher.

**Step 2: Tạo trang Quản lý Đánh giá ([ReviewAdmin.jsx](file:///d:/Nam3-Ky2/e-commerce-website/frontend/src/pages/admin/ReviewAdmin.jsx))**
- Bảng danh sách đánh giá của khách hàng: Sản phẩm, Khách hàng, Số sao, Nội dung, Ảnh đính kèm, Thời gian.
- Nút Ẩn / Hiện hoặc Xóa các đánh giá không phù hợp.

**Step 3: Nâng cấp form Thêm/Sửa sản phẩm trong [ProductAdmin.jsx](file:///d:/Nam3-Ky2/e-commerce-website/frontend/src/pages/admin/ProductAdmin.jsx)**
- Bên cạnh ô nhập link URL, thêm nút "Chọn ảnh từ máy tính" (`<input type="file" />`).
- Khi chọn file, tự động upload lên `/api/upload` và điền URL trả về vào form, hiển thị khung xem trước (Image Preview) sắc nét.

**Step 4: Cập nhật menu điều hướng Admin ([AdminLayout.jsx](file:///d:/Nam3-Ky2/e-commerce-website/frontend/src/pages/admin/AdminLayout.jsx)) & Routes ([App.jsx](file:///d:/Nam3-Ky2/e-commerce-website/frontend/src/App.jsx))**
- Thêm 2 mục menu mới vào sidebar Admin:
  - 🎟️ **Mã giảm giá** (`/admin/vouchers`)
  - ⭐ **Đánh giá & Nhận xét** (`/admin/reviews`)

**Step 5: Checkpoint commit**
- `git commit -m "feat(admin): add VoucherAdmin, ReviewAdmin, and Multer file picker to ProductAdmin"`

---

### Task 9: Kiểm thử tích hợp toàn diện (E2E Integration & Verification)

**Files:**
- Create seed / helper data: `backend/seed-fake.js`

**Step 1: Khởi động hệ thống và nạp dữ liệu demo**
- Khởi động Backend (Port 5000) và Frontend (Port 5173).
- Nạp sẵn 3 mã voucher thực tế (`NOVATECH50`, `GIAM100K`, `FREEVIP`) và một số đánh giá có ảnh mẫu.

**Step 2: Kiểm thử luồng khách hàng (Customer Journey)**
1. Đăng nhập tài khoản khách hàng.
2. Thêm sản phẩm vào giỏ hàng.
3. Mở giỏ hàng, áp dụng mã `NOVATECH50` -> kiểm tra số tiền giảm được trừ chính xác.
4. Tiến hành Checkout -> chọn phương thức Chuyển khoản VietQR.
5. Đặt hàng thành công -> Modal/Khung VietQR xuất hiện với đúng số tiền sau voucher và mã đơn hàng.
6. Vào trang chi tiết sản phẩm xem bảng thống kê số sao và các bình luận khách hàng.

**Step 3: Kiểm thử luồng quản trị (Admin Journey)**
1. Đăng nhập tài khoản Admin.
2. Vào Quản lý Sản phẩm -> Thêm sản phẩm bằng cách tải file ảnh trực tiếp từ máy tính.
3. Vào Quản lý Mã giảm giá -> Tạo mã mới và kiểm tra hiệu lực.
4. Vào Quản lý Đánh giá -> Duyệt / Ẩn bình luận.
5. Cập nhật trạng thái đơn hàng sang "Đã giao".

**Step 4: Hoàn thiện tài liệu nghiệm thu**
- Cập nhật tài liệu hướng dẫn và trạng thái kiểm thử.
- Checkpoint commit kết thúc.
