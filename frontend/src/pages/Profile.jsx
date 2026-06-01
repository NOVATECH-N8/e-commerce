import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Edit, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    TenKH: '',
    Email: '',
    SDT: '',
    MatKhau: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync state with user data
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      setFormData({
        TenKH: user.TenKH || '',
        Email: user.Email || '',
        SDT: user.SDT || '',
        MatKhau: '',
        confirmPassword: ''
      });
    }
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { TenKH, Email, SDT, MatKhau, confirmPassword } = formData;

    if (!TenKH || !Email) {
      setToast({ type: 'error', message: 'Vui lòng cung cấp Tên hiển thị và Email.' });
      return;
    }

    if (MatKhau && MatKhau.trim() !== '') {
      if (MatKhau.length < 6) {
        setToast({ type: 'error', message: 'Mật khẩu mới phải từ 6 ký tự trở lên.' });
        return;
      }
      if (MatKhau !== confirmPassword) {
        setToast({ type: 'error', message: 'Mật khẩu mới và mật khẩu xác nhận không khớp.' });
        return;
      }
    }

    setIsSubmitting(true);
    const payload = { TenKH, Email, SDT };
    if (MatKhau && MatKhau.trim() !== '') {
      payload.MatKhau = MatKhau;
    }

    const result = await updateProfile(payload);
    setIsSubmitting(false);

    if (result.success) {
      setToast({ type: 'success', message: 'Cập nhật thông tin tài khoản thành công.' });
      setFormData(prev => ({ ...prev, MatKhau: '', confirmPassword: '' })); // clear password fields
    } else {
      setToast({ type: 'error', message: result.message });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
        <p className="text-sm text-slate-500">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 font-display">Thông tin tài khoản</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Overview card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-3xl shadow-md uppercase">
              {user.TenKH.substring(0, 1)}
            </div>
            
            <div>
              <h3 className="font-extrabold text-slate-800 text-base font-display">{user.TenKH}</h3>
              <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5">
                {user.VaiTro === 'Admin' ? 'Quản trị viên' : 'Khách hàng'}
              </span>
            </div>

            <div className="w-full border-t border-slate-50 pt-4 text-left space-y-2.5 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Tài khoản: <strong>{user.TaiKhoan}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">Email: {user.Email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>SĐT: {user.SDT || 'Chưa cung cấp'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Edit forms */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2 font-display">
              <Edit className="w-5 h-5 text-primary-500" />
              Chỉnh sửa thông tin cá nhân
            </h3>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Họ và tên *</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="TenKH"
                  value={formData.TenKH}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-primary-500 outline-none rounded-xl text-sm transition-colors text-slate-700"
                  required
                />
              </div>
            </div>

            {/* Grid Email / Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-primary-500 outline-none rounded-xl text-sm transition-colors text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    name="SDT"
                    value={formData.SDT}
                    onChange={handleChange}
                    placeholder="0912345678"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-primary-500 outline-none rounded-xl text-sm transition-colors text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Change password card */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1 font-display">
                <Lock className="w-4.5 h-4.5 text-primary-500" />
                Thay đổi mật khẩu (Bỏ trống nếu không muốn đổi)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="MatKhau"
                    value={formData.MatKhau}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-slate-200 focus:border-primary-500 outline-none rounded-xl text-sm transition-colors text-slate-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-slate-200 focus:border-primary-500 outline-none rounded-xl text-sm transition-colors text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-primary-100 text-sm"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
