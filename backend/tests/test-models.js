const { sequelize, SanPham, NguoiDung, DonHang, DanhGia, KhuyenMai } = require('../models');

async function testModels() {
  console.log('--- Đang kiểm thử Models CSDL DANHGIA & KHUYENMAI ---');

  try {
    // 1. Đồng bộ cấu trúc bảng vào CSDL (SQLite/MySQL)
    await sequelize.sync({ alter: true });
    console.log('✅ Đồng bộ CSDL thành công (sequelize.sync({ alter: true }))');

    // 2. Kiểm thử tạo hoặc nạp sẵn Voucher mẫu
    const voucherCount = await KhuyenMai.count();
    console.log(`Số lượng voucher hiện tại trong DB: ${voucherCount}`);

    if (voucherCount === 0) {
      await KhuyenMai.bulkCreate([
        {
          MaCode: 'NOVATECH50',
          MoTa: 'Giảm ngay 50.000đ cho mọi đơn hàng từ 500.000đ',
          LoaiGiam: 'TIEN_MAT',
          GiaTriGiam: 50000,
          DonToiThieu: 500000,
          SoLuong: 100,
          NgayBatDau: '2026-01-01',
          NgayHetHan: '2026-12-31',
          TrangThai: 'Hoạt động'
        },
        {
          MaCode: 'GIAM100K',
          MoTa: 'Giảm 100.000đ cho đơn hàng giá trị từ 2.000.000đ',
          LoaiGiam: 'TIEN_MAT',
          GiaTriGiam: 100000,
          DonToiThieu: 2000000,
          SoLuong: 50,
          NgayBatDau: '2026-01-01',
          NgayHetHan: '2026-12-31',
          TrangThai: 'Hoạt động'
        },
        {
          MaCode: 'SALE10',
          MoTa: 'Giảm 10% tối đa 200.000đ cho khách hàng NovaTech',
          LoaiGiam: 'PHAN_TRAM',
          GiaTriGiam: 10,
          GiaTriToiDa: 200000,
          DonToiThieu: 1000000,
          SoLuong: 80,
          NgayBatDau: '2026-01-01',
          NgayHetHan: '2026-12-31',
          TrangThai: 'Hoạt động'
        }
      ]);
      console.log('✅ Đã nạp thành công 3 Voucher mẫu: NOVATECH50, GIAM100K, SALE10.');
    }

    const sampleVoucher = await KhuyenMai.findOne({ where: { MaCode: 'NOVATECH50' } });
    if (!sampleVoucher) {
      throw new Error('Không tìm thấy Voucher NOVATECH50 sau khi nạp.');
    }
    console.log(`✅ Tìm thấy Voucher: ${sampleVoucher.MaCode} - Giảm: ${sampleVoucher.GiaTriGiam}đ`);

    // 3. Kiểm thử tạo đánh giá mẫu nếu có sản phẩm và người dùng
    const product = await SanPham.findOne();
    const user = await NguoiDung.findOne();

    if (product && user) {
      const existingReview = await DanhGia.findOne({
        where: { MaSP: product.MaSP, MaKH: user.MaKH }
      });

      if (!existingReview) {
        const newReview = await DanhGia.create({
          MaSP: product.MaSP,
          MaKH: user.MaKH,
          SoSao: 5,
          NoiDung: 'Sản phẩm chính hãng đóng gói rất kỹ, giao hàng siêu nhanh 2h tại NovaTech!',
          HinhAnh: null,
          TrangThai: 'Hiển thị'
        });
        console.log(`✅ Đã tạo thử nghiệm Đánh giá ID: ${newReview.MaDanhGia} (${newReview.SoSao} sao)`);
      }

      // Query with associations
      const reviewWithDetails = await DanhGia.findOne({
        where: { MaSP: product.MaSP },
        include: [
          { model: SanPham, as: 'SanPham', attributes: ['TenSP'] },
          { model: NguoiDung, as: 'NguoiDung', attributes: ['TenKH'] }
        ]
      });

      if (reviewWithDetails) {
        console.log(`✅ Quan hệ DanhGia -> SanPham: "${reviewWithDetails.SanPham?.TenSP}"`);
        console.log(`✅ Quan hệ DanhGia -> NguoiDung: "${reviewWithDetails.NguoiDung?.TenKH}"`);
      }
    }

    console.log('🎉 TẤT CẢ KIỂM THỬ CHO TASK 2 (MODELS DANHGIA & KHUYENMAI) ĐÃ ĐẠT!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Lỗi kiểm thử Models:', err);
    process.exit(1);
  }
}

testModels();
