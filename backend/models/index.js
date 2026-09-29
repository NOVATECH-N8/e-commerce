const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 1. DANHMUC
const DanhMuc = sequelize.define('DanhMuc', {
  MaDM: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenDM: {
    type: DataTypes.STRING,
    allowNull: false
  },
  MoTa: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'DANHMUC'
});

// 2. SANPHAM
const SanPham = sequelize.define('SanPham', {
  MaSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TenSP: {
    type: DataTypes.STRING,
    allowNull: false
  },
  GiaBan: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  AnhMinhHoa: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  MoTa: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ThongSo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  SoLuongTon: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  TrangThai: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Đang bán' // 'Đang bán', 'Ngừng bán'
  },
  MaDM: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'SANPHAM'
});

// 3. HINHANH
const HinhAnh = sequelize.define('HinhAnh', {
  MaAnh: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  DuongDan: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  KichThuoc: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  MaSP: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'HINHANH'
});

// 4. NGUOIDUNG
const NguoiDung = sequelize.define('NguoiDung', {
  MaKH: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TaiKhoan: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  MatKhau: {
    type: DataTypes.STRING,
    allowNull: false
  },
  TenKH: {
    type: DataTypes.STRING,
    allowNull: false
  },
  SDT: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  VaiTro: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Customer' // 'Customer', 'Admin'
  },
  TrangThai: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Hoạt động' // 'Hoạt động', 'Bị khóa'
  }
}, {
  tableName: 'NGUOIDUNG'
});

// 5. GIOHANG
const GioHang = sequelize.define('GioHang', {
  MaGioHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaKH: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'GIOHANG'
});

// 6. CHITIETGIOHANG
const ChiTietGioHang = sequelize.define('ChiTietGioHang', {
  GIOHANGMaGioHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  SANPHAMMaSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'CHITIETGIOHANG'
});

// 7. DONHANG
const DonHang = sequelize.define('DonHang', {
  MaDonHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  NgayDatHang: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  ThoiGianDatHang: {
    type: DataTypes.DATE,
    allowNull: false
  },
  TongTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  TrangThai: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Chờ xử lý' // 'Chờ xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'
  },
  DiaChiGiaoHang: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  SDTNhanHang: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  MaKH: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  PhuongThucThanhToan: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'COD' // 'COD', 'VIETQR'
  },
  TrangThaiThanhToan: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Chưa thanh toán' // 'Chưa thanh toán', 'Đã thanh toán'
  },
  MaVoucher: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  TienGiamGia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'DONHANG'
});

// 8. CHITIETDONHANG
const ChiTietDonHang = sequelize.define('ChiTietDonHang', {
  MaDonHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  MaSP: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  DongGia: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ThanhTien: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'CHITIETDONHANG'
});

// Define Relationships

// DANHMUC -> SANPHAM
DanhMuc.hasMany(SanPham, { foreignKey: 'MaDM', as: 'SanPhams', onDelete: 'SET NULL' });
SanPham.belongsTo(DanhMuc, { foreignKey: 'MaDM', as: 'DanhMuc' });

// SANPHAM -> HINHANH
SanPham.hasMany(HinhAnh, { foreignKey: 'MaSP', as: 'HinhAnhs', onDelete: 'CASCADE' });
HinhAnh.belongsTo(SanPham, { foreignKey: 'MaSP', as: 'SanPham' });

// NGUOIDUNG -> GIOHANG
NguoiDung.hasOne(GioHang, { foreignKey: 'MaKH', as: 'GioHang', onDelete: 'CASCADE' });
GioHang.belongsTo(NguoiDung, { foreignKey: 'MaKH', as: 'NguoiDung' });

// GIOHANG <-> SANPHAM through CHITIETGIOHANG
GioHang.belongsToMany(SanPham, {
  through: ChiTietGioHang,
  foreignKey: 'GIOHANGMaGioHang',
  otherKey: 'SANPHAMMaSP',
  as: 'SanPhams'
});
SanPham.belongsToMany(GioHang, {
  through: ChiTietGioHang,
  foreignKey: 'SANPHAMMaSP',
  otherKey: 'GIOHANGMaGioHang',
  as: 'GioHangs'
});

