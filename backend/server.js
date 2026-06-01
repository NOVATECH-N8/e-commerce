const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/db');
const { verifyToken, isAdmin } = require('./middleware/auth');

// Controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const categoryController = require('./controllers/categoryController');
const cartController = require('./controllers/cartController');
const orderController = require('./controllers/orderController');
const userController = require('./controllers/userController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API ROUTES ---

// 1. Authentication & Profile Routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', verifyToken, authController.getProfile);
app.put('/api/auth/profile', verifyToken, authController.updateProfile);

// 2. Product Routes
app.get('/api/products', productController.getProducts);
app.get('/api/products/:id', productController.getProductById);
// Admin Product CRUD
app.post('/api/products', isAdmin, productController.createProduct);
app.put('/api/products/:id', isAdmin, productController.updateProduct);
app.delete('/api/products/:id', isAdmin, productController.deleteProduct);

// 3. Category Routes
app.get('/api/categories', categoryController.getCategories);
// Admin Category CRUD
app.post('/api/categories', isAdmin, categoryController.createCategory);
app.put('/api/categories/:id', isAdmin, categoryController.updateCategory);
app.delete('/api/categories/:id', isAdmin, categoryController.deleteCategory);

// 4. Cart Routes
app.get('/api/cart', verifyToken, cartController.getCart);
app.post('/api/cart', verifyToken, cartController.addToCart);
app.put('/api/cart', verifyToken, cartController.updateCartItem);
app.delete('/api/cart/:productId', verifyToken, cartController.removeCartItem);
app.delete('/api/cart', verifyToken, cartController.clearCart);

// 5. Order Routes
app.post('/api/orders', verifyToken, orderController.placeOrder);
app.get('/api/orders/history', verifyToken, orderController.getOrderHistory);
app.put('/api/orders/:id/cancel', verifyToken, orderController.cancelOwnOrder);
// Public order tracking (guest phone or ID searches)
app.get('/api/orders/track', orderController.trackOrderPublic);
// Admin Order CRUD
app.get('/api/admin/orders', isAdmin, orderController.getAdminOrders);
app.put('/api/admin/orders/:id/status', isAdmin, orderController.updateOrderStatus);

// 6. User Account Routes (Admin only)
app.get('/api/admin/users', isAdmin, userController.getUsers);
app.post('/api/admin/users', isAdmin, userController.createUser);
app.put('/api/admin/users/:id', isAdmin, userController.updateUser);
app.put('/api/admin/users/:id/lock', isAdmin, userController.toggleUserLock);
app.delete('/api/admin/users/:id', isAdmin, userController.deleteUser);

// Base route
app.get('/', (req, res) => {
  res.send('API E-commerce platform is running...');
});

// Database Synchronization and Server Launch
sequelize.sync({ force: false }) // keeps database content if exists
  .then(() => {
    console.log('Đồng bộ cơ sở dữ liệu thành công.');
    
    // Check if we need to auto-seed (mainly for newly created SQLite)
    autoSeedIfEmpty();

    app.listen(PORT, () => {
      console.log(`Máy chủ đang chạy tại: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Không thể đồng bộ cơ sở dữ liệu:', err);
  });

// Auto-seed mock data when database is brand new and empty
async function autoSeedIfEmpty() {
  try {
    const { DanhMuc, SanPham, HinhAnh, NguoiDung, GioHang, ChiTietGioHang, DonHang, ChiTietDonHang } = require('./models');
    
    const categoryCount = await DanhMuc.count();
    if (categoryCount > 0) {
      return; // Already has data, skip auto-seeding
    }
    
    console.log('Phát hiện cơ sở dữ liệu trống. Đang tự động nạp dữ liệu mẫu...');

    // 1. Categories
    const categories = await DanhMuc.bulkCreate([
      { MaDM: 1, TenDM: 'Điện thoại & Máy tính bảng', MoTa: 'Các dòng điện thoại thông minh, iPad, máy tính bảng mới nhất' },
      { MaDM: 2, TenDM: 'Laptop & PC', MoTa: 'Máy tính xách tay và máy tính để bàn cho học tập, làm việc, gaming' },
      { MaDM: 3, TenDM: 'Phụ kiện công nghệ', MoTa: 'Tai nghe, cáp sạc, chuột, bàn phím và các phụ kiện khác' },
      { MaDM: 4, TenDM: 'Thiết bị thông minh', MoTa: 'Đồng hồ thông minh, loa thông minh và thiết bị nhà thông minh' }
    ]);

    // 2. Products
    const products = await SanPham.bulkCreate([
      {
        MaSP: 1,
        TenSP: 'iPhone 15 Pro Max 256GB',
        GiaBan: 29990000.00,
        AnhMinhHoa: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
        MoTa: 'Mẫu điện thoại cao cấp nhất năm 2023 của Apple với khung Titanium siêu nhẹ và chip A17 Pro mạnh mẽ.',
        ThongSo: '{"Màn hình": "6.7 inch Super Retina XDR OLED", "Hệ điều hành": "iOS 17", "Camera": "Chính 48 MP & Phụ 12 MP, 12 MP", "Chip": "Apple A17 Pro 6 nhân", "Pin": "4422 mAh"}',
        SoLuongTon: 15,
        TrangThai: 'Đang bán',
        MaDM: 1
      },
      {
        MaSP: 2,
        TenSP: 'Samsung Galaxy S24 Ultra 512GB',
        GiaBan: 31990000.00,
        AnhMinhHoa: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500',
        MoTa: 'Flagship mới nhất của Samsung tích hợp bút S-Pen và tính năng Galaxy AI thông minh vượt trội.',
        ThongSo: '{"Màn hình": "6.8 inch Dynamic AMOLED 2X", "Hệ điều hành": "Android 14", "Camera": "Chính 200 MP & Phụ 50 MP, 12 MP, 10 MP", "Chip": "Snapdragon 8 Gen 3 for Galaxy", "Pin": "5000 mAh"}',
        SoLuongTon: 10,
        TrangThai: 'Đang bán',
        MaDM: 1
      },
      {
        MaSP: 3,
        TenSP: 'MacBook Air M2 8GB/256GB',
        GiaBan: 24490000.00,
        AnhMinhHoa: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        MoTa: 'Thiết kế mỏng nhẹ sang trọng bậc nhất, hiệu năng vượt trội từ vi xử lý Apple M2 siêu êm ái.',
        ThongSo: '{"CPU": "Apple M2 8 nhân", "RAM": "8 GB", "Ổ cứng": "256 GB SSD", "Màn hình": "13.6 inch Liquid Retina", "Cân nặng": "1.24 kg"}',
        SoLuongTon: 8,
        TrangThai: 'Đang bán',
        MaDM: 2
      },
      {
        MaSP: 4,
        TenSP: 'ASUS ROG Zephyrus G14 2024',
        GiaBan: 38990000.00,
        AnhMinhHoa: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
        MoTa: 'Laptop gaming cao cấp siêu mỏng nhẹ, trang bị card đồ họa RTX 4060 chiến mượt mọi tựa game AAA.',
        ThongSo: '{"CPU": "AMD Ryzen 7 8845HS", "RAM": "16 GB LPDDR5X", "Ổ cứng": "512 GB SSD PCIe 4.0", "Đồ họa": "NVIDIA GeForce RTX 4060 8GB", "Màn hình": "14 inch 2.8K OLED 120Hz"}',
        SoLuongTon: 5,
        TrangThai: 'Đang bán',
        MaDM: 2
      },
      {
        MaSP: 5,
        TenSP: 'Tai nghe Sony WH-1000XM5',
        GiaBan: 6890000.00,
        AnhMinhHoa: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        MoTa: 'Tai nghe chụp tai chống ồn chủ động tốt nhất thế giới với thiết kế sang trọng và chất âm đỉnh cao.',
        ThongSo: '{"Kết nối": "Bluetooth 5.2, AUX 3.5mm", "Thời lượng pin": "Đến 30 giờ", "Sạc": "USB-C, Sạc nhanh 3 phút được 3 giờ", "Khử tiếng ồn": "Chống ồn ANC thông minh"}',
        SoLuongTon: 20,
        TrangThai: 'Đang bán',
        MaDM: 3
      },
      {
        MaSP: 6,
        TenSP: 'Bàn phím cơ Keychron K2 V2',
        GiaBan: 1850000.00,
        AnhMinhHoa: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
        MoTa: 'Bàn phím cơ không dây nhỏ gọn 84 phím, tương thích hoàn hảo cho cả macOS và Windows.',
        ThongSo: '{"Layout": "84 phím (75%)", "Switch": "Gateron G-Pro Red/Blue/Brown", "Kết nối": "Bluetooth 5.1 / Type-C", "Led": "RGB 18 chế độ"}',
        SoLuongTon: 30,
        TrangThai: 'Đang bán',
        MaDM: 3
      },
      {
        MaSP: 7,
        TenSP: 'Đồng hồ thông minh Apple Watch Series 9 GPS',
        GiaBan: 9490000.00,
        AnhMinhHoa: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
        MoTa: 'Đồng hồ thông minh thế hệ mới với tính năng Double Tap độc đáo, độ sáng màn hình lên tới 2000 nits.',
        ThongSo: '{"Kích thước": "41mm hoặc 45mm", "Màn hình": "Always-On Retina LTPO OLED", "Hệ điều hành": "watchOS 10", "Thời lượng pin": "18 giờ"}',
        SoLuongTon: 12,
        TrangThai: 'Đang bán',
        MaDM: 4
      },
      {
        MaSP: 8,
        TenSP: 'Loa thông minh Marshall Acton III',
        GiaBan: 7490000.00,
        AnhMinhHoa: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500',
        MoTa: 'Loa Bluetooth cổ điển đặt bàn với dải âm rộng và chất âm chi tiết đậm chất Marshall.',
        ThongSo: '{"Công suất": "60W Class D", "Kết nối": "Bluetooth 5.2, AUX 3.5mm", "Trọng lượng": "2.85 kg", "Dải tần": "45 - 20,000 Hz"}',
        SoLuongTon: 0,
        TrangThai: 'Ngừng bán',
        MaDM: 4
      }
    ]);

    // 3. Images (Gallery)
    await HinhAnh.bulkCreate([
      { DuongDan: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', KichThuoc: '800x600', MaSP: 1 },
      { DuongDan: 'https://images.unsplash.com/photo-1695048132711-f254e2ee2b45?w=800', KichThuoc: '800x600', MaSP: 1 },
      { DuongDan: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', KichThuoc: '800x600', MaSP: 2 },
      { DuongDan: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', KichThuoc: '800x600', MaSP: 3 },
      { DuongDan: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', KichThuoc: '800x600', MaSP: 4 },
      { DuongDan: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', KichThuoc: '800x600', MaSP: 5 },
      { DuongDan: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', KichThuoc: '800x600', MaSP: 6 },
      { DuongDan: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800', KichThuoc: '800x600', MaSP: 7 },
      { DuongDan: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800', KichThuoc: '800x600', MaSP: 8 }
    ]);

    // 4. Users (Passwords: admin123 and customer123)
    const users = await NguoiDung.bulkCreate([
      { MaKH: 1, TaiKhoan: 'admin', MatKhau: '$2a$10$tM2eN7hQoUebh4iN5z/3u.b2eXW2X6G1X5/vVpxF9N5d.75Z/7pvi', TenKH: 'Administrator', SDT: '0987654321', Email: 'admin@techshop.com', VaiTro: 'Admin', TrangThai: 'Hoạt động' },
      { MaKH: 2, TaiKhoan: 'customer', MatKhau: '$2a$10$gPvZ3GfS3eJ4C4bL.eN7heE5d3sP2F3c5g8fV7N.d5b2c75a/4s.G', TenKH: 'Nguyễn Văn A', SDT: '0912345678', Email: 'customer@gmail.com', VaiTro: 'Customer', TrangThai: 'Hoạt động' },
      { MaKH: 3, TaiKhoan: 'customer2', MatKhau: '$2a$10$gPvZ3GfS3eJ4C4bL.eN7heE5d3sP2F3c5g8fV7N.d5b2c75a/4s.G', TenKH: 'Trần Thị B', SDT: '0909998877', Email: 'customer2@gmail.com', VaiTro: 'Customer', TrangThai: 'Hoạt động' }
    ]);

    // 5. Carts for each user
    await GioHang.bulkCreate([
      { MaGioHang: 1, MaKH: 1 },
      { MaGioHang: 2, MaKH: 2 },
      { MaGioHang: 3, MaKH: 3 }
    ]);

    // 6. Cart details (items)
    await ChiTietGioHang.bulkCreate([
      { GIOHANGMaGioHang: 2, SANPHAMMaSP: 1, SoLuong: 1 },
      { GIOHANGMaGioHang: 2, SANPHAMMaSP: 5, SoLuong: 2 }
    ]);

    // 7. Orders
    await DonHang.bulkCreate([
      { MaDonHang: 1, NgayDatHang: '2026-05-28', ThoiGianDatHang: new Date('2026-05-28T14:30:00'), TongTien: 43770000.00, TrangThai: 'Đã giao', DiaChiGiaoHang: '123 Đường Lê Lợi, Quận 1, TP. HCM', SDTNhanHang: '0912345678', GhiChu: 'Giao giờ hành chính', MaKH: 2 },
      { MaDonHang: 2, NgayDatHang: '2026-05-30', ThoiGianDatHang: new Date('2026-05-30T10:15:00'), TongTien: 26340000.00, TrangThai: 'Chờ xử lý', DiaChiGiaoHang: '456 Đường Nguyễn Trãi, Quận 5, TP. HCM', SDTNhanHang: '0909998877', GhiChu: 'Gọi trước khi giao', MaKH: 3 }
    ]);

    // 8. Order Details
    await ChiTietDonHang.bulkCreate([
      { MaDonHang: 1, MaSP: 1, DongGia: 29990000.00, SoLuong: 1, ThanhTien: 29990000.00 },
      { MaDonHang: 1, MaSP: 5, DongGia: 6890000.00, SoLuong: 2, ThanhTien: 13780000.00 },
      { MaDonHang: 2, MaSP: 3, DongGia: 24490000.00, SoLuong: 1, ThanhTien: 24490000.00 },
      { MaDonHang: 2, MaSP: 6, DongGia: 1850000.00, SoLuong: 1, ThanhTien: 1850000.00 }
    ]);

    console.log('Tải dữ liệu mẫu thành công!');
  } catch (error) {
    console.error('Lỗi khi tự động nạp dữ liệu mẫu:', error);
  }
}
