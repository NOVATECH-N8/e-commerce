import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, AlertCircle, ShoppingCart, ArrowRight, Eye, ShieldCheck, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

const Home = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse search queries
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('categoryId') || '';
  const initialPriceRange = searchParams.get('priceRange') || '';
  const initialBrand = searchParams.get('brand') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Active states
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [brandFilter, setBrandFilter] = useState(initialBrand); // 'Apple', 'Samsung', 'Sony', 'Keychron', 'ASUS'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Checks if user is looking at a filter view or the root landing page
  const isCatalogMode = !!(searchVal || selectedCategory || priceRange || brandFilter);

  // Sync search state with URL parameter changes
  useEffect(() => {
    setSearchVal(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setPriceRange(initialPriceRange);
  }, [initialPriceRange]);

  useEffect(() => {
    setBrandFilter(initialBrand);
  }, [initialBrand]);

  // Reset all filters when URL path query parameters are cleared (e.g. clicking Logo/Home)
  useEffect(() => {
    if (location.search === '') {
      setSearchVal('');
      setSelectedCategory('');
      setPriceRange('');
      setBrandFilter('');
    }
  }, [location.search]);

  // Update query parameters in URL
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`/?${params.toString()}`);
  };

  const handleBrandChange = (brandVal) => {
    const newVal = brandFilter === brandVal ? '' : brandVal;
    updateFilter('brand', newVal);
  };

  const handlePriceChange = (priceVal) => {
    updateFilter('priceRange', priceVal);
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchVal) queryParams.append('search', searchVal);
        if (selectedCategory) queryParams.append('categoryId', selectedCategory);
        
        // Price limits in VND (matching our seeded tech products: 29M, 31M, 24M, 1.8M, etc.)
        if (priceRange === '100') {
          queryParams.append('maxPrice', '5000000'); // Under 5 Million
        } else if (priceRange === '300') {
          queryParams.append('minPrice', '5000000');
          queryParams.append('maxPrice', '20000000'); // 5M to 20M
        } else if (priceRange === '500') {
          queryParams.append('minPrice', '20000000'); // Over 20 Million
        }

        queryParams.append('status', 'Đang bán');

        const res = await api.get(`/products?${queryParams.toString()}`);
        
        // Filter by Brand in frontend
        let data = res.data;
        if (brandFilter) {
          data = data.filter(product => {
            const name = (product.TenSP || '').toLowerCase();
            return name.includes(brandFilter.toLowerCase());
          });
        }

        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchVal, priceRange, brandFilter]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/?categoryId=${categoryId}`);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchVal('');
    setPriceRange('');
    setBrandFilter('');
    navigate('/');
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    const res = await addToCart(product, 1);
    if (res.success) {
      setToast({ type: 'success', message: `Thêm thành công ${product.TenSP} vào giỏ.` });
    } else {
      setToast({ type: 'error', message: res.message });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="w-full">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {!isCatalogMode ? (
        /* ==================== LANDING MODE (Page 1) ==================== */
        <div className="animate-fade-in">
          {/* Hero Banner Section */}
          <div 
            className="w-full bg-cover bg-center py-20 px-6 flex items-center justify-center relative border-b border-cyan-100"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600")' 
            }}
          >
            <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply" />

            {/* Glass Container Card */}
            <div className="relative z-10 max-w-3xl w-full text-center glass-banner rounded-3xl p-10 md:p-14 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-cyan-100/50 border border-cyan-200/50 text-cyan-800 rounded-full text-xs font-semibold">
                <span className="text-[10px]">🔥</span> Siêu phẩm công nghệ
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight font-display">
                Thế Giới Công Nghệ <br />
                <span className="text-primary-600 font-black">Chính Hãng</span>
              </h1>

              <p className="text-slate-500 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Khám phá các dòng điện thoại thông minh, laptop cao cấp và phụ kiện công nghệ mới nhất với nhiều chính sách ưu đãi độc quyền.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => handleCategoryClick(1)} // open Phone category
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-full text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-primary-200"
                >
                  Mua ngay ➔
                </button>
                <button
                  onClick={() => setSearchVal(' ')} // triggers catalog mode
                  className="w-full sm:w-auto bg-white/70 hover:bg-white text-slate-700 font-semibold px-6 py-3 rounded-full border border-slate-200 text-xs transition-colors"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            </div>
          </div>

          {/* Categories Grid (Product Categories) */}
          <div className="max-w-7xl mx-auto px-6 py-16 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-800 font-display">Danh mục sản phẩm</h2>
                <p className="text-slate-400 text-xs mt-1">Các nhóm thiết bị công nghệ chính hãng hàng đầu</p>
              </div>
              <button 
                onClick={() => setSearchVal(' ')} 
                className="text-xs font-bold text-primary-600 hover:underline"
              >
                Xem tất cả danh mục
              </button>
            </div>

            {/* Custom 4-Grid Categories with high-quality tech illustration placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Phones */}
              <div 
                onClick={() => handleCategoryClick(1)}
                className="glass-card rounded-2xl overflow-hidden p-4 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-video bg-cyan-50/50 rounded-xl overflow-hidden mb-4 border border-cyan-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500"
                    alt="Phones"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Hot Sale</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1.5 font-display">Điện thoại & Tablet</h4>
                  <p className="text-slate-400 text-xs mt-1 font-light">iPhone 15 Pro, Galaxy S24 Ultra, iPad mới nhất.</p>
                </div>
              </div>

              {/* Card 2: Laptops */}
              <div 
                onClick={() => handleCategoryClick(2)}
                className="glass-card rounded-2xl overflow-hidden p-4 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-video bg-cyan-50/50 rounded-xl overflow-hidden mb-4 border border-cyan-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500"
                    alt="Laptops"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm font-display">Laptop & Máy tính</h4>
                  <p className="text-slate-400 text-xs mt-1 font-light">MacBook Air M2, Laptop Gaming Zephyrus G14.</p>
                </div>
              </div>

              {/* Card 3: Accessories */}
              <div 
                onClick={() => handleCategoryClick(3)}
                className="glass-card rounded-2xl overflow-hidden p-4 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-video bg-cyan-50/50 rounded-xl overflow-hidden mb-4 border border-cyan-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
                    alt="Accessories"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm font-display">Phụ kiện công nghệ</h4>
                  <p className="text-slate-400 text-xs mt-1 font-light">Tai nghe chống ồn Sony, Bàn phím cơ Keychron.</p>
                </div>
              </div>

              {/* Card 4: Smart Devices */}
              <div 
                onClick={() => handleCategoryClick(4)}
                className="glass-card rounded-2xl overflow-hidden p-4 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-video bg-cyan-50/50 rounded-xl overflow-hidden mb-4 border border-cyan-100 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500"
                    alt="Smartwatches"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm font-display">Thiết bị thông minh</h4>
                  <p className="text-slate-400 text-xs mt-1 font-light">Apple Watch S9, loa thông minh Marshall.</p>
                </div>
              </div>
            </div>
          </div>

          {/* New Products Section */}
          <div className="bg-slate-50 border-t border-b border-slate-100 py-16">
            <div className="max-w-7xl mx-auto px-6 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 font-display">Sản phẩm mới</h2>
                <p className="text-slate-400 text-xs mt-1">Trải nghiệm những siêu phẩm vừa có mặt tại cửa hàng</p>
              </div>

              {loading ? (
                <div className="text-center py-10 text-slate-400">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                  Đang tải danh sách thiết bị...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.slice(0, 8).map((product) => (
                    <Link
                      to={`/product/${product.MaSP}`}
                      key={product.MaSP}
                      className="bg-white rounded-2xl border border-slate-150 hover:border-cyan-100 p-4 transition-all hover:shadow-lg flex flex-col justify-between group overflow-hidden"
                    >
                      <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2">
                        <img
                          src={product.AnhMinhHoa}
                          alt={product.TenSP}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs font-display line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {product.TenSP}
                          </h4>
                          <p className="text-slate-400 text-[10px] line-clamp-1 mt-0.5 font-light">{product.MoTa}</p>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-50">
                          <span className="font-extrabold text-slate-850 text-sm">
                            {formatPrice(product.GiaBan)}
                          </span>
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.SoLuongTon === 0}
                            className="bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white rounded-full p-2 transition-colors cursor-pointer"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Three Trust Pillars */}
          <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold text-sm">
                🛡️
              </div>
              <h4 className="font-bold text-slate-800 text-sm font-display">Bảo hành chính hãng</h4>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                Cam kết 100% sản phẩm chính hãng, hỗ trợ bảo hành 1 đổi 1 trong vòng 30 ngày nếu phát sinh lỗi phần cứng từ NSX.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold text-sm">
                🚀
              </div>
              <h4 className="font-bold text-slate-800 text-sm font-display">Giao hàng siêu tốc</h4>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                Giao hàng nhanh hỏa tốc trong 2h đối với khu vực nội thành, hỗ trợ miễn phí vận chuyển trên toàn quốc.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold text-sm">
                📞
              </div>
              <h4 className="font-bold text-slate-800 text-sm font-display">Tư vấn kỹ thuật</h4>
              <p className="text-slate-400 text-xs font-light leading-relaxed">
                Đội ngũ chuyên viên tư vấn nhiệt tình, có trình độ chuyên môn cao sẵn sàng giải đáp và hướng dẫn sử dụng 24/7.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== CATALOG MODE (Page 2 & 3) ==================== */
        <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <Link to="/" className="hover:text-primary-600">Trang chủ</Link>
            <span>›</span>
            <span className="hover:text-primary-600">Danh mục</span>
            <span>›</span>
            <span className="text-primary-600">
              {categories.find(c => c.MaDM === parseInt(selectedCategory))?.TenDM || 'Tất cả sản phẩm'}
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 font-display">
              {categories.find(c => c.MaDM === parseInt(selectedCategory))?.TenDM || 'Thiết bị công nghệ'}
            </h1>
            <p className="text-slate-500 font-light text-sm max-w-xl mt-1.5 leading-relaxed">
              Khám phá danh sách các thiết bị di động thông minh, máy tính xách tay và linh kiện chính hãng tại siêu thị điện tử Nemo Tech.
            </p>
          </div>

          {/* Results count & Sort toolbar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
            <span className="text-slate-400 font-medium">Tìm thấy {products.length} kết quả</span>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              Sắp xếp
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Filter Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 font-display">
                    <SlidersHorizontal className="w-4.5 h-4.5 text-primary-500" />
                    Bộ lọc
                  </span>
                  <button onClick={handleClearFilters} className="text-xs text-rose-500 font-bold hover:underline">
                    Xóa tất cả
                  </button>
                </div>

                {/* Local Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Từ khóa</label>
                  <input
                    type="text"
                    value={searchVal === ' ' ? '' : searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Tìm tên thiết bị..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary-500 rounded-xl py-2 px-3 text-xs text-slate-700"
                  />
                </div>

                {/* Brand checkboxes */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thương hiệu</label>
                  <div className="space-y-2">
                    {[
                      { label: 'Apple', value: 'Apple' },
                      { label: 'Samsung', value: 'Samsung' },
                      { label: 'Sony', value: 'Sony' },
                      { label: 'Keychron', value: 'Keychron' },
                      { label: 'ASUS', value: 'ASUS' }
                    ].map((brand) => (
                      <label key={brand.value} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={brandFilter === brand.value}
                          onChange={() => handleBrandChange(brand.value)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Mức giá</span>
                    <span className="text-primary-600">
                      {priceRange === '100' ? 'Dưới 5tr' : priceRange === '300' ? '5tr - 20tr' : priceRange === '500' ? 'Trên 20tr' : 'Tất cả'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Tất cả giá', value: '' },
                      { label: 'Dưới 5 triệu', value: '100' },
                      { label: 'Từ 5 - 20 triệu', value: '300' },
                      { label: 'Trên 20 triệu', value: '500' }
                    ].map((pr) => (
                      <label key={pr.value} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="priceRangeRadio"
                          checked={priceRange === pr.value}
                          onChange={() => handlePriceChange(pr.value)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                        />
                        <span>{pr.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Product Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-20 text-slate-400">
                  <div className="w-10 h-10 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                  Đang tải danh sách thiết bị...
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                  <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
                  <h4 className="font-bold text-slate-800 font-display">Không tìm thấy thiết bị nào</h4>
                  <p className="text-xs text-slate-400 mt-1">Vui lòng điều chỉnh hoặc xóa bớt các bộ lọc để có thêm kết quả tìm kiếm.</p>
                  <button onClick={handleClearFilters} className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm">
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Link
                        to={`/product/${product.MaSP}`}
                        key={product.MaSP}
                        className="bg-white rounded-2xl border border-slate-100 hover:border-primary-100 hover:shadow-xl transition-all duration-300 group flex flex-col overflow-hidden p-4"
                      >
                        {/* Vector artwork area */}
                        <div className="relative aspect-square bg-slate-50 border border-slate-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center p-3">
                          <img
                            src={product.AnhMinhHoa}
                            alt={product.TenSP}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Text and actions */}
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary-600 transition-colors truncate font-display">
                              {product.TenSP}
                            </h4>
                            <p className="text-slate-400 text-[10px] font-light line-clamp-1 mt-0.5">
                              {product.MoTa}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                            <span className="font-black text-slate-800 text-base">
                              {formatPrice(product.GiaBan)}
                            </span>

                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={product.SoLuongTon === 0}
                              className={`rounded-full p-2.5 transition-all text-white flex items-center justify-center cursor-pointer ${
                                product.SoLuongTon === 0
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-primary-600 hover:bg-primary-700 hover:scale-105'
                              }`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Load more designs */}
                  <div className="text-center pt-4">
                    <button className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-2 rounded-full text-xs font-bold transition-colors">
                      Tải thêm thiết bị
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
