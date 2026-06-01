import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !password) {
      setToast({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin.' });
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginIdentifier, password);
    setIsSubmitting(false);

    if (result.success) {
      setToast({ type: 'success', message: 'Đăng nhập thành công.' });
      setTimeout(() => {
        // Redirect based on role
        if (result.user.VaiTro === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1000);
    } else {
      setToast({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 font-display">Chào mừng trở lại</h2>
          <p className="text-sm text-slate-500 mt-2">Đăng nhập tài khoản mua sắm TechShop của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account/Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tài khoản hoặc Email</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Nhập tên tài khoản hoặc email"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 transition-colors text-sm text-slate-700"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mật khẩu</label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 transition-colors text-sm text-slate-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-200 transition-all hover:scale-[1.01] flex items-center justify-center"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
