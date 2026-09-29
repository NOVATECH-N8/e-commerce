import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, Eye, EyeOff, Search, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const ReviewAdmin = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data || []);
    } catch (err) {
      console.error('Fetch admin reviews error:', err);
      setToast({ type: 'error', message: 'Không thể tải danh sách đánh giá.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Hiển thị' ? 'Ẩn' : 'Hiển thị';
    try {
      await api.put(`/admin/reviews/${id}/status`, { TrangThai: newStatus });
      setToast({ type: 'success', message: `Đã đổi trạng thái thành "${newStatus}".` });
      setReviews(reviews.map(r => r.MaDanhGia === id ? { ...r, TrangThai: newStatus } : r));
    } catch (err) {
      console.error('Toggle status error:', err);
      setToast({ type: 'error', message: 'Lỗi khi cập nhật trạng thái đánh giá.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?')) return;

    try {
      await api.delete(`/admin/reviews/${id}`);
      setToast({ type: 'success', message: 'Đã xóa đánh giá thành công.' });
      setReviews(reviews.filter(r => r.MaDanhGia !== id));
    } catch (err) {
      console.error('Delete review error:', err);
      setToast({ type: 'error', message: 'Lỗi khi xóa đánh giá.' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReviews = reviews.filter((r) => {
    const matchStatus = statusFilter === 'ALL' || r.TrangThai === statusFilter;
    const matchSearch =
      (r.SanPham?.TenSP && r.SanPham.TenSP.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.NguoiDung?.TenKH && r.NguoiDung.TenKH.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.NoiDung && r.NoiDung.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

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
            <MessageSquare className="w-6 h-6 text-[#0284c7]" /> Quản Lý Đánh Giá & Nhận Xét
          </h2>
          <p className="text-slate-400 text-xs mt-1">Kiểm duyệt và quản lý các đánh giá, phản hồi thực tế từ khách hàng</p>
        </div>

        <button
          onClick={fetchReviews}
          className="p-2 text-slate-600 hover:text-[#0284c7] hover:bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-1.5 transition-colors self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo sản phẩm, khách hàng, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-bold text-slate-600">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
          >
            <option value="ALL">Tất cả ({reviews.length})</option>
            <option value="Hiển thị">Đang hiển thị</option>
            <option value="Ẩn">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#0284c7] animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Đang tải danh sách đánh giá...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center p-12 text-slate-400 text-xs">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-300" />
            Không có đánh giá nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Sản phẩm</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Đánh giá</th>
                  <th className="py-3 px-4">Nội dung bình luận</th>
                  <th className="py-3 px-4">Hình ảnh</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredReviews.map((r) => {
                  const img = r.HinhAnh
                    ? r.HinhAnh.startsWith('http') ? r.HinhAnh : `http://localhost:5000${r.HinhAnh}`
                    : null;

                  return (
                    <tr key={r.MaDanhGia} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="flex items-center gap-2">
                          <img
                            src={r.SanPham?.AnhMinhHoa}
                            alt=""
                            className="w-8 h-8 object-contain rounded border p-0.5 shrink-0"
                          />
                          <span className="font-bold text-slate-800 truncate" title={r.SanPham?.TenSP}>
                            {r.SanPham?.TenSP || `SP #${r.MaSP}`}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{r.NguoiDung?.TenKH || 'Khách hàng'}</p>
                        <p className="text-[10px] text-slate-400">{r.NguoiDung?.Email || r.NguoiDung?.SDT || ''}</p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              className={`w-3.5 h-3.5 ${
                                st <= r.SoSao ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs text-slate-600">
                        <p className="line-clamp-2" title={r.NoiDung}>{r.NoiDung}</p>
                      </td>

                      <td className="py-3 px-4">
                        {img ? (
                          <img
                            src={img}
                            alt="Review"
                            onClick={() => setPreviewImg(img)}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                            title="Bấm để xem to"
                          />
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDate(r.NgayDanhGia)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.TrangThai === 'Hiển thị'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.TrangThai}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(r.MaDanhGia, r.TrangThai)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            r.TrangThai === 'Hiển thị'
                              ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={r.TrangThai === 'Hiển thị' ? 'Ẩn đánh giá' : 'Hiện lại đánh giá'}
                        >
                          {r.TrangThai === 'Hiển thị' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDelete(r.MaDanhGia)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={previewImg} alt="Phóng to ảnh feedback" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <button
              onClick={() => setPreviewImg(null)}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-1.5 hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewAdmin;
