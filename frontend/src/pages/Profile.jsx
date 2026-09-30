import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Edit, ShieldCheck, Zap } from 'lucide-react';
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
    const updateData = { TenKH, Email, SDT };
    if (MatKhau && MatKhau.trim() !== '') {
      updateData.MatKhau = MatKhau;
    }

    const result = await updateProfile(updateData);
    setIsSubmitting(false);

    if (result.success) {
      setToast({ type: 'success', message: 'Cập nhật thông tin thành công!' });
      setFormData((prev) => ({ ...prev, MatKhau: '', confirmPassword: '' }));
    } else {
      setToast({ type: 'error', message: result.message });
    }
  };

  if (!user) return null;

  return (
    <div className="w-full bg-[#f4f8fc] min-h-screen py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 fill-white text-white" />
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Tài Khoản Thành Viên NovaTech
            </h1>
          </div>
          <p className="text-xs text-sky-100 font-medium">
            Quản lý thông tin hồ sơ và bảo mật tài khoản NovaTech
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Left Column: Avatar & Overview */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-[#e0f2fe] text-[#0284c7] rounded-full flex items-center justify-center font-black text-2xl uppercase border-2 border-[#bae6fd]">
                {user.TenKH ? user.TenKH.substring(0, 1) : 'U'}
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-sm">{user.TenKH}</h3>
                <span className="inline-block bg-[#f0f9ff] text-[#0284c7] border border-[#bae6fd] text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                  {user.VaiTro === 'Admin' ? 'Quản trị viên hệ thống' : 'Thành viên NovaTech VIP'}
                </span>
              </div>

              <div className="w-full border-t border-slate-100 pt-3 text-left space-y-2 text-xs text-slate-600">
                <p><strong>Tài khoản:</strong> {user.TaiKhoan}</p>
                <p className="truncate"><strong>Email:</strong> {user.Email}</p>
                <p><strong>SĐT:</strong> {user.SDT || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Edit form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#0284c7]" />
                <span>Chỉnh sửa thông tin</span>
              </h3>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ và tên *</label>
                <input
                  type="text"
                  name="TenKH"
                  value={formData.TenKH}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email *</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    name="SDT"
                    value={formData.SDT}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <Lock className="w-4 h-4 text-[#0284c7]" />
                  <span>Thay đổi mật khẩu (Bỏ trống nếu không muốn đổi)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      name="MatKhau"
                      value={formData.MatKhau}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wide transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
