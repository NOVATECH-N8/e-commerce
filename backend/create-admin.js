const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const { NguoiDung, GioHang } = require('./models');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công.');

    const username = 'admin123';
    const password = '123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user already exists
    const existingUser = await NguoiDung.findOne({ where: { TaiKhoan: username } });

    if (existingUser) {
      existingUser.MatKhau = hashedPassword;
      existingUser.VaiTro = 'Admin';
      existingUser.TrangThai = 'Hoạt động';
      await existingUser.save();
      console.log(`Đã cập nhật mật khẩu mới cho tài khoản admin "${username}" thành "123456".`);
    } else {
      const newUser = await NguoiDung.create({
        TaiKhoan: username,
        MatKhau: hashedPassword,
        TenKH: 'CMS Admin 123',
        SDT: '0999123456',
        Email: 'admin123@techshop.com',
        VaiTro: 'Admin',
        TrangThai: 'Hoạt động'
      });
      console.log(`Đã tạo thành công tài khoản admin mới: "${username}" với mật khẩu "123456".`);

      // Create empty cart for the new user as required by schema structure
      await GioHang.create({
        MaKH: newUser.MaKH
      });
      console.log(`Đã tạo giỏ hàng trống cho tài khoản "${username}".`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi tạo tài khoản admin:', error);
    process.exit(1);
  }
};

createAdmin();
