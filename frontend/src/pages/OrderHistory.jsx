import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Phone, Receipt, XCircle, ChevronDown, ChevronUp, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';

const OrderHistory = () => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchId, setSearchId] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch logged-in user history automatically
  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/history');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching order history:', err);
      setToast({ type: 'error', message: 'Không thể tải lịch sử đơn hàng.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  // Handle public tracking search (Guest search)
  const handlePublicSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone && !searchId) {
      setToast({ type: 'warning', message: 'Vui lòng cung cấp số điện thoại hoặc mã đơn hàng.' });
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchPhone) queryParams.append('phone', searchPhone.trim());
      if (searchId) queryParams.append('orderId', searchId.trim());

      const res = await api.get(`/orders/track?${queryParams.toString()}`);
      setOrders(res.data);
      
      if (res.data.length === 0) {
        setToast({ type: 'info', message: 'Không tìm thấy đơn hàng tương ứng.' });
      } else {
        setToast({ type: 'success', message: `Tìm thấy ${res.data.length} đơn hàng.` });
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setToast({ type: 'error', message: 'Tra cứu thất bại. Vui lòng kiểm tra lại thông tin.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}? Sau khi hủy, sản phẩm sẽ được trả lại kho hàng.`)) {
      try {
        const res = await api.put(`/orders/${orderId}/cancel`);
        setToast({ type: 'success', message: res.data.message });
        
        // Refresh orders list
        if (user) {
          fetchUserOrders();
        } else {
          // Re-trigger guest search logic
          const queryParams = new URLSearchParams();
          if (searchPhone) queryParams.append('phone', searchPhone.trim());
          if (searchId) queryParams.append('orderId', searchId.trim());
          const trackRes = await api.get(`/orders/track?${queryParams.toString()}`);
          setOrders(trackRes.data);
        }
      } catch (error) {
        console.error('Cancel order error:', error);
        setToast({ type: 'error', message: error.response?.data?.message || 'Không thể hủy đơn hàng.' });
      }
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Map status string to Tailwind classes
  const getStatusStyles = (status) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Đã xác nhận':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Đang giao':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Đã giao':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Đã hủy':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 font-display">Tra cứu & Lịch sử đơn hàng</h1>

      {/* Public Search Form (for guests or direct searches) */}
      {!user && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-slate-800 text-sm font-display">Tra cứu đơn hàng nhanh (Dành cho khách hàng chưa đăng nhập)</h3>
          </div>
          
          <form onSubmit={handlePublicSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại nhận hàng</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="0912345678"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 outline-none focus:border-primary-500 rounded-xl text-sm transition-colors text-slate-700"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hoặc Mã đơn hàng</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Receipt className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Ví dụ: 1"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 outline-none focus:border-primary-500 rounded-xl text-sm transition-colors text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="sm:col-span-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5 h-[38px]"
            >
              <Search className="w-4 h-4" /> Tra cứu
            </button>
          </form>
        </div>
      )}

      {/* Orders List Container */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
            <p className="text-sm text-slate-500">Đang tải thông tin...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-base font-display">Chưa có đơn hàng nào</h4>
            {user ? (
              <p className="text-xs text-slate-500 mt-1">Lịch sử đặt hàng của tài khoản sẽ xuất hiện tại đây.</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Vui lòng cung cấp số điện thoại hoặc mã đơn hàng ở trên để tra cứu.</p>
            )}
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrder === order.MaDonHang;
            
            return (
              <div
                key={order.MaDonHang}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all"
              >
                {/* Header info */}
                <div
                  onClick={() => toggleExpand(order.MaDonHang)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-sm">
                      #{order.MaDonHang}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm font-display">Đơn hàng #{order.MaDonHang}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Đặt ngày: {order.NgayDatHang}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(order.TrangThai)}`}>
                      {order.TrangThai}
                    </span>

                    {/* Order Total */}
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Tổng tiền</p>
                      <p className="font-extrabold text-primary-600 text-sm">{formatPrice(order.TongTien)}</p>
                    </div>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-5 space-y-5 animate-fade-in bg-slate-50/30">
                    {/* Shipping Address details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                      <div className="space-y-1 bg-white p-4 rounded-xl border border-slate-100/50">
                        <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Thông tin giao hàng</p>
                        <p className="text-slate-700 font-bold mt-1">SĐT: {order.SDTNhanHang}</p>
                        <p className="text-slate-700 mt-1">Địa chỉ: {order.DiaChiGiaoHang}</p>
                        {order.GhiChu && <p className="text-slate-500 mt-2 italic">Ghi chú: {order.GhiChu}</p>}
                      </div>

                      <div className="space-y-1 bg-white p-4 rounded-xl border border-slate-100/50 flex flex-col justify-between">
                        <div>
                          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Thao tác đơn hàng</p>
                          <p className="text-slate-500 mt-2">
                            {order.TrangThai === 'Chờ xử lý' 
                              ? 'Bạn có thể hủy đơn hàng này trong lúc đơn hàng đang chờ xử lý.' 
                              : `Đơn hàng ở trạng thái "${order.TrangThai}" không thể hủy.`}
                          </p>
                        </div>
                        {order.TrangThai === 'Chờ xử lý' && (
                          <button
                            onClick={() => handleCancelOrder(order.MaDonHang)}
                            className="mt-3 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2 rounded-xl transition-all w-full text-center text-xs"
                          >
                            <XCircle className="w-4 h-4" /> Hủy Đơn Hàng
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Order items details */}
                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                      <div className="px-4 py-2 bg-slate-100/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Sản phẩm đã mua
                      </div>
                      <div className="divide-y divide-slate-50">
                        {order.ChiTietDonHangs?.map((item) => (
                          <div key={item.MaSP} className="p-4 flex items-center justify-between text-xs gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.SanPham?.AnhMinhHoa}
                                alt={item.SanPham?.TenSP}
                                className="w-10 h-10 object-cover rounded-lg border bg-slate-50"
                              />
                              <div>
                                <p className="font-bold text-slate-800">{item.SanPham?.TenSP}</p>
                                <p className="text-slate-400 text-[10px] mt-0.5">Đơn giá: {formatPrice(item.DongGia)}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-slate-400">x{item.SoLuong}</p>
                              <p className="font-semibold text-slate-700">{formatPrice(item.ThanhTien)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
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

export default OrderHistory;