// Explicit associations for detail tables to query easily
GioHang.hasMany(ChiTietGioHang, { foreignKey: 'GIOHANGMaGioHang', as: 'ChiTietGioHangs' });
ChiTietGioHang.belongsTo(GioHang, { foreignKey: 'GIOHANGMaGioHang' });
SanPham.hasMany(ChiTietGioHang, { foreignKey: 'SANPHAMMaSP' });
ChiTietGioHang.belongsTo(SanPham, { foreignKey: 'SANPHAMMaSP', as: 'SanPham' });

// NGUOIDUNG -> DONHANG
NguoiDung.hasMany(DonHang, { foreignKey: 'MaKH', as: 'DonHangs', onDelete: 'SET NULL' });
DonHang.belongsTo(NguoiDung, { foreignKey: 'MaKH', as: 'NguoiDung' });

// DONHANG <-> SANPHAM through CHITIETDONHANG
DonHang.belongsToMany(SanPham, {
  through: ChiTietDonHang,
  foreignKey: 'MaDonHang',
  otherKey: 'MaSP',
  as: 'SanPhams'
});
SanPham.belongsToMany(DonHang, {
  through: ChiTietDonHang,
  foreignKey: 'MaSP',
  otherKey: 'MaDonHang',
  as: 'DonHangs'
});

// Explicit associations for detail tables to query easily
DonHang.hasMany(ChiTietDonHang, { foreignKey: 'MaDonHang', as: 'ChiTietDonHangs' });
ChiTietDonHang.belongsTo(DonHang, { foreignKey: 'MaDonHang' });
SanPham.hasMany(ChiTietDonHang, { foreignKey: 'MaSP' });
ChiTietDonHang.belongsTo(SanPham, { foreignKey: 'MaSP', as: 'SanPham' });

// 9. DANHGIA
const DanhGia = sequelize.define('DanhGia', {
  MaDanhGia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaSP: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  MaKH: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  SoSao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  NoiDung: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  HinhAnh: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Hiển thị' // 'Hiển thị', 'Ẩn'
  },
  NgayDanhGia: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'DANHGIA'
});

// 10. KHUYENMAI
const KhuyenMai = sequelize.define('KhuyenMai', {
  MaVoucher: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  MoTa: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  LoaiGiam: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'TIEN_MAT' // 'TIEN_MAT', 'PHAN_TRAM'
  },
  GiaTriGiam: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  GiaTriToiDa: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  DonToiThieu: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  NgayBatDau: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  NgayHetHan: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  TrangThai: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Hoạt động' // 'Hoạt động', 'Tạm khóa'
  }
}, {
  tableName: 'KHUYENMAI'
});

// Associations for DANHGIA & KHUYENMAI
SanPham.hasMany(DanhGia, { foreignKey: 'MaSP', as: 'DanhGias', onDelete: 'CASCADE' });
DanhGia.belongsTo(SanPham, { foreignKey: 'MaSP', as: 'SanPham' });

NguoiDung.hasMany(DanhGia, { foreignKey: 'MaKH', as: 'DanhGias', onDelete: 'CASCADE' });
DanhGia.belongsTo(NguoiDung, { foreignKey: 'MaKH', as: 'NguoiDung' });

KhuyenMai.hasMany(DonHang, { foreignKey: 'MaVoucher', as: 'DonHangs', onDelete: 'SET NULL' });
DonHang.belongsTo(KhuyenMai, { foreignKey: 'MaVoucher', as: 'Voucher' });

module.exports = {
  sequelize,
  DanhMuc,
  SanPham,
  HinhAnh,
  NguoiDung,
  GioHang,
  ChiTietGioHang,
  DonHang,
  ChiTietDonHang,
  DanhGia,
  KhuyenMai
};

