const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NguoiDung, GioHang } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_ecommerce_key_2026_987654321';

// Register a new customer
exports.register = async (req, res) => {
  const { TaiKhoan, MatKhau, TenKH, SDT, Email } = req.body;

  // Basic validation
  if (!TaiKhoan || !MatKhau || !TenKH || !Email) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
  }

  try {
    // Check if account or email already exists
    const existingUser = await NguoiDung.findOne({
      where: {
        [require('sequelize').Op.or]: [{ TaiKhoan }, { Email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Tên tài khoản hoặc Email đã được sử dụng.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedMatKhau = await bcrypt.hash(MatKhau, salt);

    // Create user
    const newUser = await NguoiDung.create({
      TaiKhoan,
      MatKhau: hashedMatKhau,
      TenKH,
      SDT,
      Email,
      VaiTro: 'Customer',
      TrangThai: 'Hoạt động'
    });

    // Create a Cart (GIOHANG) automatically for the user
    await GioHang.create({
      MaKH: newUser.MaKH
    });

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công.',
      user: {
        MaKH: newUser.MaKH,
        TaiKhoan: newUser.TaiKhoan,
        TenKH: newUser.TenKH,
        Email: newUser.Email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đăng ký.' });
  }
};

// Login user (supports Username or Email)
exports.login = async (req, res) => {
  const { loginIdentifier, MatKhau } = req.body; // loginIdentifier can be username or email

  if (!loginIdentifier || !MatKhau) {
    return res.status(400).json({ message: 'Vui lòng cung cấp tài khoản/email và mật khẩu.' });
  }

  try {
    // Find user by username OR email
    const user = await NguoiDung.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { TaiKhoan: loginIdentifier },
          { Email: loginIdentifier }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    // Check account status
    if (user.TrangThai === 'Bị khóa') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    // Issue JWT Token
    const token = jwt.sign(
      { MaKH: user.MaKH, TaiKhoan: user.TaiKhoan, VaiTro: user.VaiTro },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Đăng nhập thành công.',
      token,
      user: {
        MaKH: user.MaKH,
        TaiKhoan: user.TaiKhoan,
        TenKH: user.TenKH,
        Email: user.Email,
        SDT: user.SDT,
        VaiTro: user.VaiTro
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đăng nhập.' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await NguoiDung.findByPk(req.user.MaKH, {
      attributes: { exclude: ['MatKhau'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải hồ sơ.' });
  }
};

// Update current user profile
exports.updateProfile = async (req, res) => {
  const { TenKH, SDT, Email, MatKhau } = req.body;

  try {
    const user = await NguoiDung.findByPk(req.user.MaKH);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Validation if email is being updated
    if (Email && Email !== user.Email) {
      const emailExists = await NguoiDung.findOne({ where: { Email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác.' });
      }
      user.Email = Email;
    }

    if (TenKH) user.TenKH = TenKH;
    if (SDT) user.SDT = SDT;

    // Hash new password if provided
    if (MatKhau && MatKhau.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.MatKhau = await bcrypt.hash(MatKhau, salt);
    }

    await user.save();

    return res.json({
      message: 'Cập nhật thông tin cá nhân thành công.',
      user: {
        MaKH: user.MaKH,
        TaiKhoan: user.TaiKhoan,
        TenKH: user.TenKH,
        Email: user.Email,
        SDT: user.SDT,
        VaiTro: user.VaiTro
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật hồ sơ.' });
  }
};
