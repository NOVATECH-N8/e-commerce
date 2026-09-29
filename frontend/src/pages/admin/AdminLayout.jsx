import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, FolderKanban, Receipt, Users, ArrowLeft, LogOut, ShieldAlert, Tag, MessageSquare } from 'lucide-react';

const AdminLayout = () => {
  const { user, loading, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const isCmsPrefix = location.pathname.startsWith('/cms');
  const prefix = isCmsPrefix ? '/cms' : '/admin';

  const sidebarLinks = [
    { label: 'Tổng quan', path: `${prefix}/dashboard`, icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Sản phẩm', path: `${prefix}/products`, icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Danh mục', path: `${prefix}/categories`, icon: <FolderKanban className="w-4 h-4" /> },
    { label: 'Đơn hàng', path: `${prefix}/orders`, icon: <Receipt className="w-4 h-4" /> },
    { label: 'Mã giảm giá', path: `${prefix}/vouchers`, icon: <Tag className="w-4 h-4" /> },
    { label: 'Đánh giá', path: `${prefix}/reviews`, icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Người dùng', path: `${prefix}/users`, icon: <Users className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
        <p className="text-sm text-slate-500">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Access denied screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 font-display">Truy cập bị từ chối</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Bạn không có quyền truy cập vào trang quản trị này. Trang này chỉ dành cho tài khoản có vai trò Quản trị viên (Admin).
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-primary-100 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 rounded-xl transition-all"
            >
              Đăng nhập tài khoản khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 border-r border-slate-800 flex-shrink-0">
        <div>
          {/* Header branding */}
          <div className="mb-8 border-b border-slate-800 pb-5">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-black text-white font-display">{isCmsPrefix ? 'NovaTech CMS' : 'NovaTech Admin'}</span>
            </Link>
            <div className="flex items-center gap-2 mt-3 bg-slate-800/50 p-2 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xs">
                {isCmsPrefix ? 'CMS' : 'AD'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{user.TenKH}</p>
                <p className="text-[9px] text-slate-400">{isCmsPrefix ? 'CMS Operator' : 'Quản trị viên'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Chức năng quản trị</p>
            {sidebarLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/10'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back and Logout Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2 mt-6 md:mt-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem trang bán hàng</span>
          </Link>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-7xl">
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 md:p-8 min-h-[80vh] animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
