import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DollarSign, ShoppingBag, Receipt, Users, TrendingUp, AlertTriangle, ArrowRight, Clock, CheckCircle, Ban } from 'lucide-react';
import api from '../../services/api';

const DashboardAdmin = () => {
  const location = useLocation();
  const isCms = location.pathname.startsWith('/cms');
  const pathPrefix = isCms ? '/cms' : '/admin';

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockCount: 0,
    pendingOrdersCount: 0,
    completedOrdersCount: 0,
    cancelledOrdersCount: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all products, admin orders, and admin users
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/products'),
          api.get('/admin/orders'),
          api.get('/admin/users')
        ]);

        const products = productsRes.data;
        const orders = ordersRes.data;
        const users = usersRes.data;

        // Calculate statistics
        const completedOrders = orders.filter(o => o.TrangThai === 'Đã giao');
        const pendingOrders = orders.filter(o => o.TrangThai === 'Chờ xử lý' || o.TrangThai === 'Đang giao' || o.TrangThai === 'Đã xác nhận');
        const cancelledOrders = orders.filter(o => o.TrangThai === 'Đã hủy');
        
        const revenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.TongTien || 0), 0);
        const lowStock = products.filter(p => p.SoLuongTon <= 5);
        const customersOnly = users.filter(u => u.VaiTro === 'Customer');

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: customersOnly.length,
          lowStockCount: lowStock.length,
          pendingOrdersCount: pendingOrders.length,
          completedOrdersCount: completedOrders.length,
          cancelledOrdersCount: cancelledOrders.length
        });

        // Set list details
        setRecentOrders(orders.slice(0, 5));
        setLowStockProducts(lowStock.slice(0, 5));

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
        <p className="text-sm text-slate-500 font-light">Đang tổng hợp số liệu thống kê...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Block */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-black text-slate-800 font-display">Bảng Điều Khiển</h2>
        <p className="text-slate-400 text-xs mt-1">Tổng quan hoạt động kinh doanh hệ thống Nemo Tech</p>
      </div>

      {/* Stats Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Revenue */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh thu (Đã giao)</span>
            <p className="text-xl font-black text-primary-600">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> Tăng trưởng ổn định
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-primary-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng đơn hàng</span>
            <p className="text-xl font-black text-slate-800">{stats.totalOrders} đơn</p>
            <p className="text-[10px] text-slate-400">
              <span className="font-semibold text-amber-600">{stats.pendingOrdersCount}</span> đơn đang xử lý
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Products */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sản phẩm hiện có</span>
            <p className="text-xl font-black text-slate-800">{stats.totalProducts} dòng</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              {stats.lowStockCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-rose-600 font-semibold">{stats.lowStockCount} sản phẩm sắp hết</span>
                </>
              ) : (
                'Tồn kho dồi dào'
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Customers */}
        <div className="bg-white border border-slate-150 p-6 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khách hàng</span>
            <p className="text-xl font-black text-slate-800">{stats.totalUsers} thành viên</p>
            <p className="text-[10px] text-slate-400">Tài khoản khách đăng ký</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Orders (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-500" />
              Đơn hàng vừa đặt
            </h3>
            <Link to={`${pathPrefix}/orders`} className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-2">
                  <th className="py-2">Mã ĐH</th>
                  <th className="py-2">Điện thoại</th>
                  <th className="py-2">Ngày đặt</th>
                  <th className="py-2 text-right">Tổng tiền</th>
                  <th className="py-2 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {recentOrders.map((order) => (
                  <tr key={order.MaDonHang} className="hover:bg-slate-50/50">
                    <td className="py-3 font-bold text-slate-800">#{order.MaDonHang}</td>
                    <td className="py-3 font-medium">{order.SDTNhanHang}</td>
                    <td className="py-3 font-light">{order.NgayDatHang}</td>
                    <td className="py-3 text-right font-bold text-primary-600">{formatPrice(order.TongTien)}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.TrangThai === 'Đã giao'
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.TrangThai === 'Đã hủy'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.TrangThai}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 italic">Chưa có đơn hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Out of stock / Low stock alert (1/3 width) */}
        <div className="lg:col-span-1 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Cảnh báo tồn kho
              </h3>
              <Link to={`${pathPrefix}/products`} className="text-xs font-bold text-slate-400 hover:text-primary-600">
                Nhập hàng
              </Link>
            </div>

            <div className="space-y-4 mt-4">
              {lowStockProducts.map((p) => (
                <div key={p.MaSP} className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={p.AnhMinhHoa}
                      alt={p.TenSP}
                      className="w-9 h-9 object-cover rounded-lg border bg-slate-50 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 text-xs truncate font-display">{p.TenSP}</p>
                      <p className="text-[10px] text-slate-400">{p.DanhMuc?.TenDM || 'Thiết bị'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    p.SoLuongTon === 0
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    Còn: {p.SoLuongTon}
                  </span>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-xs">
                  Tồn kho các mặt hàng hiện tại đều ở mức an toàn
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 font-light leading-relaxed mt-4">
            💡 <strong>Mẹo:</strong> Khuyến nghị nhập thêm hàng khi số lượng tồn kho chạm ngưỡng dưới 5 sản phẩm để đảm bảo hoạt động bán lẻ liên tục.
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardAdmin;
