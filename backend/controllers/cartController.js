const { GioHang, ChiTietGioHang, SanPham } = require('../models');

// Helper function to get or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await GioHang.findOne({ where: { MaKH: userId } });
  if (!cart) {
    cart = await GioHang.create({ MaKH: userId });
  }
  return cart;
};

// Customer: Get cart items
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.MaKH);

    const items = await ChiTietGioHang.findAll({
      where: { GIOHANGMaGioHang: cart.MaGioHang },
      include: [
        {
          model: SanPham,
          as: 'SanPham',
          attributes: ['MaSP', 'TenSP', 'GiaBan', 'AnhMinhHoa', 'SoLuongTon', 'TrangThai']
        }
      ]
    });

    return res.json({
      MaGioHang: cart.MaGioHang,
      items: items.map(item => ({
        MaSP: item.SANPHAMMaSP,
        TenSP: item.SanPham.TenSP,
        GiaBan: item.SanPham.GiaBan,
        AnhMinhHoa: item.SanPham.AnhMinhHoa,
        SoLuong: item.SoLuong,
        SoLuongTon: item.SanPham.SoLuongTon,
        TrangThai: item.SanPham.TrangThai,
        ThanhTien: parseFloat(item.SanPham.GiaBan) * item.SoLuong
      }))
    });
  } catch (error) {
    console.error('Fetch cart error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải giỏ hàng.' });
  }
};

// Customer: Add item to cart
exports.addToCart = async (req, res) => {
  const { MaSP, SoLuong } = req.body;
  const quantityToAdd = parseInt(SoLuong) || 1;

  if (!MaSP) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mã sản phẩm.' });
  }

  try {
    // 1. Check if product exists
    const product = await SanPham.findByPk(MaSP);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    // 2. Validate product status
    if (product.TrangThai === 'Ngừng bán') {
      return res.status(400).json({ message: 'Sản phẩm đã ngừng bán. Không thể thêm vào giỏ hàng.' });
    }

    // 3. Get user cart
    const cart = await getOrCreateCart(req.user.MaKH);

    // 4. Check if item already in cart
    const existingItem = await ChiTietGioHang.findOne({
      where: {
        GIOHANGMaGioHang: cart.MaGioHang,
        SANPHAMMaSP: MaSP
      }
    });

    const currentCartQty = existingItem ? existingItem.SoLuong : 0;
    const targetQty = currentCartQty + quantityToAdd;

    // 5. Validate stock quantity
    if (targetQty > product.SoLuongTon) {
      return res.status(400).json({
        message: `Không thể thêm. Số lượng trong giỏ hàng (${currentCartQty}) + số lượng thêm (${quantityToAdd}) vượt quá số lượng tồn kho (${product.SoLuongTon}).`
      });
    }

    if (existingItem) {
      existingItem.SoLuong = targetQty;
      await existingItem.save();
    } else {
      await ChiTietGioHang.create({
        GIOHANGMaGioHang: cart.MaGioHang,
        SANPHAMMaSP: MaSP,
        SoLuong: targetQty
      });
    }

    return res.json({ message: 'Đã thêm sản phẩm vào giỏ hàng thành công.' });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi thêm vào giỏ hàng.' });
  }
};

// Customer: Update item quantity in cart
exports.updateCartItem = async (req, res) => {
  const { MaSP, SoLuong } = req.body;
  const targetQty = parseInt(SoLuong);

  if (!MaSP || targetQty === undefined) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mã sản phẩm và số lượng.' });
  }

  if (targetQty <= 0) {
    return exports.removeCartItem(req, res); // redirect to remove if quantity is 0 or negative
  }

  try {
    const product = await SanPham.findByPk(MaSP);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });
    }

    if (product.TrangThai === 'Ngừng bán') {
      return res.status(400).json({ message: 'Sản phẩm đã ngừng bán.' });
    }

    // Validate stock
    if (targetQty > product.SoLuongTon) {
      return res.status(400).json({
        message: `Số lượng yêu cầu (${targetQty}) vượt quá số lượng tồn kho (${product.SoLuongTon}).`
      });
    }

    const cart = await getOrCreateCart(req.user.MaKH);
    const cartItem = await ChiTietGioHang.findOne({
      where: {
        GIOHANGMaGioHang: cart.MaGioHang,
        SANPHAMMaSP: MaSP
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng.' });
    }

    cartItem.SoLuong = targetQty;
    await cartItem.save();

    return res.json({ message: 'Cập nhật số lượng giỏ hàng thành công.' });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật giỏ hàng.' });
  }
};

// Customer: Remove item from cart
exports.removeCartItem = async (req, res) => {
  const MaSP = req.params.productId || req.body.MaSP;

  if (!MaSP) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mã sản phẩm.' });
  }

  try {
    const cart = await getOrCreateCart(req.user.MaKH);
    const deletedCount = await ChiTietGioHang.destroy({
      where: {
        GIOHANGMaGioHang: cart.MaGioHang,
        SANPHAMMaSP: MaSP
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng.' });
    }

    return res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng.' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xóa sản phẩm khỏi giỏ hàng.' });
  }
};

// Customer: Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.MaKH);
    await ChiTietGioHang.destroy({
      where: { GIOHANGMaGioHang: cart.MaGioHang }
    });

    return res.json({ message: 'Đã xóa tất cả sản phẩm trong giỏ hàng.' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi dọn dẹp giỏ hàng.' });
  }
};
