import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Phone, Receipt, XCircle, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, Truck, CheckCircle2, Clock, Zap } from 'lucide-react';
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

  const handleCancelOrder = async (orderId) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}? Sản phẩm sẽ được hoàn trả lại kho.`)) {
      try {
        const res = await api.put(`/orders/${orderId}/cancel`);
        setToast({ type: 'success', message: res.data.message });
        
        if (user) {
          fetchUserOrders();
        } else {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ xử lý':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-[3px] font-bold text-xs flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Chờ xử lý</span>;
      case 'Đã xác nhận':
        return <span className="px-2 py-0.5 bg-red-50 text-[#d70018] border border-red-200 rounded-[3px] font-bold text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận</span>;
      case 'Đang giao':
        return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-[3px] font-bold text-xs flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Đang giao hàng</span>;
      case 'Đã giao':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-[3px] font-bold text-xs flex items-center gap-1">✔ Đã giao thành công</span>;
      case 'Đã hủy':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-[3px] font-bold text-xs flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Đã hủy</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-[3px] font-bold text-xs">{status}</span>;
    }
  };

  return (
    <div className="w-full bg-[#f4f6fa] min-h-screen py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        
        {/* Title Header */}
        <div className="bg-gradient-to-r from-[#d70018] to-[#be0015] text-white rounded-md p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 fill-white text-white" />
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Tra Cứu &amp; Theo Dõi Đơn Hàng CellphoneS
            </h1>
          </div>
          <p className="text-xs text-rose-100 font-medium">
            Kiểm tra trạng thái đơn hàng nhanh chóng qua số điện thoại hoặc mã đơn
          </p>
        </div>

        {/* Public Tracking Search Bar */}
        <div className="bg-white rounded-md p-4 shadow-sm border border-slate-200">
          <form onSubmit={handlePublicSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="Nhập số điện thoại mua hàng..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:border-[#d70018] outline-none"
              />
            </div>

            <div className="relative flex-1">
              <Receipt className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Hoặc nhập mã đơn hàng (VD: 1)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-[4px] border border-slate-300 focus:border-[#d70018] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#d70018] hover:bg-[#be0015] text-white font-bold text-xs uppercase tracking-wide rounded-[4px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Tra cứu</span>
            </button>
          </form>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>Danh sách đơn hàng ({orders.length})</span>
            {user && (
              <span className="text-slate-500 font-normal">Tài khoản: <strong>{user.TenKH}</strong></span>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-md p-12 text-center text-slate-500 border border-slate-200">
              <div className="w-8 h-8 border-4 border-[#d70018] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Đang tìm kiếm thông tin đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-md p-10 text-center text-slate-500 border border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">Chưa có đơn hàng nào hiển thị</p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy nhập số điện thoại hoặc mã đơn hàng ở thanh tìm kiếm phía trên.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrder === order.MaDonHang;

              return (
                <div key={order.MaDonHang} className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden text-xs">
                  
                  {/* Order Card Header */}
                  <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-[#f8fafc] border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">Đơn hàng #{order.MaDonHang}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          {new Date(order.NgayDatHang || order.ThoiGianDatHang).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">SĐT nhận: <strong>{order.SDTNhanHang}</strong></p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.TrangThai)}
                      <span className="font-black text-[#d70018] text-sm sm:text-base">
                        {formatPrice(order.TongTien)}
                      </span>
                    </div>
                  </div>

                  {/* Order Preview Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-slate-600">
                      <strong>Nơi nhận:</strong> {order.DiaChiGiaoHang}
                    </p>
                    {order.GhiChu && (
                      <p className="text-slate-500 text-[11px] italic bg-red-50/40 p-2 rounded-[4px] border border-red-200">
                        Ghi chú: {order.GhiChu}
                      </p>
                    )}

                    {/* Expand Details Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => toggleExpand(order.MaDonHang)}
                        className="text-[#d70018] hover:text-[#be0015] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Thu gọn sản phẩm' : `Xem chi tiết sản phẩm (${order.ChiTietDonHangs?.length || 0})`}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {order.TrangThai === 'Chờ xử lý' && (
                        <button
                          onClick={() => handleCancelOrder(order.MaDonHang)}
                          className="text-rose-600 hover:text-rose-800 font-bold border border-rose-200 hover:bg-rose-50 px-3 py-1 rounded-lg transition-colors"
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>

                    {/* Detailed item list when expanded */}
                    {isExpanded && order.ChiTietDonHangs && (
                      <div className="mt-3 pt-3 border-t border-slate-100 divide-y divide-slate-100">
                        {order.ChiTietDonHangs.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.SanPham?.AnhMinhHoa && (
                                <img
                                  src={item.SanPham.AnhMinhHoa}
                                  alt={item.SanPham?.TenSP}
                                  className="w-9 h-9 object-contain rounded border p-0.5 shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">
                                  {item.SanPham?.TenSP || `Sản phẩm #${item.MaSP}`}
                                </p>
                                <p className="text-slate-400 text-[10px]">
                                  Đơn giá: {formatPrice(item.DongGia)} × SL: {item.SoLuong}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 shrink-0">
                              {formatPrice(item.ThanhTien || item.DongGia * item.SoLuong)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default OrderHistory;
