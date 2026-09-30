import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, CheckCircle, Ban, Search, Calendar, DollarSign, RefreshCw, X } from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const VoucherAdmin = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    MaCode: '',
    MoTa: '',
    LoaiGiam: 'TIEN_MAT',
    GiaTriGiam: '',
    GiaTriToiDa: '',
    DonToiThieu: '0',
    SoLuong: '100',
    NgayBatDau: '',
    NgayHetHan: '',
    TrangThai: 'Hoạt động'
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/vouchers');
      setVouchers(res.data || []);
    } catch (err) {
      console.error('Fetch admin vouchers error:', err);
      setToast({ type: 'error', message: 'Không thể tải danh sách voucher.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormData({
      MaCode: '',
      MoTa: '',
      LoaiGiam: 'TIEN_MAT',
      GiaTriGiam: '',
      GiaTriToiDa: '',
      DonToiThieu: '0',
      SoLuong: '100',
      NgayBatDau: new Date().toISOString().split('T')[0],
      NgayHetHan: '2026-12-31',
      TrangThai: 'Hoạt động'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      MaCode: voucher.MaCode || '',
      MoTa: voucher.MoTa || '',
      LoaiGiam: voucher.LoaiGiam || 'TIEN_MAT',
      GiaTriGiam: voucher.GiaTriGiam || '',
      GiaTriToiDa: voucher.GiaTriToiDa || '',
      DonToiThieu: voucher.DonToiThieu || '0',
      SoLuong: voucher.SoLuong || '100',
      NgayBatDau: voucher.NgayBatDau || '',
      NgayHetHan: voucher.NgayHetHan || '',
      TrangThai: voucher.TrangThai || 'Hoạt động'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.MaCode || !formData.GiaTriGiam) {
      setToast({ type: 'error', message: 'Vui lòng điền mã code và mức giảm.' });
      return;
    }

    try {
      if (editingVoucher) {
        await api.put(`/admin/vouchers/${editingVoucher.MaVoucher}`, formData);
        setToast({ type: 'success', message: 'Cập nhật mã giảm giá thành công!' });
      } else {
        await api.post('/admin/vouchers', formData);
        setToast({ type: 'success', message: 'Tạo mã giảm giá mới thành công!' });
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (err) {
      console.error('Save voucher error:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher.' });
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}" không?`)) return;

    try {
      await api.delete(`/admin/vouchers/${id}`);
      setToast({ type: 'success', message: `Đã xóa mã giảm giá ${code}.` });
      fetchVouchers();
    } catch (err) {
      console.error('Delete voucher error:', err);
      setToast({ type: 'error', message: 'Lỗi khi xóa mã giảm giá.' });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const filteredVouchers = vouchers.filter((v) =>
    v.MaCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.MoTa && v.MoTa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#d70018]" /> Quản Lý Mã Giảm Giá
          </h2>
          <p className="text-slate-400 text-xs mt-1">Cấu hình các chương trình ưu đãi, coupon khuyến mãi cho khách hàng</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#d70018] hover:bg-[#be0015] text-white font-bold py-2.5 px-4 rounded-[4px] text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Thêm Mã Mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-md border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-[4px] border border-slate-200 focus:outline-none focus:border-[#d70018]"
          />
        </div>

        <button
          onClick={fetchVouchers}
          className="p-2 text-slate-600 hover:text-[#d70018] hover:bg-slate-50 rounded-[4px] border border-slate-200 text-xs flex items-center gap-1.5 transition-colors self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#d70018] animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Đang tải danh sách voucher...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center p-12 text-slate-400 text-xs">
            <Tag className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-300" />
            Không tìm thấy mã giảm giá nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Mã Code</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4">Mức giảm</th>
                  <th className="py-3 px-4">Đơn tối thiểu</th>
                  <th className="py-3 px-4">Lượt còn</th>
                  <th className="py-3 px-4">Hạn dùng</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredVouchers.map((v) => (
                  <tr key={v.MaVoucher} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-[#d70018]">
                      {v.MaCode}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={v.MoTa}>
                      {v.MoTa || '—'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">
                      {v.LoaiGiam === 'PHAN_TRAM' ? `${v.GiaTriGiam}%` : formatPrice(v.GiaTriGiam)}
                      {v.LoaiGiam === 'PHAN_TRAM' && v.GiaTriToiDa && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (tối đa {formatPrice(v.GiaTriToiDa)})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {v.DonToiThieu > 0 ? formatPrice(v.DonToiThieu) : 'Không giới hạn'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[11px] font-bold ${
                        v.SoLuong > 10 ? 'bg-red-50 text-[#d70018]' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {v.SoLuong} lượt
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {v.NgayHetHan || 'Vô thời hạn'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.TrangThai === 'Hoạt động'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {v.TrangThai === 'Hoạt động' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Ban className="w-3 h-3" />}
                        {v.TrangThai}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(v)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-[#d70018] rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.MaVoucher, v.MaCode)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Xóa voucher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">
                {editingVoucher ? `Chỉnh sửa Voucher: ${editingVoucher.MaCode}` : 'Thêm Mã Giảm Giá Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã Code (viết liền, in hoa) *</label>
                <input
                  type="text"
                  placeholder="VD: CELLPHONES50"
                  value={formData.MaCode}
                  onChange={(e) => setFormData({ ...formData, MaCode: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  className="w-full p-2.5 rounded-[4px] border border-slate-300 font-mono font-bold uppercase focus:border-[#d70018] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả ngắn gọn</label>
                <input
                  type="text"
                  placeholder="VD: Giảm 50.000đ cho đơn hàng từ 500.000đ"
                  value={formData.MoTa}
                  onChange={(e) => setFormData({ ...formData, MoTa: e.target.value })}
                  className="w-full p-2.5 rounded-[4px] border border-slate-300 focus:border-[#d70018] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại giảm giá</label>
                  <select
                    value={formData.LoaiGiam}
                    onChange={(e) => setFormData({ ...formData, LoaiGiam: e.target.value })}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 font-semibold focus:border-[#d70018] outline-none"
                  >
                    <option value="TIEN_MAT">Tiền mặt cố định (VND)</option>
                    <option value="PHAN_TRAM">Phần trăm (%)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {formData.LoaiGiam === 'PHAN_TRAM' ? 'Mức giảm (%) *' : 'Số tiền giảm (VND) *'}
                  </label>
                  <input
                    type="number"
                    placeholder={formData.LoaiGiam === 'PHAN_TRAM' ? '10' : '50000'}
                    value={formData.GiaTriGiam}
                    onChange={(e) => setFormData({ ...formData, GiaTriGiam: e.target.value })}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 font-bold focus:border-[#d70018] outline-none"
                    required
                  />
                </div>
              </div>

              {formData.LoaiGiam === 'PHAN_TRAM' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức giảm tối đa (VND) (Tùy chọn)</label>
                  <input
                    type="number"
                    placeholder="VD: 200000"
                    value={formData.GiaTriToiDa}
                    onChange={(e) => setFormData({ ...formData, GiaTriToiDa: e.target.value })}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 focus:border-[#d70018] outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đơn hàng tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={formData.DonToiThieu}
                    onChange={(e) => setFormData({ ...formData, DonToiThieu: e.target.value })}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 focus:border-[#d70018] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số lượt sử dụng</label>
                  <input
                    type="number"
                    value={formData.SoLuong}
                    onChange={(e) => setFormData({ ...formData, SoLuong: e.target.value })}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 focus:border-[#d70018] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.NgayBatDau}
                    onChange={(e) => setFormData({ ...formData, NgayBatDau: e.target.value })}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 focus:border-[#d70018] outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ngày hết hạn</label>
                  <input
                    type="date"
                    value={formData.NgayHetHan}
                    onChange={(e) => setFormData({ ...formData, NgayHetHan: e.target.value })}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 focus:border-[#d70018] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Trạng thái</label>
                <select
                  value={formData.TrangThai}
                  onChange={(e) => setFormData({ ...formData, TrangThai: e.target.value })}
                  className="w-full p-2.5 rounded-[4px] border border-slate-300 font-semibold focus:border-[#d70018] outline-none"
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Tạm khóa">Tạm khóa</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-[4px] hover:bg-slate-50 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d70018] hover:bg-[#be0015] text-white rounded-[4px] font-bold transition-all shadow-sm"
                >
                  {editingVoucher ? 'Lưu Thay Đổi' : 'Tạo Voucher Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherAdmin;
