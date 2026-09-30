import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Eye, EyeOff, Zap } from 'lucide-react';
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
    <div className="w-full bg-[#f4f8fc] min-h-[80vh] flex items-center justify-center px-4 py-10">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* NovaTech Light Blue Header */}
        <div className="bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white p-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-white text-[#0284c7] flex items-center justify-center font-black text-xl mx-auto mb-2 shadow-sm">
            <Zap className="w-5 h-5 fill-[#0284c7]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Đăng Ký Thành Viên NovaTech</h2>
          <p className="text-xs text-sky-100 mt-0.5">Nhận ngay đặc quyền thành viên và ưu đãi giảm giá công nghệ</p>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên tài khoản (Username) *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="TaiKhoan"
                    placeholder="VD: nguyenvana"
                    value={formData.TaiKhoan}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên đầy đủ *</label>
                <input
                  type="text"
                  name="TenKH"
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.TenKH}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Địa chỉ Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="Email"
                    placeholder="email@domain.com"
                    value={formData.Email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="SDT"
                    placeholder="0912345678"
                    value={formData.SDT}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mật khẩu (Tối thiểu 6 ký tự) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="MatKhau"
                    placeholder="••••••••"
                    value={formData.MatKhau}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Xác nhận mật khẩu *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wide transition-colors shadow-sm shadow-sky-100 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isSubmitting ? 'ĐANG TẠO TÀI KHOẢN...' : 'HOÀN TẤT ĐĂNG KÝ'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Đã có tài khoản NovaTech?{' '}
            <Link to="/login" className="text-[#0284c7] font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;
