const { NguoiDung, GioHang } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Admin: Get all accounts with search
exports.getUsers = async (req, res) => {
  const { search } = req.query;

  const whereClause = {};

  if (search) {
    whereClause[Op.or] = [
      { TaiKhoan: { [Op.like]: `%${search}%` } },
      { TenKH: { [Op.like]: `%${search}%` } },
      { Email: { [Op.like]: `%${search}%` } },
      { SDT: { [Op.like]: `%${search}%` } }
    ];
  }

  try {
    const users = await NguoiDung.findAll({
      where: whereClause,
      attributes: { exclude: ['MatKhau'] },
      order: [['MaKH', 'ASC']]
    });

    return res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách người dùng.' });
  }
};

// Admin: Create user account
exports.createUser = async (req, res) => {
  const { TaiKhoan, MatKhau, TenKH, SDT, Email, VaiTro, TrangThai } = req.body;

  if (!TaiKhoan || !MatKhau || !TenKH || !Email) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
  }

  try {
    const existingUser = await NguoiDung.findOne({
      where: {
        [Op.or]: [{ TaiKhoan }, { Email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Tên tài khoản hoặc Email đã được sử dụng.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedMatKhau = await bcrypt.hash(MatKhau, salt);

    const newUser = await NguoiDung.create({
      TaiKhoan,
      MatKhau: hashedMatKhau,
      TenKH,
      SDT,
      Email,
      VaiTro: VaiTro || 'Customer',
      TrangThai: TrangThai || 'Hoạt động'
    });

    // Create a Cart for the new user
    await GioHang.create({
      MaKH: newUser.MaKH
    });

    return res.status(201).json({
      message: 'Tạo tài khoản người dùng thành công.',
      user: {
        MaKH: newUser.MaKH,
        TaiKhoan: newUser.TaiKhoan,
        TenKH: newUser.TenKH,
        Email: newUser.Email,
        VaiTro: newUser.VaiTro,
        TrangThai: newUser.TrangThai
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo tài khoản.' });
  }
};

// Admin: Update user account
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { TenKH, SDT, Email, VaiTro, TrangThai, MatKhau } = req.body;

  try {
    const user = await NguoiDung.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng.' });
    }

    // Check email uniqueness
    if (Email && Email !== user.Email) {
      const emailExists = await NguoiDung.findOne({ where: { Email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi một tài khoản khác.' });
      }
      user.Email = Email;
    }

    if (TenKH !== undefined) user.TenKH = TenKH;
    if (SDT !== undefined) user.SDT = SDT;
    if (VaiTro !== undefined) user.VaiTro = VaiTro;
    if (TrangThai !== undefined) user.TrangThai = TrangThai;

    if (MatKhau && MatKhau.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.MatKhau = await bcrypt.hash(MatKhau, salt);
    }

    await user.save();

    return res.json({
      message: 'Cập nhật tài khoản thành công.',
      user: {
        MaKH: user.MaKH,
        TaiKhoan: user.TaiKhoan,
        TenKH: user.TenKH,
        Email: user.Email,
        SDT: user.SDT,
        VaiTro: user.VaiTro,
        TrangThai: user.TrangThai
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật tài khoản.' });
  }
};

// Admin: Lock / Unlock toggle
exports.toggleUserLock = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await NguoiDung.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng.' });
    }

    // Don't let admin lock themselves
    if (user.MaKH === req.user.MaKH) {
      return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
    }

    user.TrangThai = user.TrangThai === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động';
    await user.save();

    return res.json({
      message: `${user.TrangThai === 'Bị khóa' ? 'Khóa' : 'Mở khóa'} tài khoản thành công.`,
      user: {
        MaKH: user.MaKH,
        TaiKhoan: user.TaiKhoan,
        TrangThai: user.TrangThai
      }
    });
  } catch (error) {
    console.error('Lock toggle error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi khóa/mở khóa tài khoản.' });
  }
};

// Admin: Delete user account
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await NguoiDung.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng.' });
    }

    if (user.MaKH === req.user.MaKH) {
      return res.status(400).json({ message: 'Bạn không thể xóa tài khoản của chính mình.' });
    }

    // Delete user (associated cart will cascade delete)
    await user.destroy();

    return res.json({ message: 'Xóa tài khoản người dùng thành công.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xóa tài khoản.' });
  }
};
