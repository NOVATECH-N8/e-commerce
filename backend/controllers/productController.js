const { SanPham, DanhMuc, HinhAnh, ChiTietGioHang, ChiTietDonHang } = require('../models');
const { Op } = require('sequelize');

// Public: Lấy sản phẩm với tìm kiếm
exports.getProducts = async (req, res) => {
  const { search, categoryId, minPrice, maxPrice, status } = req.query;

  const whereClause = {};

  // Search by name
  if (search) {
    whereClause.TenSP = {
      [Op.like]: `%${search}%`
    };
  }

  // Filter by category
  if (categoryId) {
    whereClause.MaDM = categoryId;
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    whereClause.GiaBan = {};
    if (minPrice) {
      whereClause.GiaBan[Op.gte] = parseFloat(minPrice);
    }
    if (maxPrice) {
      whereClause.GiaBan[Op.lte] = parseFloat(maxPrice);
    }
  }

  // Filter by status (public view only displays 'Đang bán' by default, admin can see all)
  if (status) {
    whereClause.TrangThai = status;
  }

  try {
    const products = await SanPham.findAll({
      where: whereClause,
      include: [
        { model: DanhMuc, as: 'DanhMuc', attributes: ['TenDM'] },
        { model: HinhAnh, as: 'HinhAnhs', attributes: ['MaAnh', 'DuongDan', 'KichThuoc'] }
      ],
      order: [['MaSP', 'DESC']]
    });

    return res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách sản phẩm.' });
  }
};

// Public: Get detailed product info
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await SanPham.findByPk(id, {
      include: [
        { model: DanhMuc, as: 'DanhMuc', attributes: ['MaDM', 'TenDM'] },
        { model: HinhAnh, as: 'HinhAnhs', attributes: ['MaAnh', 'DuongDan', 'KichThuoc'] }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Fetch product detail error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải chi tiết sản phẩm.' });
  }
};

// Admin: Create product
exports.createProduct = async (req, res) => {
  const { TenSP, GiaBan, AnhMinhHoa, MoTa, ThongSo, SoLuongTon, TrangThai, MaDM, HinhAnhs } = req.body;

  // Validation
  if (!TenSP || GiaBan === undefined || SoLuongTon === undefined) {
    return res.status(400).json({ message: 'Vui lòng cung cấp các trường bắt buộc (Tên, Giá bán, Số lượng tồn).' });
  }

  try {
    // Check if category exists
    if (MaDM) {
      const category = await DanhMuc.findByPk(MaDM);
      if (!category) {
        return res.status(400).json({ message: 'Danh mục sản phẩm không tồn tại.' });
      }
    }

    // Create SanPham
    const newProduct = await SanPham.create({
      TenSP,
      GiaBan,
      AnhMinhHoa: AnhMinhHoa || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500', // default fallback
      MoTa,
      ThongSo: typeof ThongSo === 'string' ? ThongSo : JSON.stringify(ThongSo || {}),
      SoLuongTon,
      TrangThai: TrangThai || 'Đang bán',
      MaDM
    });

    // Create gallery images if provided
    if (HinhAnhs && Array.isArray(HinhAnhs)) {
      const imageRecords = HinhAnhs.map(img => ({
        DuongDan: img.DuongDan || img,
        KichThuoc: img.KichThuoc || '800x600',
        MaSP: newProduct.MaSP
      }));
      await HinhAnh.bulkCreate(imageRecords);
    }

    // Fetch newly created product with associations
    const createdProduct = await SanPham.findByPk(newProduct.MaSP, {
      include: [
        { model: DanhMuc, as: 'DanhMuc', attributes: ['TenDM'] },
        { model: HinhAnh, as: 'HinhAnhs' }
      ]
    });

    return res.status(201).json({
      message: 'Thêm sản phẩm mới thành công.',
      product: createdProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo sản phẩm mới.' });
  }
};

// Admin: Update product details
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { TenSP, GiaBan, AnhMinhHoa, MoTa, ThongSo, SoLuongTon, TrangThai, MaDM, HinhAnhs } = req.body;

  try {
    const product = await SanPham.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm cần cập nhật.' });
    }

    // Validation
    if (MaDM) {
      const category = await DanhMuc.findByPk(MaDM);
      if (!category) {
        return res.status(400).json({ message: 'Danh mục sản phẩm không tồn tại.' });
      }
    }

    // Update fields
    if (TenSP !== undefined) product.TenSP = TenSP;
    if (GiaBan !== undefined) product.GiaBan = GiaBan;
    if (AnhMinhHoa !== undefined) product.AnhMinhHoa = AnhMinhHoa;
    if (MoTa !== undefined) product.MoTa = MoTa;
    if (ThongSo !== undefined) {
      product.ThongSo = typeof ThongSo === 'string' ? ThongSo : JSON.stringify(ThongSo);
    }
    if (SoLuongTon !== undefined) product.SoLuongTon = SoLuongTon;
    if (TrangThai !== undefined) product.TrangThai = TrangThai;
    if (MaDM !== undefined) product.MaDM = MaDM;

    await product.save();

    // Update gallery images if provided
    if (HinhAnhs && Array.isArray(HinhAnhs)) {
      // Remove old image records
      await HinhAnh.destroy({ where: { MaSP: product.MaSP } });

      // Create new ones
      const imageRecords = HinhAnhs.map(img => ({
        DuongDan: img.DuongDan || img,
        KichThuoc: img.KichThuoc || '800x600',
        MaSP: product.MaSP
      }));
      await HinhAnh.bulkCreate(imageRecords);
    }

    const updatedProduct = await SanPham.findByPk(product.MaSP, {
      include: [
        { model: DanhMuc, as: 'DanhMuc', attributes: ['TenDM'] },
        { model: HinhAnh, as: 'HinhAnhs' }
      ]
    });

    return res.json({
      message: 'Cập nhật thông tin sản phẩm thành công.',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật sản phẩm.' });
  }
};

// Admin: Delete product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await SanPham.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm cần xóa.' });
    }

    // Delete references in cart and order details to avoid Foreign Key violations
    await ChiTietGioHang.destroy({ where: { SANPHAMMaSP: id } });
    await ChiTietDonHang.destroy({ where: { MaSP: id } });
    await product.destroy();

    return res.json({ message: 'Xóa sản phẩm thành công.' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xóa sản phẩm.' });
  }
};
