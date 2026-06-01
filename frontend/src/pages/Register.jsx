import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    TaiKhoan: '',
    TenKH: '',
    Email: '',
    SDT: '',
    MatKhau: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { TaiKhoan, TenKH, Email, SDT, MatKhau, confirmPassword } = formData;

    // Front-end validations
    if (!TaiKhoan || !TenKH || !Email || !MatKhau) {
      setToast({ type: 'error', message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
      return;
    }

    if (MatKhau.length < 6) {
      setToast({ type: 'error', message: 'Mật khẩu phải chứa ít nhất 6 ký tự.' });
      return;
    }

    if (MatKhau !== confirmPassword) {
      setToast({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      setToast({ type: 'error', message: 'Định dạng Email không hợp lệ.' });
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      TaiKhoan,
      TenKH,
      Email,
      SDT,
      MatKhau
    });
    setIsSubmitting(false);

    if (result.success) {
      setToast({ type: 'success', message: 'Đăng ký tài khoản thành công! Đang chuyển hướng...' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setToast({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-8 animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-slate-800 font-display">Tạo tài khoản mới</h2>
          <p className="text-sm text-slate-500 mt-1">Đăng ký thành viên mua sắm tại TechShop</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TaiKhoan */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tên tài khoản *</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                name="TaiKhoan"
                placeholder="Nhập tên tài khoản"
                value={formData.TaiKhoan}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 transition-colors text-sm text-slate-700"
                required
              />
            </div>
          </div>

          {/* TenKH */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Họ và tên *</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                name="TenKH"
                placeholder="Nguyễn Văn A"
                value={formData.TenKH}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 transition-colors text-sm text-slate-700"
                required
              />
            </div>
          </div>

          {/* Grid for Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  name="Email"
                  placeholder="name@example.com"
                  value={formData.Email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 transition-colors text-sm text-slate-700"
                  required
                />
              </div>
            </div>

            {/* SDT */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số điện thoại</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="tel"
                  name="SDT"
                  placeholder="0912345678"
                  value={formData.SDT}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 transition-colors text-sm text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mật khẩu *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="MatKhau"
                  placeholder="••••••••"
                  value={formData.MatKhau}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 transition-colors text-sm text-slate-700"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Xác nhận mật khẩu *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 transition-colors text-sm text-slate-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all hover:scale-[1.01] flex items-center justify-center text-sm"
            >
              {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng Ký Thành Viên'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
