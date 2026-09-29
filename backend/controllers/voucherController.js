const { KhuyenMai } = require('../models');
const { Op } = require('sequelize');

// Public: Apply / Validate Voucher code
exports.applyVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, message: 'Vui lòng cung cấp mã giảm giá.' });
    }

    const total = parseFloat(orderTotal) || 0;
    const cleanCode = code.trim().toUpperCase();

    const voucher = await KhuyenMai.findOne({
      where: {
        MaCode: cleanCode
      }
    });

    if (!voucher) {
      return res.status(404).json({ valid: false, message: 'Mã giảm giá không tồn tại.' });
    }

    if (voucher.TrangThai !== 'Hoạt động') {
      return res.status(400).json({ valid: false, message: 'Mã giảm giá hiện đang bị tạm khóa.' });
    }

    if (voucher.SoLuong <= 0) {
      return res.status(400).json({ valid: false, message: 'Mã giảm giá đã hết lượt sử dụng.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (voucher.NgayBatDau && voucher.NgayBatDau > todayStr) {
      return res.status(400).json({ valid: false, message: `Mã giảm giá chưa đến ngày áp dụng (bắt đầu từ ${voucher.NgayBatDau}).` });
    }

    if (voucher.NgayHetHan && voucher.NgayHetHan < todayStr) {
      return res.status(400).json({ valid: false, message: 'Mã giảm giá đã hết hạn sử dụng.' });
    }

    const minSpend = parseFloat(voucher.DonToiThieu) || 0;
    if (total < minSpend) {
      const diff = minSpend - total;
      return res.status(400).json({
        valid: false,
        message: `Đơn hàng chưa đạt giá trị tối thiểu ${new Intl.NumberFormat('vi-VN').format(minSpend)}đ (còn thiếu ${new Intl.NumberFormat('vi-VN').format(diff)}đ).`
      });
    }

    // Calculate discount amount
    let discount = 0;
    if (voucher.LoaiGiam === 'PHAN_TRAM') {
      const percent = parseFloat(voucher.GiaTriGiam);
      discount = (total * percent) / 100;
      if (voucher.GiaTriToiDa && discount > parseFloat(voucher.GiaTriToiDa)) {
        discount = parseFloat(voucher.GiaTriToiDa);
      }
    } else {
      // TIEN_MAT
      discount = parseFloat(voucher.GiaTriGiam);
    }

    // Discount cannot exceed order total
    discount = Math.min(total, discount);
    const finalTotal = Math.max(0, total - discount);

    return res.json({
      valid: true,
      message: `Áp dụng mã giảm giá ${voucher.MaCode} thành công!`,
      voucher: {
        MaVoucher: voucher.MaVoucher,
        MaCode: voucher.MaCode,
        MoTa: voucher.MoTa,
        LoaiGiam: voucher.LoaiGiam,
        GiaTriGiam: voucher.GiaTriGiam,
        GiaTriToiDa: voucher.GiaTriToiDa,
        DonToiThieu: voucher.DonToiThieu
      },
      discountAmount: discount,
      finalTotal: finalTotal
    });

  } catch (error) {
    console.error('Apply voucher error:', error);
    return res.status(500).json({ valid: false, message: 'Lỗi máy chủ khi xác thực mã giảm giá.' });
  }
};

// Public: Get all active vouchers
exports.getPublicVouchers = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const vouchers = await KhuyenMai.findAll({
      where: {
        TrangThai: 'Hoạt động',
        SoLuong: { [Op.gt]: 0 },
        [Op.or]: [
          { NgayHetHan: null },
          { NgayHetHan: { [Op.gte]: todayStr } }
        ]
      },
      order: [['GiaTriGiam', 'DESC']]
    });

    return res.json(vouchers);
  } catch (error) {
    console.error('Get public vouchers error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách khuyến mãi.' });
  }
};

// Admin: Get all vouchers
exports.getAdminVouchers = async (req, res) => {
  try {
    const vouchers = await KhuyenMai.findAll({
      order: [['MaVoucher', 'DESC']]
    });
    return res.json(vouchers);
  } catch (error) {
    console.error('Admin get vouchers error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách voucher quản trị.' });
  }
};

// Admin: Create new voucher
exports.createVoucher = async (req, res) => {
  try {
    const {
      MaCode,
      MoTa,
      LoaiGiam,
      GiaTriGiam,
      GiaTriToiDa,
      DonToiThieu,
      SoLuong,
      NgayBatDau,
      NgayHetHan,
      TrangThai
    } = req.body;

    if (!MaCode || !GiaTriGiam) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã code và giá trị giảm.' });
    }

    const cleanCode = MaCode.trim().toUpperCase();
    const existing = await KhuyenMai.findOne({ where: { MaCode: cleanCode } });
    if (existing) {
      return res.status(400).json({ message: `Mã giảm giá '${cleanCode}' đã tồn tại.` });
    }

    const voucher = await KhuyenMai.create({
      MaCode: cleanCode,
      MoTa: MoTa || null,
      LoaiGiam: LoaiGiam === 'PHAN_TRAM' ? 'PHAN_TRAM' : 'TIEN_MAT',
      GiaTriGiam: parseFloat(GiaTriGiam),
      GiaTriToiDa: GiaTriToiDa ? parseFloat(GiaTriToiDa) : null,
      DonToiThieu: DonToiThieu ? parseFloat(DonToiThieu) : 0,
      SoLuong: SoLuong ? parseInt(SoLuong) : 100,
      NgayBatDau: NgayBatDau || null,
      NgayHetHan: NgayHetHan || null,
      TrangThai: TrangThai || 'Hoạt động'
    });

    return res.status(201).json({
      message: 'Tạo mã giảm giá mới thành công.',
      voucher
    });
  } catch (error) {
    console.error('Create voucher error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo mã giảm giá.' });
  }
};

// Admin: Update voucher
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      MoTa,
      LoaiGiam,
      GiaTriGiam,
      GiaTriToiDa,
      DonToiThieu,
      SoLuong,
      NgayBatDau,
      NgayHetHan,
      TrangThai
    } = req.body;

    const voucher = await KhuyenMai.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá.' });
    }

    if (MoTa !== undefined) voucher.MoTa = MoTa;
    if (LoaiGiam !== undefined) voucher.LoaiGiam = LoaiGiam;
    if (GiaTriGiam !== undefined) voucher.GiaTriGiam = parseFloat(GiaTriGiam);
    if (GiaTriToiDa !== undefined) voucher.GiaTriToiDa = GiaTriToiDa ? parseFloat(GiaTriToiDa) : null;
    if (DonToiThieu !== undefined) voucher.DonToiThieu = parseFloat(DonToiThieu);
    if (SoLuong !== undefined) voucher.SoLuong = parseInt(SoLuong);
    if (NgayBatDau !== undefined) voucher.NgayBatDau = NgayBatDau || null;
    if (NgayHetHan !== undefined) voucher.NgayHetHan = NgayHetHan || null;
    if (TrangThai !== undefined) voucher.TrangThai = TrangThai;

    await voucher.save();

    return res.json({
      message: 'Cập nhật mã giảm giá thành công.',
      voucher
    });
  } catch (error) {
    console.error('Update voucher error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật mã giảm giá.' });
  }
};

// Admin: Delete voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await KhuyenMai.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ message: 'Không tìm thấy mã giảm giá.' });
    }

    await voucher.destroy();
    return res.json({ message: 'Đã xóa mã giảm giá thành công.' });
  } catch (error) {
    console.error('Delete voucher error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xóa mã giảm giá.' });
  }
};
