const { DonHang, ChiTietDonHang, SanPham, ChiTietGioHang, GioHang, NguoiDung, sequelize } = require('../models');
const { Op } = require('sequelize');

// Customer: Place an order from cart
exports.placeOrder = async (req, res) => {
  const { DiaChiGiaoHang, SDTNhanHang, GhiChu } = req.body;

  if (!DiaChiGiaoHang || !SDTNhanHang) {
    return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ và số điện thoại nhận hàng.' });
  }

  // Use a Sequelize transaction to ensure database consistency
  const t = await sequelize.transaction();

  try {
    // 1. Get user cart
    const cart = await GioHang.findOne({
      where: { MaKH: req.user.MaKH },
      transaction: t
    });

    if (!cart) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy giỏ hàng của bạn.' });
    }

    // 2. Get cart details with products
    const cartItems = await ChiTietGioHang.findAll({
      where: { GIOHANGMaGioHang: cart.MaGioHang },
      include: [{ model: SanPham, as: 'SanPham' }],
      transaction: t
    });

    if (cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.' });
    }

    // 3. Validate stock and active status
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const product = item.SanPham;

      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: `Sản phẩm với mã ${item.SANPHAMMaSP} không còn tồn tại.` });
      }

      if (product.TrangThai === 'Ngừng bán') {
        await t.rollback();
        return res.status(400).json({ message: `Sản phẩm '${product.TenSP}' đã ngừng bán.` });
      }

      if (item.SoLuong > product.SoLuongTon) {
        await t.rollback();
        return res.status(400).json({
          message: `Sản phẩm '${product.TenSP}' không đủ hàng tồn kho. Chỉ còn lại ${product.SoLuongTon} sản phẩm.`
        });
      }

      const itemTotal = parseFloat(product.GiaBan) * item.SoLuong;
      totalAmount += itemTotal;

      orderItemsData.push({
        MaSP: product.MaSP,
        DongGia: product.GiaBan,
        SoLuong: item.SoLuong,
        ThanhTien: itemTotal,
        productInstance: product // save for stock update
      });
    }

    // 4. Create Order
    const now = new Date();
    const order = await DonHang.create({
      NgayDatHang: now.toISOString().split('T')[0],
      ThoiGianDatHang: now,
      TongTien: totalAmount,
      TrangThai: 'Chờ xử lý',
      DiaChiGiaoHang,
      SDTNhanHang,
      GhiChu,
      MaKH: req.user.MaKH
    }, { transaction: t });

    // 5. Create Order Details and update product stock
    for (const itemData of orderItemsData) {
      await ChiTietDonHang.create({
        MaDonHang: order.MaDonHang,
        MaSP: itemData.MaSP,
        DongGia: itemData.DongGia,
        SoLuong: itemData.SoLuong,
        ThanhTien: itemData.ThanhTien
      }, { transaction: t });

      // Deduct stock
      const product = itemData.productInstance;
      product.SoLuongTon -= itemData.SoLuong;
      await product.save({ transaction: t });
    }

    // 6. Clear user cart
    await ChiTietGioHang.destroy({
      where: { GIOHANGMaGioHang: cart.MaGioHang },
      transaction: t
    });

    // Commit transaction
    await t.commit();

    return res.status(201).json({
      message: 'Đặt hàng thành công.',
      MaDonHang: order.MaDonHang,
      order
    });
  } catch (error) {
    await t.rollback();
    console.error('Checkout error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi đặt hàng.' });
  }
};

// Customer: Get order history for logged-in account
exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await DonHang.findAll({
      where: { MaKH: req.user.MaKH },
      include: [
        {
          model: ChiTietDonHang,
          as: 'ChiTietDonHangs',
          include: [{ model: SanPham, as: 'SanPham', attributes: ['TenSP', 'AnhMinhHoa'] }]
        }
      ],
      order: [['ThoiGianDatHang', 'DESC']]
    });

    return res.json(orders);
  } catch (error) {
    console.error('Fetch order history error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải lịch sử đơn hàng.' });
  }
};

// Public: Track order using phone number or Order ID
exports.trackOrderPublic = async (req, res) => {
  const { phone, orderId } = req.query;

  if (!phone && !orderId) {
    return res.status(400).json({ message: 'Vui lòng cung cấp số điện thoại hoặc mã đơn hàng để tra cứu.' });
  }

  const whereClause = {};

  if (orderId) {
    whereClause.MaDonHang = orderId;
  }

  if (phone) {
    whereClause.SDTNhanHang = phone;
  }

  try {
    const orders = await DonHang.findAll({
      where: whereClause,
      include: [
        {
          model: ChiTietDonHang,
          as: 'ChiTietDonHangs',
          include: [{ model: SanPham, as: 'SanPham', attributes: ['TenSP', 'AnhMinhHoa'] }]
        }
      ],
      order: [['ThoiGianDatHang', 'DESC']]
    });

    return res.json(orders);
  } catch (error) {
    console.error('Track order error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tra cứu đơn hàng.' });
  }
};

