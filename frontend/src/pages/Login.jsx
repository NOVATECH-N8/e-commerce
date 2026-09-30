import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, Zap } from 'lucide-react';
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
      setToast({ type: 'success', message: 'Đăng nhập thành công!' });
      setTimeout(() => {
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

  const handleQuickFill = (u, p) => {
    setLoginIdentifier(u);
    setPassword(p);
  };

  return (
    <div className="w-full bg-[#f4f8fc] min-h-[75vh] flex items-center justify-center px-4 py-10">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="w-full max-w-md bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        
        {/* CellphoneS Red Header */}
        <div className="bg-gradient-to-r from-[#d70018] to-[#be0015] text-white p-6 text-center">
          <div className="w-10 h-10 rounded-md bg-white text-[#d70018] flex items-center justify-center font-black text-xl mx-auto mb-2 shadow-sm">
            <Zap className="w-5 h-5 fill-[#d70018]" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Đăng Nhập Thành Viên</h2>
          <p className="text-xs text-rose-100 mt-0.5">Khám phá quyền lợi Smember & ưu đãi công nghệ đỉnh cao</p>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Username/Email */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tài khoản hoặc Email *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Nhập tên tài khoản hoặc email"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-[4px] border border-slate-300 text-xs focus:border-[#d70018] outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-[4px] border border-slate-300 text-xs focus:border-[#d70018] outline-none"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#d70018] hover:bg-[#be0015] text-white font-bold py-2.5 rounded-[4px] text-xs uppercase tracking-wide transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          {/* Quick test accounts box */}
          <div className="p-3 bg-red-50/50 border border-red-200 rounded-[4px] text-xs space-y-1.5">
            <span className="font-bold text-[#d70018] block text-[11px] uppercase">
              Tài khoản dùng thử nhanh:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="px-2.5 py-1 bg-white border border-red-200 rounded-[3px] text-[11px] font-bold text-slate-800 hover:bg-red-50 hover:text-[#d70018]"
              >
                Admin (admin / admin123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('customer', 'customer123')}
                className="px-2.5 py-1 bg-white border border-red-200 rounded-[3px] text-[11px] font-bold text-slate-800 hover:bg-red-50 hover:text-[#d70018]"
              >
                Khách hàng (customer / customer123)
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[#d70018] font-bold hover:underline">
              Đăng ký tài khoản mới
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
