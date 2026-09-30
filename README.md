# ⚡ NovaTech - Website Bán Hàng Trực Tuyến Thiết Bị Công Nghệ

**NovaTech** là nền tảng thương mại điện tử chuyên cung cấp các thiết bị công nghệ chính hãng (Điện thoại, Máy tính bảng, Laptop, Phụ kiện, Thiết bị thông minh). Website được thiết kế với giao diện hiện đại theo tông màu chủ đạo **Xanh dương nhạt & Trắng tinh tế (Sky Blue & Crisp White)**, mang lại trải nghiệm mua sắm mượt mà, cao cấp, thanh lịch và trực quan.

---

## 🛠️ Công Nghệ Sử Dụng

### 1. Frontend
* **Core:** ReactJS (với công cụ build siêu tốc Vite)
* **Styling:** Tailwind CSS (phong cách Glassmorphism, thiết kế Responsive hoàn hảo trên Mobile và Desktop)
* **Icons:** Lucide React
* **Routing:** React Router v7
* **API Client:** Axios

### 2. Backend
* **Core:** Node.js & Express.js
* **Database ORM:** Sequelize
* **Xác thực bảo mật:** JSON Web Token (JWT) & mã hóa mật khẩu `bcryptjs`

### 3. Cơ Sở Dữ Liệu
* **SQLite (Mặc định):** Lưu trữ dạng file cục bộ tại `backend/database.sqlite`, hỗ trợ chạy dự án ngay lập tức mà không cần cài đặt cấu hình database phức tạp.
* **MySQL (Sẵn sàng cho Product):** Có sẵn tệp DDL tạo bảng [schema.sql](file:///d:/qlda/database/schema.sql) và tệp nạp dữ liệu mẫu [seed.sql](file:///d:/qlda/database/seed.sql) trong thư mục `database/`.

---

## 🚀 Tính Năng Chính

### 👤 Khách hàng (Customer)
* **Trang chủ & Danh mục:** Trải nghiệm Banner công nghệ động, duyệt danh sách danh mục trực quan.
* **Bộ lọc tối ưu:** Lọc sản phẩm theo danh mục, thanh tìm kiếm từ khóa, thương hiệu phổ biến (Apple, Samsung, ASUS...) và khoảng giá (Dưới 5tr, 5tr - 20tr, Trên 20tr). Toàn bộ bộ lọc được đồng bộ hóa lên URL để dễ dàng chia sẻ hoặc quay về trang chủ.
* **Trang chi tiết sản phẩm:** Xem thông số kỹ thuật dạng bảng, xem thư viện ảnh bổ sung, kiểm tra tình trạng tồn kho thực tế.
* **Giỏ hàng trực tuyến:** Thêm nhanh sản phẩm, cập nhật số lượng trực tiếp (tự động khóa nếu vượt quá tồn kho), hiển thị số lượng giỏ hàng trên thanh điều hướng.
* **Trang thanh toán (Checkout):** Hỗ trợ hình thức thanh toán **COD (Thanh toán khi nhận hàng)** tinh gọn, nhập thông tin liên hệ và địa chỉ nhận hàng dễ dàng.
* **Tra cứu & Lịch sử đơn hàng:** Tra cứu nhanh trạng thái đơn hàng (Chờ xử lý, Đang giao, Đã giao, Đã hủy) qua số điện thoại hoặc lịch sử đơn hàng cá nhân.

### 👑 Quản trị viên (Admin & CMS Dashboard)
* **Đường dẫn quản trị song song:** Truy cập an toàn qua hai lối vào `/admin` và `/cms`.
* **Trang Tổng quan (Dashboard):** Thống kê tổng doanh thu thực tế, tổng đơn hàng, tổng số khách hàng đăng ký, cảnh báo danh sách sản phẩm sắp hết hàng (tồn kho dưới 5 chiếc) và danh sách đơn hàng vừa đặt mới nhất.
* **Quản lý Sản phẩm (CRUD):** 
  * Giao diện tạo mới và chỉnh sửa sản phẩm chuyên nghiệp.
  * **Thiết kế Header Modal cố định (Sticky):** Nút *Lưu lại* và *Hủy* luôn ghim ở đầu trang giúp bạn thao tác ngay lập tức mà không cần cuộn trang xuống cuối.
  * Nhập liệu mô tả, bộ sưu tập ảnh và thông số kỹ thuật (cú pháp JSON tự động xác thực).
  * Xóa sản phẩm an toàn (tự động dọn dẹp liên kết trong giỏ hàng và đơn hàng để tránh lỗi cơ sở dữ liệu).
* **Quản lý Danh mục (CRUD):** Quản lý nhóm sản phẩm chính.
* **Quản lý Đơn hàng:** Xem toàn bộ danh sách đơn hàng của hệ thống và cập nhật trạng thái đơn hàng (Chờ xử lý, Đã xác nhận, Đang giao, Đã giao, Đã hủy).
* **Quản lý Người dùng:** Khóa/Mở khóa tài khoản khách hàng, đổi quyền hạn thành viên.

---

## 🔑 Tài Khoản Thử Nghiệm

Hệ thống đã được nạp sẵn các tài khoản mẫu sau để bạn trải nghiệm nhanh:

| Vai trò | Tên tài khoản (Tài khoản) | Mật khẩu | Email liên kết | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin123` | `123456` | `admin123@techshop.com` | Tài khoản quản trị CMS chính |
| **Admin** | `admin` | `admin123` | `admin@techshop.com` | Tài khoản quản trị dự phòng |
| **Customer** | `customer` | `customer123` | `customer@gmail.com` | Tài khoản khách hàng mẫu 1 |
| **Customer** | `customer2` | `customer123` | `customer2@gmail.com` | Tài khoản khách hàng mẫu 2 |

---

## 🏃 Hướng Dẫn Chạy Chương Trình

### 📋 Yêu Cầu Hệ Thống
* Đã cài đặt **Node.js** (Khuyến nghị phiên bản 18 trở lên).

### Bước 1: Cài đặt thư viện (Dependencies)
Mở cửa sổ dòng lệnh tại thư mục gốc của dự án (`d:\qlda`) và thực hiện cài đặt cho cả hai phần:

```bash
# Cài đặt thư viện cho Backend
cd backend
npm install

# Cài đặt thư viện cho Frontend
cd ../frontend
npm install
```

### Bước 2: Cấu hình biến môi trường (Environment Variables)
Một tệp cấu hình mẫu `.env` đã được chuẩn bị sẵn tại thư mục `backend/.env`. 
* **SQLite (Mặc định):** Đảm bảo dòng `DB_DIALECT=sqlite` được bật để chạy không cần cấu hình.
* **MySQL:** Nếu muốn sử dụng MySQL, đổi dòng cấu hình thành `DB_DIALECT=mysql` và điều chỉnh các thông số kết nối (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`) phù hợp với cơ sở dữ liệu local của bạn.

