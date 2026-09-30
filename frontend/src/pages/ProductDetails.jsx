import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Star, 
  Gift, 
  MapPin, 
  CreditCard,
  ChevronRight,
  Share2,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import ProductReviews from '../components/ProductReviews';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedStorage, setSelectedStorage] = useState('256GB');
  const [toast, setToast] = useState(null);
  const [parsedSpecs, setParsedSpecs] = useState({});
  const [ratingStats, setRatingStats] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setActiveImage(res.data.AnhMinhHoa);
        
        if (res.data.ThongSo) {
          try {
            const parsed = typeof res.data.ThongSo === 'string' 
              ? JSON.parse(res.data.ThongSo) 
              : res.data.ThongSo;
            setParsedSpecs(parsed);
          } catch (e) {
            console.error('Failed to parse specs:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setToast({ type: 'error', message: 'Không thể tải chi tiết sản phẩm.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQtyChange = (val) => {
    const newQty = parseInt(val) || 1;
    if (newQty < 1) {
      setQuantity(1);
    } else if (product && newQty > product.SoLuongTon) {
      setQuantity(product.SoLuongTon);
      setToast({ type: 'warning', message: `Số lượng yêu cầu đã đạt tới giới hạn tồn kho (${product.SoLuongTon} sản phẩm).` });
    } else {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async (redirect = false) => {
    if (!product) return;
    const res = await addToCart(product, quantity);
    if (res.success) {
      if (redirect) {
        navigate('/cart');
      } else {
        setToast({ type: 'success', message: `Đã thêm ${quantity} sản phẩm vào giỏ hàng!` });
      }
    } else {
      setToast({ type: 'error', message: res.message });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#0284c7] border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm</h3>
        <p className="text-slate-500 text-sm mt-1">Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-[#0284c7] font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const giaGoc = product.GiaBan * 1.15;

  return (
    <div className="w-full bg-[#f4f6fa] dark:bg-[#080d1a] min-h-screen py-4 transition-colors">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-3.5">
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-[#0284c7] transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/?categoryId=${product.MaDM}`} className="hover:text-[#0284c7] transition-colors">
              {product.DanhMuc?.TenDM || 'Danh mục sản phẩm'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-white font-bold truncate max-w-[200px] sm:max-w-none">
              {product.TenSP}
            </span>
          </div>

          <button 
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setToast({ type: 'success', message: 'Đã sao chép đường dẫn sản phẩm!' });
            }}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#0284c7] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>

        {/* Product Title & Ratings Header */}
        <div className="bg-white dark:bg-[#0f1a30] rounded-md p-3.5 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {product.TenSP}
            </h1>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{ratingStats?.averageRating || 5.0}</span>
                <span className="text-slate-400 font-normal">({ratingStats?.totalReviews ?? 0} đánh giá)</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="nova-tag-installment">Trả góp 0%</span>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3.5">
            
            {/* Left Column: Image Gallery + Policy (5 cols) */}
            <div className="lg:col-span-5 space-y-3.5">
              
              {/* Main Image Box */}
              <div className="aspect-square bg-white dark:bg-[#0b1325] rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center p-4 relative group">
                <img
                  src={activeImage}
                  alt={product.TenSP}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 nova-tag-discount">-15%</span>
              </div>

              {/* Thumbnails Gallery */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setActiveImage(product.AnhMinhHoa)}
                  className={`w-14 h-14 bg-white dark:bg-[#0b1325] rounded border p-1 shrink-0 transition-all cursor-pointer ${
                    activeImage === product.AnhMinhHoa
                      ? 'border-[#0284c7] ring-2 ring-sky-300 dark:ring-sky-800'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <img src={product.AnhMinhHoa} alt="main" className="w-full h-full object-contain" />
                </button>

                {product.HinhAnhs && product.HinhAnhs.map((img) => (
                  <button
                    key={img.MaAnh}
                    onClick={() => setActiveImage(img.DuongDan)}
                    className={`w-14 h-14 bg-white dark:bg-[#0b1325] rounded border p-1 shrink-0 transition-all cursor-pointer ${
                      activeImage === img.DuongDan
                        ? 'border-[#0284c7] ring-2 ring-sky-300 dark:ring-sky-800'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <img src={img.DuongDan} alt="gallery" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>

              {/* NovaTech Warranty & Service Policy Box */}
              <div className="bg-sky-50/70 dark:bg-sky-950/40 rounded-md p-3 border border-sky-200 dark:border-sky-900/60 text-xs space-y-2">
                <h4 className="font-bold text-[#0284c7] dark:text-sky-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                  <span>Chính sách đặc quyền NovaCare</span>
                </h4>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                  <p className="flex items-start gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-[#0284c7] shrink-0 mt-0.5" />
                    <span><strong>Lỗi 1 đổi 1 trong 30 ngày</strong> nếu phát sinh lỗi phần cứng nhà sản xuất.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Bảo hành chính hãng 12 tháng</strong> tại các trung tâm bảo hành ủy quyền.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#0284c7] shrink-0 mt-0.5" />
                    <span><strong>Giao siêu tốc 2 giờ</strong> miễn phí cho đơn hàng từ 500.000đ.</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing, Options & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5">
              
              {/* Storage Variant Selectors */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Chọn phiên bản bộ nhớ:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['128GB', '256GB', '512GB', '1TB'].map((storage) => (
                    <button
                      key={storage}
                      type="button"
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-3 py-1.5 rounded border text-xs font-bold transition-all cursor-pointer ${
                        selectedStorage === storage
                          ? 'border-[#0284c7] bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b1325] text-slate-700 dark:text-slate-300 hover:border-[#0284c7]'
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Box */}
              <div className="bg-slate-50 dark:bg-[#0b1325] rounded-md p-3.5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#0284c7] dark:text-[#38bdf8]">
                    {formatPrice(product.GiaBan)}
                  </span>
                  <span className="text-slate-400 line-through text-xs sm:text-sm">
                    {formatPrice(giaGoc)}
                  </span>
                  <span className="nova-tag-discount">-15%</span>
                  <span className="nova-tag-installment">Trả góp 0%</span>
                </div>

                {/* Stock info */}
                <div className="mt-2 text-xs">
                  {product.SoLuongTon > 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Còn hàng (Sẵn sàng giao ngay tại kho NovaTech)
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" /> Tạm thời hết hàng
                    </span>
                  )}
                </div>
              </div>

              {/* Exclusive Promotion Box (CellphoneS Red Accent) */}
              <div className="rounded-md border border-rose-200 dark:border-rose-900/60 overflow-hidden bg-white dark:bg-[#0f1a30]">
                <div className="bg-rose-600 text-white px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
                  <Gift className="w-4 h-4 text-white" />
                  <span>Ưu đãi đặc quyền NovaTech (Trị giá đến 1.500.000đ)</span>
                </div>
                <div className="p-3 text-[11.5px] space-y-1.5 text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-[2px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Tặng voucher <strong>200.000đ</strong> khi mua kèm phụ kiện sạc nhanh hoặc tai nghe chính hãng.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-[2px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Giảm thêm <strong>500.000đ</strong> khi chuyển khoản qua Napas 24/7 hoặc VietQR.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-[2px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Thu cũ đổi mới: Trợ giá thêm đến <strong>2.000.000đ</strong> khi lên đời máy mới.</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Số lượng:</span>
                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0b1325] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(quantity - 1)}
                    disabled={product.SoLuongTon === 0}
                    className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    disabled={product.SoLuongTon === 0}
                    className="w-12 text-center text-xs font-bold border-none outline-none text-slate-800 dark:text-white bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(quantity + 1)}
                    disabled={product.SoLuongTon === 0}
                    className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons (Crisp & High-Impact) */}
              <div className="space-y-2 pt-1">
                
                {/* Primary Button: MUA NGAY */}
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={product.SoLuongTon === 0}
                  className={`w-full py-2.5 px-4 rounded font-black text-center transition-all cursor-pointer shadow-xs ${
                    product.SoLuongTon === 0
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-[#0284c7] hover:bg-[#0369a1] text-white'
                  }`}
                >
                  <div className="text-sm sm:text-base uppercase tracking-wider font-display">MUA NGAY</div>
                  <div className="text-[10.5px] font-normal text-sky-100">
                    (Giao tận nơi siêu tốc 2h hoặc nhận tại showroom NovaTech)
                  </div>
                </button>

                {/* Grid with Installment & Add to Cart */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={product.SoLuongTon === 0}
                    className="bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/80 text-[#0284c7] dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold py-2 px-3 rounded text-center transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-black uppercase">MUA TRẢ GÓP 0%</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Duyệt hồ sơ online 3 phút</div>
                  </button>

                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={product.SoLuongTon === 0}
                    className="bg-white dark:bg-[#0f1a30] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold py-2 px-3 rounded text-center transition-colors border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#0284c7]" />
                    <span className="text-xs font-black">THÊM VÀO GIỎ</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Technical Specifications & Description (Bottom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* Specs Table */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0f1a30] rounded-md p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2.5">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
              Thông số kỹ thuật {product.TenSP}
            </h3>
            
            {Object.keys(parsedSpecs).length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-hidden">
                {Object.entries(parsedSpecs).map(([key, value], idx) => (
                  <div 
                    key={key} 
                    className={`grid grid-cols-3 py-2 px-3 ${
                      idx % 2 === 0 ? 'bg-slate-50 dark:bg-[#0b1325]' : 'bg-white dark:bg-[#0f1a30]'
                    }`}
                  >
                    <span className="col-span-1 text-slate-500 dark:text-slate-400 font-bold">{key}</span>
                    <span className="col-span-2 text-slate-800 dark:text-slate-200 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Đang cập nhật bảng thông số kỹ thuật chi tiết.</p>
            )}
          </div>

          {/* Highlights Box */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0f1a30] rounded-md p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2.5">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2">
              Đặc điểm nổi bật
            </h3>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 font-normal">
              <p>{product.MoTa}</p>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded border border-sky-200 dark:border-sky-900 text-[#0284c7] dark:text-sky-300 font-medium text-[11.5px]">
                💡 Sản phẩm được cam kết chính hãng 100%, bảo hành chính hãng 12 tháng tại hệ thống NovaTech toàn quốc.
              </div>
            </div>
          </div>

        </div>

        {/* Customer Reviews Section */}
        <ProductReviews
          productId={product.MaSP}
          onRatingStatsUpdate={(stats) => setRatingStats(stats)}
        />

      </div>
    </div>
  );
};

export default ProductDetails;
