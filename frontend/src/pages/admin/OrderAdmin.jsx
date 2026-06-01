import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, AlertCircle, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const OrderAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(searchQuery ? `/admin/orders?search=${searchQuery}` : '/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setToast({ type: 'error', message: 'Không thể tải danh sách đơn hàng.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { TrangThai: newStatus });
      setToast({ type: 'success', message: res.data.message });
      fetchOrders(); // Refresh order listing (including product stocks)
    } catch (error) {
      console.error('Update status error:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.' });
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}? Việc này sẽ cập nhật trạng thái sang "Đã hủy" và tự động hoàn trả số lượng sản phẩm vào kho tồn kho.`)) {
      await handleStatusChange(orderId, 'Đã hủy');
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Status colors matching client view
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Đã xác nhận':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Đang giao':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Đã giao':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Đã hủy':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
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
          <h2 className="text-2xl font-black text-slate-800 font-display">Quản lý Đơn hàng</h2>
          <p className="text-slate-400 text-xs mt-1">Danh sách giao dịch mua bán</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-2 max-w-md w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo Mã đơn, Tên KH, Số điện thoại..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-slate-700 w-full"
        />
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-12 text-slate-400 border rounded-2xl">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
            Đang tải dữ liệu...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 text-slate-400 border rounded-2xl bg-slate-50/20">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Không tìm thấy đơn hàng nào.
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrder === order.MaDonHang;
            
            return (
              <div
                key={order.MaDonHang}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Accordion header info */}
                <div
                  onClick={() => toggleExpand(order.MaDonHang)}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 text-sm">
                      #{order.MaDonHang}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm font-display">
                          {order.NguoiDung ? order.NguoiDung.TenKH : 'Khách vãng lai'}
                        </span>
                        <span className="text-[10px] text-slate-400">({order.NguoiDung ? `@${order.NguoiDung.TaiKhoan}` : 'Không tài khoản'})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Đặt lúc: {new Date(order.ThoiGianDatHang).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    {/* Status dropdown selection */}
                    <div onClick={(e) => e.stopPropagation()} className="relative">
                      <select
                        value={order.TrangThai}
                        onChange={(e) => handleStatusChange(order.MaDonHang, e.target.value)}
                        className={`text-xs font-semibold rounded-full border px-3 py-1.5 outline-none bg-white cursor-pointer ${getStatusStyles(order.TrangThai)}`}
                      >
                        {['Chờ xử lý', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'].map(st => (
                          <option key={st} value={st} className="text-slate-800 bg-white font-medium">{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* Total billing */}
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400">Thanh toán</p>
                      <p className="font-extrabold text-primary-600 text-sm">{formatPrice(order.TongTien)}</p>
                    </div>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Extended Details */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/20 space-y-6">
                    {/* Address summaries */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1">
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Giao hàng đến</p>
                        <p className="text-slate-800 font-bold mt-1">SĐT: {order.SDTNhanHang}</p>
                        <p className="text-slate-700 mt-0.5">Địa chỉ: {order.DiaChiGiaoHang}</p>
                        {order.GhiChu && <p className="text-slate-500 mt-2 italic">Ghi chú: {order.GhiChu}</p>}
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-1">
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Tài khoản đặt mua</p>
                        {order.NguoiDung ? (
                          <>
                            <p className="text-slate-800 font-bold mt-1">Họ tên: {order.NguoiDung.TenKH}</p>
                            <p className="text-slate-700">Tài khoản: @{order.NguoiDung.TaiKhoan}</p>
                            <p className="text-slate-700">Email: {order.NguoiDung.Email}</p>
                          </>
                        ) : (
                          <p className="text-slate-400 italic mt-2">Đơn hàng không liên kết tài khoản.</p>
                        )}
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                        <div>
                          <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Hủy đơn & Hoàn kho</p>
                          <p className="text-slate-500 mt-1">
                            Hủy đơn hàng sẽ hoàn trả toàn bộ số lượng sản phẩm vào kho lưu trữ.
                          </p>
                        </div>
                        {order.TrangThai !== 'Đã hủy' && (
                          <button
                            onClick={() => handleCancelOrder(order.MaDonHang)}
                            className="mt-3 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2 rounded-xl transition-all w-full text-center text-xs"
                          >
                            <XCircle className="w-4 h-4" /> Hủy & Hoàn Kho Hàng
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order details grid */}
                    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100/50 text-slate-400 font-bold border-b border-slate-100">
                            <th className="p-3 pl-4">Sản phẩm</th>
                            <th className="p-3 text-right">Đơn giá</th>
                            <th className="p-3 text-center">Số lượng</th>
                            <th className="p-3 text-right pr-4">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          {order.ChiTietDonHangs?.map((item) => (
                            <tr key={item.MaSP}>
                              <td className="p-3 pl-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.SanPham?.AnhMinhHoa}
                                    alt={item.SanPham?.TenSP}
                                    className="w-8 h-8 object-cover rounded bg-slate-50 border"
                                  />
                                  <span className="font-bold text-slate-800">{item.SanPham?.TenSP || `Sản phẩm #${item.MaSP}`}</span>
                                </div>
                              </td>
                              <td className="p-3 text-right font-medium">{formatPrice(item.DongGia)}</td>
                              <td className="p-3 text-center font-bold">{item.SoLuong}</td>
                              <td className="p-3 text-right pr-4 font-bold text-slate-800">{formatPrice(item.ThanhTien)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderAdmin;