### Bước 3: Nạp dữ liệu mẫu từ Fake API (Khuyên dùng)
Hệ thống có sẵn một kịch bản nạp dữ liệu thông minh từ API trực tuyến. Script này sẽ tự động tải các thiết bị công nghệ mới nhất từ Fake API, dịch nội dung sang tiếng Việt, đổi giá thành VND và thêm vào cơ sở dữ liệu của bạn:

```bash
cd ../backend
node seed-fake.js
```
*(Nếu cơ sở dữ liệu trống, máy chủ cũng sẽ tự động chạy nạp 8 sản phẩm công nghệ cơ bản ban đầu khi khởi động).*

### Bước 4: Khởi động hệ thống

#### 1. Khởi động Backend API Server:
```bash
cd backend
npm run dev
```
*Máy chủ API sẽ chạy tại địa chỉ: **http://localhost:5000***

#### 2. Khởi động Frontend Web Server:
Mở một cửa sổ dòng lệnh mới:
```bash
cd frontend
npm run dev
```
*Website bán hàng sẽ chạy tại địa chỉ: **http://localhost:5173***

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
qlda/
├── backend/
│   ├── config/             # Cấu hình kết nối Cơ sở dữ liệu (db.js)
│   ├── controllers/        # Xử lý Logic nghiệp vụ của các API
│   ├── middleware/         # Middleware xác thực JWT & phân quyền Admin
│   ├── models/             # Định nghĩa Schema các bảng bằng Sequelize
│   ├── database.sqlite     # File cơ sở dữ liệu SQLite cục bộ
│   ├── seed-fake.js        # Script nạp 37+ sản phẩm việt hóa từ Fake API
│   ├── server.js           # Điểm khởi chạy máy chủ Express
│   └── package.json
├── database/
│   ├── schema.sql          # DDL tạo cấu trúc 8 bảng MySQL
│   └── seed.sql            # SQL nạp dữ liệu mẫu ban đầu cho MySQL
├── frontend/
│   ├── src/
│   │   ├── components/     # Các thành phần tái sử dụng (Navbar, Footer, Toast...)
│   │   ├── context/        # Quản lý trạng thái Auth và Giỏ hàng (CartContext...)
│   │   ├── pages/          # Các trang chính (Home, ProductDetails, Cart, Checkout...)
│   │   │   └── admin/      # Phân hệ quản lý Admin (Dashboard, Products, Orders...)
│   │   ├── services/       # Cấu hình Axios kết nối API (api.js)
│   │   ├── App.jsx         # Khai báo các Routes định tuyến
│   │   └── main.jsx
│   └── package.json
└── README.md               # Hướng dẫn và tài liệu dự án này
```
