-- MySQL Database Seed Data for Online E-commerce Website
USE `ecommerce_db`;

-- 1. DANHMUC (Categories)
INSERT INTO `DANHMUC` (`MaDM`, `TenDM`, `MoTa`) VALUES
(1, 'Điện thoại & Máy tính bảng', 'Các dòng điện thoại thông minh, iPad, máy tính bảng mới nhất'),
(2, 'Laptop & PC', 'Máy tính xách tay và máy tính để bàn cho học tập, làm việc, gaming'),
(3, 'Phụ kiện công nghệ', 'Tai nghe, cáp sạc, chuột, bàn phím và các phụ kiện khác'),
(4, 'Thiết bị thông minh', 'Đồng hồ thông minh, loa thông minh và thiết bị nhà thông minh');

-- 2. SANPHAM (Products)
-- Passwords for NGUOIDUNG below:
-- admin: 'admin123' -> bcrypt hash: $2a$10$tM2eN7hQoUebh4iN5z/3u.b2eXW2X6G1X5/vVpxF9N5d.75Z/7pvi
-- customer: 'customer123' -> bcrypt hash: $2a$10$gPvZ3GfS3eJ4C4bL.eN7heE5d3sP2F3c5g8fV7N.d5b2c75a/4s.G
-- customer2: 'customer123' -> bcrypt hash: $2a$10$gPvZ3GfS3eJ4C4bL.eN7heE5d3sP2F3c5g8fV7N.d5b2c75a/4s.G