// Admin: Get all orders with search / filters
exports.getAdminOrders = async (req, res) => {
  const { search } = req.query; // search can be orderId, customer name, or phone number

  let whereClause = {};

  if (search) {
    // If it's a numeric string, try matching by Order ID or phone number
    const isNumeric = /^\d+$/.test(search);
    if (isNumeric) {
      whereClause = {
        [Op.or]: [
          { MaDonHang: parseInt(search) },
          { SDTNhanHang: { [Op.like]: `%${search}%` } }
        ]
      };
    } else {
      // Find orders belonging to user accounts with matching display name
      whereClause = {
        [Op.or]: [
          { SDTNhanHang: { [Op.like]: `%${search}%` } },
          { DiaChiGiaoHang: { [Op.like]: `%${search}%` } }
        ]
      };
    }
  }

  try {
    const orders = await DonHang.findAll({
      where: whereClause,
      include: [
        {
          model: NguoiDung,
          as: 'NguoiDung',
          attributes: ['TenKH', 'TaiKhoan', 'Email']
        },
        {
          model: ChiTietDonHang,
          as: 'ChiTietDonHangs',
          include: [{ model: SanPham, as: 'SanPham', attributes: ['TenSP', 'AnhMinhHoa'] }]
        }
      ],
      order: [['ThoiGianDatHang', 'DESC']]
    });

    // If search filter is active and not numeric, we can also filter in JS for user's TenKH
    let filteredOrders = orders;
    if (search && !/^\d+$/.test(search)) {
      filteredOrders = orders.filter(order => {
        const customerName = order.NguoiDung ? order.NguoiDung.TenKH : '';
        return customerName.toLowerCase().includes(search.toLowerCase()) || 
               order.SDTNhanHang.includes(search) || 
               order.DiaChiGiaoHang.toLowerCase().includes(search.toLowerCase());
      });
    }

    return res.json(filteredOrders);
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải đơn hàng quản trị.' });
  }
};

// Cancel Order & Restore stock quantities (Transaction safe)
const executeOrderCancellation = async (orderId, t) => {
  const order = await DonHang.findByPk(orderId, { transaction: t });

  if (!order) {
    throw new Error('Không tìm thấy đơn hàng.');
  }

  if (order.TrangThai === 'Đã hủy') {
    throw new Error('Đơn hàng đã được hủy trước đó.');
  }

  // Get order items
  const items = await ChiTietDonHang.findAll({
    where: { MaDonHang: orderId },
    transaction: t
  });

  // Restore stock
  for (const item of items) {
    const product = await SanPham.findByPk(item.MaSP, { transaction: t });
    if (product) {
      product.SoLuongTon += item.SoLuong;
      // If product was discontinued, we keep it as discontinued, just restore the quantity
      await product.save({ transaction: t });
    }
  }

  // Update order status
  order.TrangThai = 'Đã hủy';
  await order.save({ transaction: t });

  return order;
};

// Customer: Cancel their own order (only if pending 'Chờ xử lý')
exports.cancelOwnOrder = async (req, res) => {
  const { id } = req.params;

  const t = await sequelize.transaction();

  try {
    const order = await DonHang.findByPk(id, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    // Check ownership
    if (order.MaKH !== req.user.MaKH) {
      await t.rollback();
      return res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này.' });
    }

    // Check status
    if (order.TrangThai !== 'Chờ xử lý') {
      await t.rollback();
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng ở trạng thái Chờ xử lý.' });
    }

    await executeOrderCancellation(id, t);

    await t.commit();
    return res.json({ message: 'Hủy đơn hàng và hoàn trả kho hàng thành công.' });
  } catch (error) {
    await t.rollback();
    console.error('Cancel order error:', error);
    return res.status(500).json({ message: error.message || 'Lỗi máy chủ khi hủy đơn hàng.' });
  }
};

// Admin: Cancel order or Update Order Status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { TrangThai } = req.body;

  const allowedStatuses = ['Chờ xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];
  if (!allowedStatuses.includes(TrangThai)) {
    return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });
  }

  const t = await sequelize.transaction();

  try {
    const order = await DonHang.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    if (TrangThai === 'Đã hủy' && order.TrangThai !== 'Đã hủy') {
      // Perform cancellation with stock restoration
      await executeOrderCancellation(id, t);
    } else {
      // Normal status update
      order.TrangThai = TrangThai;
      await order.save({ transaction: t });
    }

    await t.commit();
    return res.json({ message: 'Cập nhật trạng thái đơn hàng thành công.', TrangThai });
  } catch (error) {
    await t.rollback();
    console.error('Update status error:', error);
    return res.status(500).json({ message: error.message || 'Lỗi máy chủ khi cập nhật trạng thái.' });
  }
};
