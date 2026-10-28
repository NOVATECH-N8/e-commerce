const { DanhMuc, SanPham } = require('../models');

// Public: lấy toàn bộ danh sách
exports.getCategories = async (req, res) => {
  try {
    const categories = await DanhMuc.findAll({
      order: [['MaDM', 'ASC']]
    });
    return res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách danh mục.' });
  }
};

// Admin: Create category
exports.createCategory = async (req, res) => {
  const { TenDM, MoTa } = req.body;

  if (!TenDM) {
    return res.status(400).json({ message: 'Tên danh mục không được để trống.' });
  }

  try {
    const newCategory = await DanhMuc.create({ TenDM, MoTa });
    return res.status(201).json({
      message: 'Tạo danh mục mới thành công.',
      category: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo danh mục.' });
  }
};

// Admin: Update category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { TenDM, MoTa } = req.body;

  try {
    const category = await DanhMuc.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục cần cập nhật.' });
    }

    if (TenDM) category.TenDM = TenDM;
    if (MoTa !== undefined) category.MoTa = MoTa;

    await category.save();

    return res.json({
      message: 'Cập nhật danh mục thành công.',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật danh mục.' });
  }
};

// Admin: Delete category (Prevent if products are linked)
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await DanhMuc.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục cần xóa.' });
    }

    // Check if products are linked to this category
    const productCount = await SanPham.count({ where: { MaDM: id } });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa danh mục này vì đang có ${productCount} sản phẩm trực thuộc. Vui lòng di chuyển các sản phẩm sang danh mục khác trước.`
      });
    }

    await category.destroy();

    return res.json({ message: 'Xóa danh mục thành công.' });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xóa danh mục.' });
  }
};
