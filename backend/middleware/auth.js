const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy mã xác thực. Vui lòng đăng nhập.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_ecommerce_key_2026_987654321');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' });
  }
};

const isAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.VaiTro === 'Admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Yêu cầu quyền Quản trị viên.' });
    }
  });
};

module.exports = {
  verifyToken,
  isAdmin
};
