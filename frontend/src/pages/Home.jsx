import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  AlertCircle, 
  ShoppingCart, 
  ArrowRight, 
  Flame, 
  Clock, 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  CheckCircle,
  X,
  Zap,
  Sparkles,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

const HERO_BANNERS = [
  {
    id: 1,
    title: 'Samsung Galaxy S24 Ultra',
    subtitle: 'Galaxy AI Quyền Năng - Ưu đãi độc quyền NovaTech đến 5 triệu',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1000&auto=format&fit=crop&q=80',
    link: '/?search=Samsung',
    tag: 'Galaxy AI'
  },
  {
    id: 2,
    title: 'iPhone 15 Pro Max',
    subtitle: 'Khung Titan Tự Nhiên - Trả góp 0% duyệt siêu nhanh',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
    link: '/?search=iPhone',
    tag: 'Apple Chính Hãng'
  },
  {
    id: 3,
    title: 'Laptop Gaming & Doanh Nhân',
    subtitle: 'Hiệu năng đỉnh cao - Giảm đến 4 triệu cho thành viên NovaTech',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1000&auto=format&fit=crop&q=80',
    link: '/?categoryId=2',
    tag: 'Laptop Giá Sốc'
  },
  {
    id: 4,
    title: 'Tai nghe & Phụ kiện cao cấp',
    subtitle: 'Âm thanh chân thực - Tặng thêm quà khi mua kèm máy',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
    link: '/?categoryId=3',
    tag: 'Phụ Kiện Hot'
  }
];

const BRANDS = [
  { name: 'Apple', logo: '' },
  { name: 'Samsung', logo: 'SAMSUNG' },
  { name: 'ASUS', logo: 'ASUS' },
  { name: 'Sony', logo: 'SONY' },
  { name: 'Xiaomi', logo: 'XIAOMI' },
  { name: 'OPPO', logo: 'OPPO' },
  { name: 'Marshall', logo: 'MARSHALL' }
];

