import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, Settings, ClipboardList, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [categories, setCategories] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch categories on mount for the hover sub-menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories in Navbar:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleCategoryClick = (catId) => {
    navigate(`/?categoryId=${catId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between transition-all">
      {/* Brand Logo - Nemo Style */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-slate-800 font-display flex items-center gap-1.5">
          <span className="text-2xl">🐠</span>
          <span className="text-primary-600 font-black">Nemo Tech</span>
        </span>
      </Link>

      {/* Center Nav Links - Vietnamese Menu */}
      <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Link to="/" className={`hover:text-primary-600 transition-colors py-2 ${location.pathname === '/' && !location.search ? 'text-primary-600 border-b-2 border-primary-500 pb-0.5' : ''}`}>
          Trang chủ
        </Link>
        
        {/* Hover Sub-menu for Categories */}
        <div className="relative group py-2">
          <button className="hover:text-primary-600 transition-colors cursor-pointer flex items-center gap-1">
            Danh mục
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          
          <div className="absolute left-0 mt-0 w-52 bg-white border border-slate-100 rounded-xl shadow-xl py-2 hidden group-hover:block animate-fade-in z-50">
            {categories.map((cat) => (
              <button
                key={cat.MaDM}
                onClick={() => handleCategoryClick(cat.MaDM)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-primary-600 transition-colors text-xs font-semibold"
              >
                {cat.TenDM}
              </button>
            ))}
            {categories.length === 0 && (
              <span className="block px-4 py-2 text-slate-400 text-xs italic">Không tìm thấy danh mục</span>
            )}
          </div>
        </div>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-48">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-full py-1.5 pl-3 pr-8 text-xs text-slate-700"
          />
          <button type="submit" className="absolute right-2.5 top-2 text-slate-400 hover:text-primary-600">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Tracking page shortcut */}
        <Link 
          to="/tracking" 
          className="text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-1"
          title="Tra cứu đơn hàng"
        >
          <ClipboardList className="w-4.5 h-4.5" />
        </Link>

        {/* Shopping Cart */}
        <Link to="/cart" className="relative p-2 text-slate-600 hover:text-primary-600 transition-all">
          <ShoppingCart className="w-5.5 h-5.5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[9px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>

        {/* User Account Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-slate-600 hover:text-primary-600 py-1"
            >
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs border border-primary-200 uppercase">
                {user.TenKH.substring(0, 1)}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-100 shadow-xl py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-50 text-xs">
                  <p className="text-slate-400">Tài khoản</p>
                  <p className="font-semibold text-slate-800 truncate">{user.TenKH}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hồ sơ cá nhân</span>
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Quản trị viên (/admin)</span>
                    </Link>
                    <Link
                      to="/cms"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-primary-600 hover:bg-primary-50 font-semibold transition-colors border-t border-slate-50"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-primary-500" />
                      <span>Hệ thống CMS (/cms)</span>
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-slate-50 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <Link
              to="/login"
              className="font-bold text-slate-600 hover:text-primary-600 px-3 py-1.5 rounded-full transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="font-bold text-white bg-primary-600 hover:bg-primary-700 px-4 py-1.5 rounded-full transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
