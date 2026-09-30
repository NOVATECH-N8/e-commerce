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
    subtitle: 'Galaxy AI Quyền Năng - Ưu đãi độc quyền CellphoneS đến 5 triệu',
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
    subtitle: 'Hiệu năng đỉnh cao - Giảm đến 4 triệu cho thành viên Smember',
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
    <div className="w-full bg-[#f4f6fa] min-h-screen pb-12">
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
            <div className="hidden lg:flex lg:col-span-3 bg-white rounded-md border border-slate-200 shadow-sm p-2 flex-col justify-between text-xs">
              <div className="space-y-0.5">
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 mb-1">
                  <SlidersHorizontal className="w-3 h-3 text-[#d70018]" />
                  <span>Danh Mục Sản Phẩm</span>
                </div>

                <button
                  onClick={() => updateFilter('categoryId', '')}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer ${
                    !selectedCategory
                      ? 'bg-red-50 text-[#d70018] font-bold border-l-2 border-[#d70018]'
                      : 'text-slate-700 hover:bg-red-50/60 hover:text-[#d70018]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#d70018]" />
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
                          ? 'bg-red-50 text-[#d70018] font-bold border-l-2 border-[#d70018]'
                          : 'text-slate-700 hover:bg-red-50/60 hover:text-[#d70018]'
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
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded text-left text-slate-700 hover:bg-red-50/60 hover:text-[#d70018] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif"></span>
                    <span>Apple Chính Hãng</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <Link
                  to="/tracking"
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded text-left text-slate-700 hover:bg-red-50/60 hover:text-[#d70018] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-500" />
                    <span>Thu cũ đổi mới</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Bottom Member Banner in Sidebar */}
              <div className="mt-2 p-2 bg-gradient-to-r from-red-600 to-[#d70018] text-white rounded text-[11px] flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold leading-tight">Smember VIP</p>
                  <p className="text-[9.5px] text-red-100">Đăng ký nhận deal hời</p>
                </div>
                <Link to="/login" className="bg-white text-[#d70018] px-2 py-0.5 rounded font-bold text-[10px]">
                  Vào ngay
                </Link>
              </div>
            </div>

            {/* Column 2: Center Main Carousel (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-md overflow-hidden shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 w-full overflow-hidden bg-slate-100 group">
                <img
                  src={HERO_BANNERS[activeBanner].image}
                  alt={HERO_BANNERS[activeBanner].title}
                  className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/25 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="inline-block self-start px-2 py-0.5 bg-[#d70018] text-white font-bold text-[10px] rounded mb-1 uppercase shadow-sm">
                    {HERO_BANNERS[activeBanner].tag}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black">{HERO_BANNERS[activeBanner].title}</h2>
                  <p className="text-xs text-red-200 font-medium">{HERO_BANNERS[activeBanner].subtitle}</p>
                </div>
              </div>

              {/* Banner Tab bar (4 tabs) */}
              <div className="grid grid-cols-4 border-t border-slate-200 bg-white text-[11px] font-semibold text-center divide-x divide-slate-100">
                {HERO_BANNERS.map((b, idx) => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBanner(idx)}
                    className={`py-2 px-1 transition-colors leading-tight cursor-pointer ${
                      activeBanner === idx
                        ? 'border-b-2 border-[#d70018] font-bold text-[#d70018] bg-red-50/70'
                        : 'text-slate-600 hover:text-[#d70018] hover:bg-slate-50'
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
                className="flex-1 bg-gradient-to-br from-red-50 via-white to-red-100/60 rounded-md p-3.5 text-slate-800 shadow-sm cursor-pointer hover:border-[#d70018] border border-red-200 transition-all flex flex-col justify-between min-h-[110px]"
              >
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider bg-red-100 text-[#d70018] px-1.5 py-0.5 rounded border border-red-200">
                    Độc quyền CellphoneS
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1.5">THU CŨ ĐỔI MỚI</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Trợ giá lên đến 2.500.000đ khi lên đời máy tại hệ thống
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#d70018] font-bold mt-2">
                  <span>Khám phá ngay</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div 
                onClick={() => navigate('/?priceRange=under5m')}
                className="flex-1 bg-gradient-to-br from-[#d70018] to-[#be0015] rounded-md p-3.5 text-white shadow-sm cursor-pointer hover:shadow-md border border-transparent transition-all flex flex-col justify-between min-h-[110px]"
              >
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-white">
                    Ưu Đãi Học Sinh - SV
                  </span>
                  <h3 className="text-sm font-black mt-1.5">LAPTOP CHÍNH HÃNG</h3>
                  <p className="text-[11px] text-red-100 mt-0.5 leading-snug">
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
                className="hidden xl:flex flex-1 bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-md p-3.5 text-slate-800 shadow-sm cursor-pointer hover:border-[#d70018] border border-amber-200 transition-all flex flex-col justify-between min-h-[100px]"
              >
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                    Galaxy AI
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1.5">SAMSUNG GALAXY</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Tặng gói bảo hành Samsung Care+ 1 năm miễn phí
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#d70018] font-bold mt-1.5">
                  <span>Nhận ưu đãi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= 2. BRAND QUICK FILTER CHIPS (TECH TABS) ================= */}
        <div className="bg-white rounded-md p-2.5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d70018]" />
              Thương hiệu nổi bật:
            </span>
            {brandFilter && (
              <button
                onClick={() => handleBrandClick(brandFilter)}
                className="text-xs text-[#d70018] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span>Xóa lọc ({brandFilter})</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {BRANDS.map((b) => {
              const isActive = brandFilter.toLowerCase() === b.name.toLowerCase();
              return (
                <button
                  key={b.name}
                  onClick={() => handleBrandClick(b.name)}
                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'border-[#d70018] bg-red-50 text-[#d70018] shadow-xs'
                      : 'border-slate-200 hover:border-[#d70018] text-slate-700 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <span className="font-mono text-slate-400">{b.logo}</span>
                  <span>{b.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= 3. PRICE QUICK FILTER ================= */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 text-xs">
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
                className={`px-3 py-1.5 rounded border font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#d70018] bg-[#d70018] text-white font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-[#d70018]'
                }`}
              >
                {r.label}
              </button>
            );
          })}

          {isFiltering && (
            <button
              onClick={handleClearAllFilters}
              className="ml-auto px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>

        {/* ================= 4. FLASH SALE SECTION (CELLPHONES STYLE) ================= */}
        {!isFiltering && flashSaleProducts.length > 0 && (
          <div className="rounded-md overflow-hidden shadow-sm border border-red-200 bg-white">
            
            {/* Flash Sale Banner Header */}
            <div className="nova-flash-header text-white px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white drop-shadow-sm">
                  GIỜ VÀNG GIÁ SỐC
                </h2>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-red-100 text-[11px]">KẾT THÚC TRONG:</span>
                <span className="bg-[#9b0010] text-white px-1.5 py-0.5 rounded-[2px] font-mono font-black text-xs border border-red-400/30">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-[#9b0010] text-white px-1.5 py-0.5 rounded-[2px] font-mono font-black text-xs border border-red-400/30">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-[#9b0010] text-white px-1.5 py-0.5 rounded-[2px] font-mono font-black text-xs border border-red-400/30">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Flash Sale Products Grid */}
            <div className="p-2.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {flashSaleProducts.map((product) => {
                const giaGoc = product.GiaBan * 1.15;
                const specs = parseSpecs(product.ThongSo);

                return (
                  <div
                    key={`flash-${product.MaSP}`}
                    onClick={() => navigate(`/product/${product.MaSP}`)}
                    className="nova-card p-2.5 flex flex-col justify-between group cursor-pointer relative"
                  >
                    {/* Top tags */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="nova-tag-installment">Trả góp 0%</span>
                      <span className="nova-tag-discount">-15%</span>
                    </div>

                    {/* Image */}
                    <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-2 mb-1.5 bg-white rounded-[2px]">
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
                          <span key={i} className="nova-spec-chip">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Product Name */}
                    <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 group-hover:text-[#d70018] transition-colors mb-1.5 leading-snug">
                      {product.TenSP}
                    </h3>

                    {/* Price & Deal Progress */}
                    <div className="mt-auto pt-1.5 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
                        <span className="text-[#d70018] font-black text-sm sm:text-base">
                          {formatPrice(product.GiaBan)}
                        </span>
                        <span className="text-slate-400 line-through text-[11px]">
                          {formatPrice(giaGoc)}
                        </span>
                      </div>

                      {/* Sold progress bar */}
                      <div className="w-full bg-slate-100 rounded-[2px] h-3.5 relative overflow-hidden mb-2 border border-slate-200">
                        <div 
                          className="bg-gradient-to-r from-[#d70018] to-amber-500 h-full rounded-[2px]"
                          style={{ width: `${Math.min(95, 40 + (product.MaSP * 7) % 55)}%` }}
                        />
                        <span className="absolute inset-0 text-[9px] font-bold text-slate-800 flex items-center justify-center drop-shadow-xs">
                          🔥 Đã bán {(product.MaSP * 11) % 40 + 10} suất
                        </span>
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="btn-retail-danger w-full text-xs py-1.5 rounded cursor-pointer"
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
          <div className="bg-white rounded-md p-3.5 shadow-sm border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-200">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
                  Kết quả tìm kiếm ({products.length} sản phẩm)
                </h2>
                {searchVal && (
                  <p className="text-xs text-slate-500 mt-0.5">Từ khóa: <strong className="text-slate-900">"{searchVal}"</strong></p>
                )}
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="popular">Nổi bật nhất</option>
                  <option value="priceAsc">Giá thấp đến cao</option>
                  <option value="priceDesc">Giá cao đến thấp</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500 text-sm">
                <div className="w-8 h-8 border-3 border-[#d70018] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Đang tải dữ liệu sản phẩm...
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-800">Không tìm thấy sản phẩm nào phù hợp.</p>
                <p className="text-xs mt-1 text-slate-400">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
                <button
                  onClick={handleClearAllFilters}
                  className="mt-4 px-4 py-2 bg-[#d70018] text-white font-bold text-xs rounded hover:bg-[#be0015] transition-colors cursor-pointer"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {products.map((product) => renderProductCard(product))}
              </div>
            )}
          </div>
        ) : (
          /* ================= 6. CATEGORY SHOWCASE SECTIONS ================= */
          <div className="space-y-4">
            
            {/* Section: Điện thoại nổi bật */}
            {phoneProducts.length > 0 && (
              <div className="bg-white rounded-md p-3.5 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#d70018] rounded-[1px]" />
                    <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                      ĐIỆN THOẠI NỔI BẬT NHẤT
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/?categoryId=1')}
                    className="text-xs font-bold text-[#d70018] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Xem tất cả ({phoneProducts.length}+)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {phoneProducts.map((p) => renderProductCard(p))}
                </div>
              </div>
            )}

            {/* Section: Laptop & Máy tính */}
            {laptopProducts.length > 0 && (
              <div className="bg-white rounded-md p-3.5 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#d70018] rounded-[1px]" />
                    <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                      LAPTOP &amp; PC GIÁ TỐT
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/?categoryId=2')}
                    className="text-xs font-bold text-[#d70018] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Xem tất cả ({laptopProducts.length}+)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {laptopProducts.map((p) => renderProductCard(p))}
                </div>
              </div>
            )}

            {/* Section: Phụ kiện & Thiết bị thông minh */}
            {accessoryProducts.length > 0 && (
              <div className="bg-white rounded-md p-3.5 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#d70018] rounded-[1px]" />
                    <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                      PHỤ KIỆN &amp; THIẾT BỊ THÔNG MINH
                    </h2>
                  </div>
                  <button
                    onClick={() => navigate('/?categoryId=3')}
                    className="text-xs font-bold text-[#d70018] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Xem tất cả ({accessoryProducts.length}+)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {accessoryProducts.map((p) => renderProductCard(p))}
                </div>
              </div>
            )}

            {/* Section: Toàn bộ danh mục sản phẩm (Gợi ý hôm nay) */}
            <div className="bg-white rounded-md p-3.5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#d70018] rounded-[1px]" />
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                    GỢI Ý HÔM NAY CHO BẠN
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{products.length} sản phẩm</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {products.slice(0, 15).map((p) => renderProductCard(p))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );

  // Reusable CellphoneS-Style Product Card Renderer
  function renderProductCard(product) {
    const giaGoc = product.GiaBan * 1.12;
    const specs = parseSpecs(product.ThongSo);

    return (
      <div
        key={product.MaSP}
        onClick={() => navigate(`/product/${product.MaSP}`)}
        className="nova-card p-2.5 flex flex-col justify-between group cursor-pointer relative"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="nova-tag-installment">Trả góp 0%</span>
          <span className="nova-tag-discount">-12%</span>
        </div>

        {/* Image Container */}
        <div className="w-full aspect-square overflow-hidden flex items-center justify-center p-2 mb-1.5 bg-white rounded-[2px]">
          <img
            src={product.AnhMinhHoa}
            alt={product.TenSP}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Specs Chips */}
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {specs.map((s, i) => (
              <span key={i} className="nova-spec-chip truncate max-w-[110px]">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Product Title */}
        <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 group-hover:text-[#d70018] transition-colors mb-1.5 leading-snug">
          {product.TenSP}
        </h3>

        {/* Pricing */}
        <div className="mt-auto pt-1.5 border-t border-slate-100">
          <div className="flex items-baseline gap-1.5 flex-wrap mb-0.5">
            <span className="text-[#d70018] font-black text-sm sm:text-base">
              {formatPrice(product.GiaBan)}
            </span>
            <span className="text-slate-400 line-through text-[11px]">
              {formatPrice(giaGoc)}
            </span>
          </div>

          {/* Member perk */}
          <div className="text-[10px] text-amber-600 font-semibold mb-1 truncate">
            🎁 Smember giảm thêm 1%
          </div>

          {/* Ratings & reviews */}
          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-slate-700 font-bold">4.8</span>
            <span className="text-slate-400">({(product.MaSP * 17) % 80 + 20})</span>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={(e) => handleAddToCart(e, product)}
            className="btn-retail-outline w-full text-xs py-1.5 rounded cursor-pointer"
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
