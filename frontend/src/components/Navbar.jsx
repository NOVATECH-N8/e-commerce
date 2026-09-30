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
  Menu,
  PhoneCall,
  Flame,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
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
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* 1. CellphoneS-Style Top Utility Bar */}
      <div className="bg-[#be0015] text-red-100 text-[11px] py-1 px-4 border-b border-red-800/40 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-white font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Hệ thống bán lẻ công nghệ chính hãng toàn quốc
            </span>
            <span className="text-red-300">|</span>
            <span className="flex items-center gap-1 text-red-100">
              <PhoneCall className="w-3 h-3 text-amber-300" />
              Hotline miễn phí: <strong className="text-white font-mono">1800.2097</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-red-100 font-medium">
            <Link to="/tracking" className="hover:text-white transition-colors">
              Tra cứu bảo hành &amp; đơn hàng
            </Link>
            <span className="text-red-300">|</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Thu cũ đổi mới trợ giá 2.5 triệu
            </span>
            <span className="text-red-300">|</span>
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-300" />
              Ưu đãi Smember
            </span>
          </div>
        </div>
      </div>

      {/* 2. CellphoneS Main Vibrant Red Header */}
      <div className="bg-[#d70018] text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Brand Logo - NovaTech (CellphoneS Style) */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded bg-white text-[#d70018] flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-all">
              <Zap className="w-5 h-5 fill-[#d70018] text-[#d70018]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-black text-lg sm:text-2xl tracking-tight text-white uppercase font-display">
                Nova<span className="text-amber-300">Tech</span>
              </span>
              <span className="text-[8.5px] font-bold text-red-100 tracking-wider hidden sm:block uppercase">
                Hệ Thống Bán Lẻ Công Nghệ
              </span>
            </div>
          </Link>

          {/* Category Trigger Button (CellphoneS Danh Mục) */}
          <div className="relative shrink-0 hidden md:block" ref={categoryMenuRef}>
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center gap-1.5 bg-black/15 hover:bg-black/25 text-white px-2.5 py-2 rounded text-xs font-bold border border-white/20 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4 text-white" />
              <span>Danh mục</span>
              <ChevronDown className={`w-3 h-3 text-red-200 transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Dropdown Menu */}
            {showCategoryMenu && (
              <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 rounded-md shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-fade-in text-xs">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Tất cả ngành hàng
                </div>
                <button
                  onClick={() => handleCategorySelect('')}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-slate-800 hover:text-[#d70018] flex items-center gap-2 font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#d70018]" />
                  <span>Tất cả sản phẩm</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.MaDM}
                    onClick={() => handleCategorySelect(cat.MaDM)}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-slate-800 hover:text-[#d70018] flex items-center gap-2 font-semibold transition-colors"
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
              className="flex items-center gap-1.5 bg-black/15 hover:bg-black/25 text-xs px-2.5 py-1.5 rounded border border-white/20 text-white transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <div className="text-left leading-tight">
                <span className="text-[10px] text-red-200 block font-normal">Xem giá tại</span>
                <span className="font-bold flex items-center gap-0.5 text-xs text-white">
                  {selectedProvince}
                  <ChevronDown className="w-3 h-3 text-red-200" />
                </span>
              </div>
            </button>

            {showLocationModal && (
              <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#111827] text-slate-800 dark:text-slate-100 rounded shadow-2xl border border-slate-200 dark:border-slate-800 py-1 z-50 animate-fade-in text-xs">
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
                    className={`w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors ${
                      selectedProvince === p ? 'font-bold text-[#d70018] bg-red-50 dark:bg-slate-800' : ''
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box with Hot Keywords (CellphoneS White Input) */}
          <div className="flex-1 max-w-xl mx-1 sm:mx-2 flex flex-col justify-center">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Bạn cần tìm gì hôm nay? (iPhone 16, Galaxy S24, Laptop AI...)"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-[13px] rounded py-1.5 sm:py-2 pl-3.5 pr-10 border-0 focus:ring-2 focus:ring-amber-300 outline-none shadow-sm transition-all font-medium"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#d70018] hover:bg-[#be0015] text-white p-1.5 rounded transition-colors"
                title="Tìm kiếm"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Hot Keyword Chips directly below search */}
            <div className="hidden lg:flex items-center gap-2 mt-1 text-[11px] text-red-100 overflow-hidden whitespace-nowrap">
              <span className="font-semibold text-red-200 shrink-0">Gợi ý:</span>
              {HOT_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleQuickKeyword(kw)}
                  className="text-white hover:text-amber-300 underline-offset-2 hover:underline transition-colors cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Tra cứu đơn hàng */}
            <Link
              to="/tracking"
              className="hidden lg:flex flex-col items-center justify-center text-[11px] font-semibold px-2 py-1 bg-black/15 hover:bg-black/25 text-white rounded border border-white/20 transition-colors leading-tight"
            >
              <ClipboardList className="w-4 h-4 mb-0.5 text-white" />
              <span>Tra cứu</span>
              <span>đơn hàng</span>
            </Link>

            {/* Giỏ hàng (CellphoneS White/Amber Counter Badge) */}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded font-bold text-xs border border-white/25 transition-colors shadow-sm relative"
            >
              <div className="relative">
                <ShoppingCart className="w-4.5 h-4.5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-900 text-[9px] font-black h-4 min-w-4 px-1 rounded-[3px] flex items-center justify-center border border-white shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Giỏ hàng</span>
            </Link>

            {/* Tài khoản / Smember */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 bg-black/15 hover:bg-black/25 px-2.5 py-1.5 rounded font-semibold text-xs transition-colors text-white border border-white/20 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-[2px] bg-white text-[#d70018] flex items-center justify-center text-[10px] font-black uppercase">
                    {user.TenKH ? user.TenKH.substring(0, 1) : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left leading-none">
                    <span className="text-[10px] text-red-200">Smember</span>
                    <span className="max-w-[85px] truncate font-bold text-white">{user.TenKH}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-red-200" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 animate-fade-in text-slate-800 dark:text-slate-100">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <p className="text-slate-400 font-normal">Tài khoản thành viên:</p>
                      <p className="font-bold text-slate-900 dark:text-white truncate">{user.TenKH}</p>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-red-100 dark:bg-red-950 text-[#d70018] dark:text-red-300 rounded-[2px] font-bold">
                        {user.VaiTro === 'Admin' ? 'Quản trị viên' : 'Smember VIP'}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-slate-800 hover:text-[#d70018] transition-colors font-medium text-slate-700 dark:text-slate-200"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Thông tin tài khoản</span>
                    </Link>

                    <Link
                      to="/tracking"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-slate-800 hover:text-[#d70018] transition-colors font-medium text-slate-700 dark:text-slate-200"
                    >
                      <ClipboardList className="w-4 h-4 text-slate-400" />
                      <span>Lịch sử mua hàng</span>
                    </Link>

                    {isAdmin && (
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#d70018] hover:bg-red-50 dark:hover:bg-slate-800 transition-colors font-bold"
                        >
                          <Settings className="w-4 h-4 text-[#d70018]" />
                          <span>Quản trị viên (/admin)</span>
                        </Link>
                        <Link
                          to="/cms"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-700 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors font-bold"
                        >
                          <LayoutDashboard className="w-4 h-4 text-red-600" />
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
                  className="bg-white hover:bg-red-50 text-[#d70018] px-3 py-1.5 sm:py-2 rounded transition-colors whitespace-nowrap shadow-sm text-xs font-extrabold"
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