const Home = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('categoryId') || '';
  const initialPriceRange = searchParams.get('priceRange') || '';
  const initialBrand = searchParams.get('brand') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [brandFilter, setBrandFilter] = useState(initialBrand);
  const [sortBy, setSortBy] = useState('popular');

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  const isFiltering = !!(searchVal || selectedCategory || priceRange || brandFilter);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSearchVal(initialSearch);
    setSelectedCategory(initialCategory);
    setPriceRange(initialPriceRange);
    setBrandFilter(initialBrand);
  }, [initialSearch, initialCategory, initialPriceRange, initialBrand]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`/?${params.toString()}`);
  };

  const handleBrandClick = (brandName) => {
    const newVal = brandFilter === brandName ? '' : brandName;
    updateFilter('brand', newVal);
  };

  const handlePriceClick = (rangeVal) => {
    const newVal = priceRange === rangeVal ? '' : rangeVal;
    updateFilter('priceRange', newVal);
  };

  const handleClearAllFilters = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchVal) queryParams.append('search', searchVal);
        if (selectedCategory) queryParams.append('categoryId', selectedCategory);

        if (priceRange === 'under5m') {
          queryParams.append('maxPrice', '5000000');
        } else if (priceRange === '5to15m') {
          queryParams.append('minPrice', '5000000');
          queryParams.append('maxPrice', '15000000');
        } else if (priceRange === '15to25m') {
          queryParams.append('minPrice', '15000000');
          queryParams.append('maxPrice', '25000000');
        } else if (priceRange === 'over25m') {
          queryParams.append('minPrice', '25000000');
        }

        queryParams.append('status', 'Đang bán');

        const res = await api.get(`/products?${queryParams.toString()}`);
        let data = res.data;

        if (brandFilter) {
          data = data.filter((p) =>
            (p.TenSP || '').toLowerCase().includes(brandFilter.toLowerCase())
          );
        }

        if (sortBy === 'priceAsc') {
          data.sort((a, b) => parseFloat(a.GiaBan) - parseFloat(b.GiaBan));
        } else if (sortBy === 'priceDesc') {
          data.sort((a, b) => parseFloat(b.GiaBan) - parseFloat(a.GiaBan));
        }

        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchVal, priceRange, brandFilter, sortBy]);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addToCart(product, 1);
    if (res.success) {
      setToast({ type: 'success', message: `Đã thêm "${product.TenSP}" vào giỏ hàng!` });
    } else {
      setToast({ type: 'error', message: res.message });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const parseSpecs = (specsStr) => {
    if (!specsStr) return [];
    try {
      const obj = typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
      return Object.entries(obj).slice(0, 3).map(([k, v]) => `${v}`);
    } catch {
      return [];
    }
  };

  const flashSaleProducts = products.slice(0, 5);
  const phoneProducts = products.filter((p) => p.MaDM === 1).slice(0, 5);
  const laptopProducts = products.filter((p) => p.MaDM === 2).slice(0, 5);
  const accessoryProducts = products.filter((p) => p.MaDM === 3 || p.MaDM === 4).slice(0, 5);

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
    <div className="w-full bg-[#f4f6fa] dark:bg-[#080d1a] min-h-screen pb-12 transition-colors">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3.5 space-y-4">
        
        {/* ================= 1. CELLPHONES-STYLE 3-COLUMN HERO SECTION ================= */}
        {!isFiltering && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
            
            {/* Column 1: Left Vertical Category Mega Menu (3 cols) */}
            <div className="hidden lg:flex lg:col-span-3 bg-white dark:bg-[#0f1a30] rounded-md border border-slate-200 dark:border-slate-800 shadow-sm p-2 flex-col justify-between text-xs">
              <div className="space-y-0.5">
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <SlidersHorizontal className="w-3 h-3 text-[#0284c7]" />
                  <span>Danh Mục Sản Phẩm</span>
                </div>

                <button
                  onClick={() => updateFilter('categoryId', '')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
                    !selectedCategory
                      ? 'bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-[#0284c7]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0284c7]" />
                    <span>Tất cả sản phẩm</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === String(cat.MaDM);
                  return (
                    <button
                      key={cat.MaDM}
                      onClick={() => updateFilter('categoryId', String(cat.MaDM))}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-[#0284c7]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(cat.TenDM)}
                        <span className="truncate">{cat.TenDM}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  );
                })}

                <button
                  onClick={() => handleBrandClick('Apple')}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-[#0284c7] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif"></span>
                    <span>Apple Chính Hãng</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <Link
                  to="/tracking"
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-[#0284c7] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-500" />
                    <span>Thu cũ đổi mới</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Bottom Member Banner in Sidebar */}
              <div className="mt-2 p-2 bg-gradient-to-r from-sky-500 to-[#0284c7] text-white rounded text-[11px] flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold leading-tight">NovaMember</p>
                  <p className="text-[9.5px] text-sky-100">Đăng ký nhận deal hời</p>
                </div>
                <Link to="/login" className="bg-white text-[#0284c7] px-2 py-0.5 rounded font-bold text-[10px]">
                  Vào ngay
                </Link>
              </div>
            </div>

            {/* Column 2: Center Main Carousel (6 cols) */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0f1a30] rounded-md overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 w-full overflow-hidden bg-slate-900 group">
                <img
                  src={HERO_BANNERS[activeBanner].image}
                  alt={HERO_BANNERS[activeBanner].title}
                  className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="inline-block self-start px-2 py-0.5 bg-[#0284c7] text-white font-bold text-[10px] rounded mb-1 uppercase shadow-sm">
                    {HERO_BANNERS[activeBanner].tag}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">{HERO_BANNERS[activeBanner].title}</h2>
                  <p className="text-xs text-sky-200 font-medium">{HERO_BANNERS[activeBanner].subtitle}</p>
                </div>
              </div>

              {/* Banner Tab bar (4 tabs) */}
              <div className="grid grid-cols-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1325] text-[11px] font-semibold text-center divide-x divide-slate-100 dark:divide-slate-800">
                {HERO_BANNERS.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBanner(idx)}
                    className={`py-2 px-1 transition-colors leading-tight cursor-pointer ${
                      activeBanner === idx
                        ? 'border-b-2 border-[#0284c7] font-bold text-[#0284c7] bg-sky-50/70 dark:bg-sky-950/50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="line-clamp-2">{b.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Right Side Promo Cards (3 cols) */}
            <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <div 
                onClick={() => navigate('/?brand=Apple')}
                className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-md p-3.5 text-white shadow-sm cursor-pointer hover:border-sky-500 border border-slate-700/60 transition-all flex flex-col justify-between min-h-[110px]"
              >
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded text-sky-300">
                    Độc quyền NovaTech
                  </span>
                  <h3 className="text-sm font-black mt-1.5">THU CŨ ĐỔI MỚI</h3>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Trợ giá lên đến 2.500.000đ khi lên đời máy tại NovaTech
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-sky-400 font-bold mt-2">
                  <span>Khám phá ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/?priceRange=under5m')}
                className="flex-1 bg-gradient-to-br from-[#0c2a4d] to-[#0284c7] rounded-md p-3.5 text-white shadow-sm cursor-pointer hover:border-sky-400 border border-sky-800/60 transition-all flex flex-col justify-between min-h-[110px]"
              >
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-white">
                    Ưu Đãi Học Sinh - SV
                  </span>
                  <h3 className="text-sm font-black mt-1.5">LAPTOP CHÍNH HÃNG</h3>
                  <p className="text-[11px] text-sky-100 mt-0.5 leading-snug">
                    Giảm thêm 500.000đ và tặng balo chống sốc cao cấp
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white font-bold mt-2">
                  <span>Xem danh sách</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/?brand=Samsung')}
                className="hidden xl:flex flex-1 bg-gradient-to-br from-blue-900 to-indigo-950 rounded-md p-3.5 text-white shadow-sm cursor-pointer hover:border-blue-400 border border-blue-800/60 transition-all flex flex-col justify-between min-h-[100px]"
              >
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                    Galaxy AI
                  </span>
                  <h3 className="text-sm font-black mt-1.5">SAMSUNG GALAXY</h3>
                  <p className="text-[11px] text-blue-200 mt-0.5 leading-snug">
                    Tặng gói bảo hành Samsung Care+ 1 năm miễn phí
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold mt-1.5">
                  <span>Nhận ưu đãi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= 2. BRAND QUICK FILTER CHIPS ================= */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
              Thương hiệu nổi bật:
            </span>
            {brandFilter && (
              <button
                onClick={() => handleBrandClick(brandFilter)}
                className="text-xs text-[#0284c7] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Xóa lọc ({brandFilter})</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {BRANDS.map((b) => {
              const isActive = brandFilter.toLowerCase() === b.name.toLowerCase();
              return (
                <button
                  key={b.name}
                  onClick={() => handleBrandClick(b.name)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'border-[#0284c7] bg-[#e0f2fe] text-[#0284c7] shadow-sm'
                      : 'border-slate-200 hover:border-[#38bdf8] text-slate-700 bg-[#f8fafc] hover:bg-white'
                  }`}
                >
                  <span>{b.logo}</span>
                  <span>{b.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= 3. PRICE QUICK FILTER ================= */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="font-bold text-slate-500 shrink-0">Chọn mức giá:</span>
          {[
            { id: 'under5m', label: 'Dưới 5 triệu' },
            { id: '5to15m', label: 'Từ 5 - 15 triệu' },
            { id: '15to25m', label: 'Từ 15 - 25 triệu' },
            { id: 'over25m', label: 'Trên 25 triệu' }
          ].map((r) => {
            const isSelected = priceRange === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handlePriceClick(r.id)}
                className={`px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#0284c7] bg-[#0284c7] text-white font-bold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {r.label}
              </button>
            );
          })}

          {isFiltering && (
            <button
              onClick={handleClearAllFilters}
              className="ml-auto px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs whitespace-nowrap transition-colors"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>

        {/* ================= 4. FLASH SALE SECTION (NOVATECH ELECTRIC BLUE) ================= */}
        {!isFiltering && flashSaleProducts.length > 0 && (
          <div className="rounded-xl overflow-hidden shadow-sm border border-sky-200 bg-white">
            
            {/* Flash Sale Banner Header */}
            <div className="nova-flash-header text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                  GIỜ VÀNG GIÁ SỐC
                </h2>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-sky-100">KẾT THÚC TRONG:</span>
                <span className="bg-slate-900 text-white px-2 py-1 rounded font-mono font-black text-sm">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-slate-900 text-white px-2 py-1 rounded font-mono font-black text-sm">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-slate-900 text-white px-2 py-1 rounded font-mono font-black text-sm">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Flash Sale Products Grid */}
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {flashSaleProducts.map((product) => {
                const giaGoc = product.GiaBan * 1.15;
                const specs = parseSpecs(product.ThongSo);

                return (
                  <div
                    key={`flash-${product.MaSP}`}
                    onClick={() => navigate(`/product/${product.MaSP}`)}
                    className="nova-card p-3 flex flex-col justify-between group cursor-pointer relative"
                  >
                    {/* Top tags */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="nova-tag-installment">Trả góp 0%</span>
                      <span className="nova-tag-discount">-15%</span>
                    </div>

                    {/* Image */}
                    <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-2 mb-2">
                      <img
                        src={product.AnhMinhHoa}
                        alt={product.TenSP}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Specs chips */}
                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {specs.map((s, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-sky-300 border border-transparent dark:border-slate-700/50 px-1.5 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Product Name */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#0284c7] transition-colors mb-2">
                      {product.TenSP}
                    </h3>

                    {/* Price & Deal Progress */}
                    <div className="mt-auto pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
                        <span className="text-[#0284c7] font-extrabold text-sm sm:text-base">
                          {formatPrice(product.GiaBan)}
                        </span>
                        <span className="text-slate-400 line-through text-[11px]">
                          {formatPrice(giaGoc)}
                        </span>
                      </div>

                      {/* Sold progress bar */}
                      <div className="w-full bg-sky-100 dark:bg-slate-800 rounded-full h-3.5 relative overflow-hidden mb-2 border border-transparent dark:border-slate-700/60">
                        <div 
                          className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] h-full rounded-full"
                          style={{ width: `${Math.min(95, 40 + (product.MaSP * 7) % 55)}%` }}
                        />
                        <span className="absolute inset-0 text-[9px] font-bold text-slate-800 dark:text-white flex items-center justify-center drop-shadow-sm">
                          ⚡ Đã bán {(product.MaSP * 11) % 40 + 10} suất
                        </span>
                      </div>

                      {/* Add to Cart quick button */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Thêm vào giỏ</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ================= 5. FILTER RESULTS MODE ================= */}
        {isFiltering ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Kết quả tìm kiếm ({products.length} sản phẩm)
                </h2>
                {searchVal && (
                  <p className="text-xs text-slate-500">Từ khóa: <strong className="text-slate-900">"{searchVal}"</strong></p>
                )}
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#f8fafc] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <option value="popular">Nổi bật nhất</option>
                  <option value="priceAsc">Giá thấp đến cao</option>
                  <option value="priceDesc">Giá cao đến thấp</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500 text-sm">
                <div className="w-8 h-8 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Đang tải dữ liệu sản phẩm...
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold">Không tìm thấy sản phẩm nào phù hợp.</p>
                <p className="text-xs mt-1">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
                <button
                  onClick={handleClearAllFilters}
                  className="mt-4 px-4 py-2 bg-[#0284c7] text-white font-bold text-xs rounded-lg hover:bg-[#0369a1] transition-colors"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.map((product) => renderProductCard(product))}
              </div>
            )}
          </div>
        ) : (
          /* ================= 6. CATEGORY SHOWCASE SECTIONS ================= */
          <div className="space-y-6">
            
            {/* Section: Điện thoại nổi bật */}
            {phoneProducts.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-[#0284c7] rounded-full" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                      ĐIỆN THOẠI NỔI BẬT NHẤT
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/?categoryId=1')}
                    className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-0.5"
                  >
                    <span>Xem tất cả ({phoneProducts.length}+)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {phoneProducts.map((p) => renderProductCard(p))}
                </div>
              </div>
            )}

            {/* Section: Laptop & Máy tính */}
            {laptopProducts.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-[#0ea5e9] rounded-full" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                      LAPTOP &amp; PC GIÁ TỐT
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/?categoryId=2')}
                    className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-0.5"
                  >
                    <span>Xem tất cả ({laptopProducts.length}+)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {laptopProducts.map((p) => renderProductCard(p))}
                </div>
              </div>
            )}

            {/* Section: Phụ kiện & Thiết bị thông minh */}
            {accessoryProducts.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-[#38bdf8] rounded-full" />
                    <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                      PHỤ KIỆN &amp; THIẾT BỊ THÔNG MINH
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/?categoryId=3')}
                    className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-0.5"
                  >
                    <span>Xem tất cả ({accessoryProducts.length}+)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {accessoryProducts.map((p) => renderProductCard(p))}
                </div>
              </div>
            )}

            {/* Section: Toàn bộ danh mục sản phẩm (Gợi ý hôm nay) */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-5 bg-slate-700 rounded-full" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                    GỢI Ý HÔM NAY CHO BẠN
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-semibold">{products.length} sản phẩm</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.slice(0, 15).map((p) => renderProductCard(p))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );

  // Reusable NovaTech Product Card Renderer
  function renderProductCard(product) {
    const giaGoc = product.GiaBan * 1.12;
    const specs = parseSpecs(product.ThongSo);

    return (
      <div
        key={product.MaSP}
        onClick={() => navigate(`/product/${product.MaSP}`)}
        className="nova-card p-3 flex flex-col justify-between group cursor-pointer relative"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="nova-tag-installment">Trả góp 0%</span>
          <span className="nova-tag-discount">-12%</span>
        </div>

        {/* Image Container */}
        <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-2 mb-2">
          <img
            src={product.AnhMinhHoa}
            alt={product.TenSP}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Specs Pills */}
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {specs.map((s, i) => (
              <span key={i} className="text-[10px] bg-[#f0f9ff] dark:bg-slate-800/80 text-[#0369a1] dark:text-sky-300 border border-transparent dark:border-slate-700/50 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Product Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#0284c7] transition-colors mb-2">
          {product.TenSP}
        </h3>

        {/* Pricing */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
            <span className="text-[#0284c7] font-extrabold text-sm sm:text-base">
              {formatPrice(product.GiaBan)}
            </span>
            <span className="text-slate-400 line-through text-[11px]">
              {formatPrice(giaGoc)}
            </span>
          </div>

          {/* Ratings & reviews */}
          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mb-2.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-slate-700 font-bold">4.8</span>
            <span className="text-slate-400">({(product.MaSP * 17) % 80 + 20})</span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={(e) => handleAddToCart(e, product)}
            className="w-full bg-[#f0f9ff] hover:bg-[#0284c7] dark:bg-slate-800/80 dark:hover:bg-[#0284c7] text-[#0284c7] hover:text-white dark:text-sky-300 dark:hover:text-white border border-[#bae6fd] hover:border-[#0284c7] dark:border-slate-700 font-bold text-xs py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Thêm giỏ hàng</span>
          </button>
        </div>
      </div>
    );
  }
};

export default Home;
