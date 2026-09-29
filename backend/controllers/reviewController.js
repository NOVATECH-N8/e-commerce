const { DanhGia, SanPham, NguoiDung, DonHang, ChiTietDonHang } = require('../models');
const { Op } = require('sequelize');

// Public: Get reviews for a specific product
exports.getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await DanhGia.findAll({
      where: {
        MaSP: id,
        TrangThai: 'Hiển thị'
      },
      include: [
        {
          model: NguoiDung,
          as: 'NguoiDung',
          attributes: ['MaKH', 'TenKH', 'TaiKhoan']
        }
      ],
      order: [['NgayDanhGia', 'DESC']]
    });

    // Calculate rating statistics
    const totalReviews = reviews.length;
    let averageRating = 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      const sumStars = reviews.reduce((acc, r) => {
        const star = Math.min(5, Math.max(1, r.SoSao || 5));
        ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
        return acc + star;
      }, 0);
      averageRating = parseFloat((sumStars / totalReviews).toFixed(1));
    }

    return res.json({
      totalReviews,
      averageRating,
      ratingDistribution,
      reviews
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách đánh giá.' });
  }
};

// Customer: Check if user is eligible to review (Verified Purchase)
exports.checkCanReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.MaKH;

    // Check if user has an existing review
    const existingReview = await DanhGia.findOne({
      where: { MaSP: id, MaKH: userId }
    });

    // Admin can always review for testing/demo
    if (req.user.VaiTro === 'Admin') {
      return res.json({
        canReview: true,
        hasReviewed: !!existingReview,
        existingReview: existingReview || null,
        message: 'Tài khoản Quản trị viên được phép đánh giá thử nghiệm.'
      });
    }

    // Check if user has completed order containing this product
    const deliveredOrder = await ChiTietDonHang.findOne({
      where: { MaSP: id },
      include: [
        {
          model: DonHang,
          where: {
            MaKH: userId,
            TrangThai: 'Đã giao'
          }
        }
      ]
    });

    if (!deliveredOrder) {
      return res.json({
        canReview: false,
        hasReviewed: !!existingReview,
        existingReview: existingReview || null,
        message: 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và nhận hàng thành công tại NovaTech.'
      });
    }

    return res.json({
      canReview: true,
      hasReviewed: !!existingReview,
      existingReview: existingReview || null,
      message: 'Xác thực người mua hàng thành công.'
    });

  } catch (error) {
    console.error('Check can review error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi kiểm tra điều kiện đánh giá.' });
  }
};

// Customer: Submit review for a product (Requires verifyToken)
exports.submitReview = async (req, res) => {
  try {
    const { id } = req.params; // MaSP
    const { SoSao, NoiDung, HinhAnh } = req.body;
    const userId = req.user.MaKH;

    const starValue = parseInt(SoSao, 10);
    if (!starValue || starValue < 1 || starValue > 5) {
      return res.status(400).json({ message: 'Số sao đánh giá phải từ 1 đến 5 sao.' });
    }

    const product = await SanPham.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm cần đánh giá.' });
    }

    // Verify Purchase: Must have a delivered order containing this product (or Admin)
    if (req.user.VaiTro !== 'Admin') {
      const deliveredOrder = await ChiTietDonHang.findOne({
        where: { MaSP: id },
        include: [
          {
            model: DonHang,
            where: {
              MaKH: userId,
              TrangThai: 'Đã giao'
            }
          }
        ]
      });

      if (!deliveredOrder) {
        return res.status(403).json({
          message: 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và đơn hàng được giao thành công.'
        });
      }
    }

    // Check if user already reviewed: if yes, update; if not, create
    const [review, created] = await DanhGia.findOrCreate({
      where: { MaSP: id, MaKH: userId },
      defaults: {
        SoSao: starValue,
        NoiDung: NoiDung || '',
        HinhAnh: HinhAnh || null,
        TrangThai: 'Hiển thị',
        NgayDanhGia: new Date()
      }
    });

    if (!created) {
      review.SoSao = starValue;
      review.NoiDung = NoiDung || '';
      review.HinhAnh = HinhAnh || review.HinhAnh;
      review.NgayDanhGia = new Date();
      review.TrangThai = 'Hiển thị';
      await review.save();
    }

    // Fetch review with user information
    const populatedReview = await DanhGia.findByPk(review.MaDanhGia, {
      include: [
        {
          model: NguoiDung,
          as: 'NguoiDung',
          attributes: ['MaKH', 'TenKH', 'TaiKhoan']
        }
      ]
    });

    return res.status(created ? 201 : 200).json({
      message: created ? 'Đánh giá sản phẩm thành công!' : 'Cập nhật đánh giá thành công!',
      review: populatedReview
    });

  } catch (error) {
    console.error('Submit review error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gửi đánh giá.' });
  }
};

// Admin: Get all reviews with filters
exports.getAdminReviews = async (req, res) => {
  try {
    const { status, productId } = req.query;
    const where = {};

    if (status) {
      where.TrangThai = status;
    }
    if (productId) {
      where.MaSP = productId;
    }

    const reviews = await DanhGia.findAll({
      where,
      include: [
        {
          model: SanPham,
          as: 'SanPham',
          attributes: ['MaSP', 'TenSP', 'AnhMinhHoa']
        },
        {
          model: NguoiDung,
          as: 'NguoiDung',
          attributes: ['MaKH', 'TenKH', 'Email', 'SDT']
        }
      ],
      order: [['NgayDanhGia', 'DESC']]
    });

    return res.json(reviews);
  } catch (error) {
    console.error('Admin get reviews error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi tải danh sách đánh giá quản trị.' });
  }
};

// Admin: Update review status (Hiển thị / Ẩn)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { TrangThai } = req.body;

    const review = await DanhGia.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
    }

    if (TrangThai) {
      review.TrangThai = TrangThai;
      await review.save();
    }

    return res.json({ message: 'Cập nhật trạng thái đánh giá thành công.', review });
  } catch (error) {
    console.error('Update review status error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi đổi trạng thái đánh giá.' });
  }
};

// Admin: Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await DanhGia.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
    }

    await review.destroy();
    return res.json({ message: 'Đã xóa đánh giá thành công.' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi xóa đánh giá.' });
  }
};
