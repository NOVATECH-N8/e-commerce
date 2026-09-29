import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Search, 
  MapPin, 
  ClipboardList, 
  ChevronDown, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Headphones, 
  Watch, 
  Zap,
  Settings,
  LayoutDashboard,
  Sparkles,
  Sun,
  Moon,
  Menu,
  PhoneCall,
  Flame,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const PROVINCES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Nghệ An'
];

const HOT_KEYWORDS = [
  'iPhone 16',
  'Galaxy S24',
  'Laptop Gaming',
  'MacBook M3',
  'Tai nghe Sony'
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Hồ Chí Minh');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const locationModalRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchVal(params.get('search') || '');
  }, [location.search]);

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

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationModalRef.current && !locationModalRef.current.contains(event.target)) {
        setShowLocationModal(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleQuickKeyword = (kw) => {
    setSearchVal(kw);
    navigate(`/?search=${encodeURIComponent(kw)}`);
  };

  const handleCategorySelect = (catId) => {
    setShowCategoryMenu(false);
    if (catId) {
      navigate(`/?categoryId=${catId}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const getCategoryIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('thoại') || lower.includes('phone')) return <Smartphone className="w-4 h-4 text-sky-500" />;
    if (lower.includes('laptop') || lower.includes('pc') || lower.includes('máy tính')) return <Laptop className="w-4 h-4 text-blue-500" />;
    if (lower.includes('tablet') || lower.includes('ipad') || lower.includes('bảng')) return <Tablet className="w-4 h-4 text-indigo-500" />;
    if (lower.includes('phụ kiện') || lower.includes('tai nghe')) return <Headphones className="w-4 h-4 text-cyan-500" />;
    if (lower.includes('thông minh') || lower.includes('smartwatch')) return <Watch className="w-4 h-4 text-emerald-500" />;
    return <Zap className="w-4 h-4 text-amber-500" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      {/* 1. CellphoneS-Style Top Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 border-b border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Hệ thống bán lẻ công nghệ chính hãng toàn quốc
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              Hotline miễn phí: <strong className="text-white font-mono">1800.2097</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-medium">
            <Link to="/tracking" className="hover:text-white transition-colors">
              Tra cứu bảo hành &amp; đơn hàng
            </Link>
            <span className="text-slate-600">|</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Thu cũ đổi mới trợ giá 2.5 triệu
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400" />
              Ưu đãi NovaMember
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main High-Density Tech Retail Header */}
      <div className="bg-white dark:bg-[#0b1325] border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Brand Logo - NovaTech */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded bg-gradient-to-tr from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:brightness-110 transition-all">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white uppercase font-display">
                Nova<span className="text-[#0284c7]">Tech</span>
              </span>
              <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider hidden sm:block uppercase">
                Hệ Thống Bán Lẻ Công Nghệ
              </span>
            </div>
          </Link>

          {/* Category Trigger Button (CellphoneS Danh Mục) */}
          <div className="relative shrink-0 hidden md:block" ref={categoryMenuRef}>
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 px-2.5 py-2 rounded text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4 text-[#0284c7]" />
              <span>Danh mục</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Dropdown Menu */}
            {showCategoryMenu && (
              <div className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-[#0f1a30] text-slate-800 dark:text-slate-100 rounded-md shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-fade-in text-xs">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Tất cả ngành hàng
                </div>
                <button
                  onClick={() => handleCategorySelect('')}
                  className="w-full text-left px-3 py-2 hover:bg-sky-50 dark:hover:bg-slate-800/80 flex items-center gap-2 font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#0284c7]" />
                  <span>Tất cả sản phẩm</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.MaDM}
                    onClick={() => handleCategorySelect(cat.MaDM)}
                    className="w-full text-left px-3 py-2 hover:bg-sky-50 dark:hover:bg-slate-800/80 flex items-center gap-2 font-semibold transition-colors"
                  >
                    {getCategoryIcon(cat.TenDM)}
                    <span>{cat.TenDM}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location / Store Selector */}
          <div className="relative hidden xl:block shrink-0" ref={locationModalRef}>
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-xs px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0284c7]" />
              <div className="text-left leading-tight">
                <span className="text-[10px] text-slate-400 block font-normal">Xem giá tại</span>
                <span className="font-bold flex items-center gap-0.5 text-xs text-slate-800 dark:text-slate-100">
                  {selectedProvince}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </button>

            {showLocationModal && (
              <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-[#0f1a30] text-slate-800 dark:text-slate-100 rounded shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 animate-fade-in text-xs">
                <div className="px-3 py-1.5 font-bold border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  Chọn tỉnh, thành phố:
                </div>
                {PROVINCES.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedProvince(p);
                      setShowLocationModal(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors ${
                      selectedProvince === p ? 'font-bold text-[#0284c7] bg-sky-50 dark:bg-slate-800' : ''
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box with Hot Keywords (CellphoneS Style) */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-2 flex flex-col justify-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Bạn cần tìm gì hôm nay? (iPhone 16, Laptop AI...)"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#060b14] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-[13px] rounded py-1.5 sm:py-2 pl-3 pr-10 border border-slate-200 dark:border-slate-700 focus:border-[#0284c7] focus:bg-white dark:focus:bg-[#0a1224] transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#0284c7] hover:bg-[#0369a1] text-white p-1 rounded transition-colors"
                title="Tìm kiếm"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Hot Keyword Chips directly below search */}
            <div className="hidden lg:flex items-center gap-2 mt-1 text-[11px] text-slate-400 overflow-hidden whitespace-nowrap">
              <span className="font-semibold text-slate-400 shrink-0">Gợi ý:</span>
              {HOT_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleQuickKeyword(kw)}
                  className="text-slate-500 hover:text-[#0284c7] dark:text-slate-400 dark:hover:text-sky-300 transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Night Mode Toggle Button (Crisp rectangular 4px) */}
            <button
              id="night-mode-toggle"
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-300 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              title={isDark ? "Chuyển sang Chế độ ban ngày" : "Chuyển sang Chế độ ban đêm (Night Mode)"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Tra cứu đơn hàng */}
            <Link
              to="/tracking"
              className="hidden lg:flex flex-col items-center justify-center text-[11px] font-semibold px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#0284c7] rounded transition-colors leading-tight"
            >
              <ClipboardList className="w-4 h-4 mb-0.5 text-slate-500 dark:text-slate-400" />
              <span>Tra cứu</span>
              <span>đơn hàng</span>
            </Link>

            {/* Giỏ hàng (Square Red Counter Badge) */}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded font-bold text-xs transition-colors shadow-sm relative"
            >
              <div className="relative">
                <ShoppingCart className="w-4.5 h-4.5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-rose-600 text-white text-[9px] font-black h-4 min-w-4 px-1 rounded-[3px] flex items-center justify-center border border-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Giỏ hàng</span>
            </Link>

            {/* Tài khoản / NovaMember */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded font-semibold text-xs transition-colors text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-[2px] bg-[#0284c7] text-white flex items-center justify-center text-[10px] font-black uppercase">
                    {user.TenKH ? user.TenKH.substring(0, 1) : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left leading-none">
                    <span className="text-[10px] text-slate-400">NovaMember</span>
                    <span className="max-w-[85px] truncate font-bold">{user.TenKH}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded bg-white dark:bg-[#0f1a30] border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-fade-in text-slate-800 dark:text-slate-100">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <p className="text-slate-400 font-normal">Tài khoản thành viên:</p>
                      <p className="font-bold text-slate-900 dark:text-white truncate">{user.TenKH}</p>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-[2px] font-bold">
                        {user.VaiTro === 'Admin' ? 'Quản trị viên' : 'NovaMember VIP'}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Thông tin tài khoản</span>
                    </Link>

                    <Link
                      to="/tracking"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-200"
                    >
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                      <span>Lịch sử mua hàng</span>
                    </Link>

                    {isAdmin && (
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#0284c7] hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors font-bold"
                        >
                          <Settings className="w-4 h-4 text-[#0284c7]" />
                          <span>Quản trị viên (/admin)</span>
                        </Link>
                        <Link
                          to="/cms"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-sky-700 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors font-bold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-sky-600" />
                          <span>CMS Dashboard (/cms)</span>
                        </Link>
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left border-t border-slate-100 dark:border-slate-800 mt-1 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Link
                  to="/login"
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-3 py-1.5 sm:py-2 rounded transition-colors whitespace-nowrap shadow-sm text-xs"
                >
                  Đăng nhập
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
