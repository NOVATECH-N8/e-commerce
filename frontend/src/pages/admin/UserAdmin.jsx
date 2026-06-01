import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Lock, Unlock, ShieldAlert, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

const UserAdmin = () => {
  const { user: currentAdmin } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    TaiKhoan: '',
    MatKhau: '',
    TenKH: '',
    SDT: '',
    Email: '',
    VaiTro: 'Customer',
    TrangThai: 'Hoạt động'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(searchQuery ? `/admin/users?search=${searchQuery}` : '/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setToast({ type: 'error', message: 'Không thể tải danh sách người dùng.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      TaiKhoan: '',
      MatKhau: '',
      TenKH: '',
      SDT: '',
      Email: '',
      VaiTro: 'Customer',
      TrangThai: 'Hoạt động'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      TaiKhoan: user.TaiKhoan,
      MatKhau: '', // do not display password
      TenKH: user.TenKH,
      SDT: user.SDT || '',
      Email: user.Email,
      VaiTro: user.VaiTro,
      TrangThai: user.TrangThai
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const { TaiKhoan, MatKhau, TenKH, SDT, Email, VaiTro, TrangThai } = formData;

    if (!TaiKhoan || !TenKH || !Email || (!editingUser && !MatKhau)) {
      setToast({ type: 'error', message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
      return;
    }

    const payload = { TaiKhoan, TenKH, SDT, Email, VaiTro, TrangThai };
    if (MatKhau.trim() !== '') {
      payload.MatKhau = MatKhau;
    }

    try {
      if (editingUser) {
        const res = await api.put(`/admin/users/${editingUser.MaKH}`, payload);
        setToast({ type: 'success', message: res.data.message });
      } else {
        const res = await api.post('/admin/users', payload);
        setToast({ type: 'success', message: res.data.message });
      }
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Save user error:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Không thể lưu tài khoản.' });
    }
  };

  const handleLockToggle = async (userId, username) => {
    try {
      const res = await api.put(`/admin/users/${userId}/lock`);
      setToast({ type: 'success', message: res.data.message });
      fetchUsers();
    } catch (error) {
      console.error('Lock user error:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản.' });
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản '${username}'?`)) {
      try {
        const res = await api.delete(`/admin/users/${userId}`);
        setToast({ type: 'success', message: res.data.message });
        fetchUsers();
      } catch (error) {
        console.error('Delete user error:', error);
        setToast({ type: 'error', message: error.response?.data?.message || 'Không thể xóa tài khoản.' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 font-display">Quản lý Tài khoản</h2>
          <p className="text-slate-400 text-xs mt-1">Danh sách người dùng và phân quyền</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-primary-200 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Thêm tài khoản
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 max-w-md w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo Tài khoản, Tên KH, Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-slate-700 w-full"
        />
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto border border-slate-150 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150">
              <th className="p-4 w-12 text-center">ID</th>
              <th className="p-4">Tên hiển thị / Tài khoản</th>
              <th className="p-4">Email</th>
              <th className="p-4">Số điện thoại</th>
              <th className="p-4 text-center">Vai trò</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-center w-36">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                  Đang tải danh sách...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Không tìm thấy tài khoản người dùng.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = currentAdmin && currentAdmin.MaKH === u.MaKH;
                
                return (
                  <tr key={u.MaKH} className="hover:bg-slate-50/55 transition-colors">
                    <td className="p-4 text-center text-slate-400 font-bold">{u.MaKH}</td>
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-800">{u.TenKH}</span>
                        {isSelf && (
                          <span className="ml-1.5 bg-primary-100 text-primary-800 text-[9px] font-bold px-1.5 py-0.25 rounded-full uppercase">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">@{u.TaiKhoan}</div>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{u.Email}</td>
                    <td className="p-4 text-slate-500">{u.SDT || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        u.VaiTro === 'Admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.VaiTro === 'Admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.TrangThai === 'Hoạt động'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {u.TrangThai}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Lock toggle button */}
                        <button
                          onClick={() => handleLockToggle(u.MaKH, u.TaiKhoan)}
                          disabled={isSelf}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelf
                              ? 'text-slate-200 cursor-not-allowed'
                              : u.TrangThai === 'Hoạt động'
                              ? 'hover:bg-amber-50 text-slate-500 hover:text-amber-600'
                              : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
                          }`}
                          title={u.TrangThai === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {u.TrangThai === 'Hoạt động' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>

                        {/* Edit details button */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors"
                          title="Chỉnh sửa tài khoản"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete account button */}
                        <button
                          onClick={() => handleDeleteUser(u.MaKH, u.TaiKhoan)}
                          disabled={isSelf}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelf
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                          }`}
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-fade-in border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-3xl">
              <h3 className="text-lg font-black text-slate-800 font-display">
                {editingUser ? `Cập nhật tài khoản #${editingUser.MaKH}` : 'Thêm tài khoản mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Account Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên tài khoản (Username) *</label>
                <input
                  type="text"
                  name="TaiKhoan"
                  value={formData.TaiKhoan}
                  onChange={handleFormChange}
                  disabled={!!editingUser}
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {editingUser ? 'Mật khẩu mới (Bỏ trống nếu giữ nguyên)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  name="MatKhau"
                  value={formData.MatKhau}
                  onChange={handleFormChange}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                  required={!editingUser}
                />
              </div>

              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên *</label>
                <input
                  type="text"
                  name="TenKH"
                  value={formData.TenKH}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                  required
                />
              </div>

              {/* Email / SDT */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email *</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="tel"
                    name="SDT"
                    value={formData.SDT}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                  />
                </div>
              </div>

              {/* Role & status selectors */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vai trò tài khoản</label>
                  <select
                    name="VaiTro"
                    value={formData.VaiTro}
                    onChange={handleFormChange}
                    disabled={editingUser && editingUser.MaKH === currentAdmin.MaKH}
                    className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="Customer">Khách hàng</option>
                    <option value="Admin">Quản trị viên</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái khóa</label>
                  <select
                    name="TrangThai"
                    value={formData.TrangThai}
                    onChange={handleFormChange}
                    disabled={editingUser && editingUser.MaKH === currentAdmin.MaKH}
                    className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Bị khóa">Bị khóa</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 px-5 rounded-xl text-xs transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-md shadow-primary-100 transition-all"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdmin;