INSERT INTO `SANPHAM` (`MaSP`, `TenSP`, `GiaBan`, `AnhMinhHoa`, `MoTa`, `ThongSo`, `SoLuongTon`, `TrangThai`, `MaDM`) VALUES
(1, 'iPhone 15 Pro Max 256GB', 29990000.00, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', 'Mẫu điện thoại cao cấp nhất năm 2023 của Apple với khung Titanium siêu nhẹ và chip A17 Pro mạnh mẽ.', '{"Màn hình": "6.7 inch Super Retina XDR OLED", "Hệ điều hành": "iOS 17", "Camera": "Chính 48 MP & Phụ 12 MP, 12 MP", "Chip": "Apple A17 Pro 6 nhân", "Pin": "4422 mAh"}', 15, 'Đang bán', 1),
(2, 'Samsung Galaxy S24 Ultra 512GB', 31990000.00, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', 'Flagship mới nhất của Samsung tích hợp bút S-Pen và tính năng Galaxy AI thông minh vượt trội.', '{"Màn hình": "6.8 inch Dynamic AMOLED 2X", "Hệ điều hành": "Android 14", "Camera": "Chính 200 MP & Phụ 50 MP, 12 MP, 10 MP", "Chip": "Snapdragon 8 Gen 3 for Galaxy", "Pin": "5000 mAh"}', 10, 'Đang bán', 1),
(3, 'MacBook Air M2 8GB/256GB', 24490000.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 'Thiết kế mỏng nhẹ sang trọng bậc nhất, hiệu năng vượt trội từ vi xử lý Apple M2 siêu êm ái.', '{"CPU": "Apple M2 8 nhân", "RAM": "8 GB", "Ổ cứng": "256 GB SSD", "Màn hình": "13.6 inch Liquid Retina", "Cân nặng": "1.24 kg"}', 8, 'Đang bán', 2),
(4, 'ASUS ROG Zephyrus G14 2024', 38990000.00, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500', 'Laptop gaming cao cấp siêu mỏng nhẹ, trang bị card đồ họa RTX 4060 chiến mượt mọi tựa game AAA.', '{"CPU": "AMD Ryzen 7 8845HS", "RAM": "16 GB LPDDR5X", "Ổ cứng": "512 GB SSD PCIe 4.0", "Đồ họa": "NVIDIA GeForce RTX 4060 8GB", "Màn hình": "14 inch 2.8K OLED 120Hz"}', 5, 'Đang bán', 2),
(5, 'Tai nghe Sony WH-1000XM5', 6890000.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Tai nghe chụp tai chống ồn chủ động tốt nhất thế giới với thiết kế sang trọng và chất âm đỉnh cao.', '{"Kết nối": "Bluetooth 5.2, AUX 3.5mm", "Thời lượng pin": "Đến 30 giờ", "Sạc": "USB-C, Sạc nhanh 3 phút được 3 giờ", "Khử tiếng ồn": "Chống ồn ANC thông minh"}', 20, 'Đang bán', 3),
(6, 'Bàn phím cơ Keychron K2 V2', 1850000.00, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 'Bàn phím cơ không dây nhỏ gọn 84 phím, tương thích hoàn hảo cho cả macOS và Windows.', '{"Layout": "84 phím (75%)", "Switch": "Gateron G-Pro Red/Blue/Brown", "Kết nối": "Bluetooth 5.1 / Type-C", "Led": "RGB 18 chế độ"}', 30, 'Đang bán', 3),
(7, 'Đồng hồ thông minh Apple Watch Series 9 GPS', 9490000.00, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500', 'Đồng hồ thông minh thế hệ mới với tính năng Double Tap độc đáo, độ sáng màn hình lên tới 2000 nits.', '{"Kích thước": "41mm hoặc 45mm", "Màn hình": "Always-On Retina LTPO OLED", "Hệ điều hành": "watchOS 10", "Thời lượng pin": "18 giờ (Lên đến 36 giờ ở chế độ nguồn điện thấp)"}', 12, 'Đang bán', 4),
(8, 'Loa thông minh Marshall Acton III', 7490000.00, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500', 'Loa Bluetooth cổ điển đặt bàn với dải âm rộng và chất âm chi tiết đậm chất Marshall.', '{"Công suất": "60W Class D", "Kết nối": "Bluetooth 5.2, AUX 3.5mm", "Trọng lượng": "2.85 kg", "Dải tần": "45 - 20,000 Hz"}', 0, 'Ngừng bán', 4);

-- 3. HINHANH (Product Images)
INSERT INTO `HINHANH` (`MaAnh`, `DuongDan`, `KichThuoc`, `MaSP`) VALUES
(1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', '800x600', 1),
(2, 'https://images.unsplash.com/photo-1695048132711-f254e2ee2b45?w=800', '800x600', 1),
(3, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', '800x600', 2),
(4, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', '800x600', 3),
(5, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', '800x600', 4),
(6, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', '800x600', 5),
(7, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', '800x600', 6),
(8, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800', '800x600', 7),
(9, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800', '800x600', 8);

-- 4. NGUOIDUNG (Users)
-- passwords: admin123 and customer123 (hashed using bcrypt)
INSERT INTO `NGUOIDUNG` (`MaKH`, `TaiKhoan`, `MatKhau`, `TenKH`, `SDT`, `Email`, `VaiTro`, `TrangThai`) VALUES
(1, 'admin', '$2a$10$tM2eN7hQoUebh4iN5z/3u.b2eXW2X6G1X5/vVpxF9N5d.75Z/7pvi', 'Administrator', '0987654321', 'admin@techshop.com', 'Admin', 'Hoạt động'),
(2, 'customer', '$2a$10$gPvZ3GfS3eJ4C4bL.eN7heE5d3sP2F3c5g8fV7N.d5b2c75a/4s.G', 'Nguyễn Văn A', '0912345678', 'customer@gmail.com', 'Customer', 'Hoạt động'),
(3, 'customer2', '$2a$10$gPvZ3GfS3eJ4C4bL.eN7heE5d3sP2F3c5g8fV7N.d5b2c75a/4s.G', 'Trần Thị B', '0909998877', 'customer2@gmail.com', 'Customer', 'Hoạt động');

-- 5. GIOHANG (Carts)
INSERT INTO `GIOHANG` (`MaGioHang`, `MaKH`) VALUES
(1, 1),
(2, 2),
(3, 3);

-- 6. CHITIETGIOHANG (Cart Details)
INSERT INTO `CHITIETGIOHANG` (`GIOHANGMaGioHang`, `SANPHAMMaSP`, `SoLuong`) VALUES
(2, 1, 1), -- Nguyễn Văn A has 1 iPhone 15 Pro Max in cart
(2, 5, 2); -- Nguyễn Văn A has 2 Sony headphones in cart

-- 7. DONHANG (Orders)
INSERT INTO `DONHANG` (`MaDonHang`, `NgayDatHang`, `ThoiGianDatHang`, `TongTien`, `TrangThai`, `DiaChiGiaoHang`, `SDTNhanHang`, `GhiChu`, `MaKH`) VALUES
(1, '2026-05-28', '2026-05-28 14:30:00', 43770000.00, 'Đã giao', '123 Đường Lê Lợi, Quận 1, TP. HCM', '0912345678', 'Giao giờ hành chính', 2),
(2, '2026-05-30', '2026-05-30 10:15:00', 26340000.00, 'Chờ xử lý', '456 Đường Nguyễn Trãi, Quận 5, TP. HCM', '0909998877', 'Gọi trước khi giao', 3);

-- 8. CHITIETDONHANG (Order Details)
INSERT INTO `CHITIETDONHANG` (`MaDonHang`, `MaSP`, `DongGia`, `SoLuong`, `ThanhTien`) VALUES
-- Order 1 Details
(1, 1, 29990000.00, 1, 29990000.00), -- 1x iPhone 15 Pro Max
(1, 5, 6890000.00, 2, 13780000.00), -- 2x Sony Headphones
-- Order 2 Details
(2, 3, 24490000.00, 1, 24490000.00), -- 1x MacBook Air
(2, 6, 1850000.00, 1, 1850000.00);   -- 1x Keychron K2
