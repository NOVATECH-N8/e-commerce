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
    <div className="w-full bg-[#f4f8fc] min-h-screen py-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-4">
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-[#0284c7]">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/?categoryId=${product.MaDM}`} className="hover:text-[#0284c7]">
              {product.DanhMuc?.TenDM || 'Danh mục sản phẩm'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-none">
              {product.TenSP}
            </span>
          </div>

          <button 
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setToast({ type: 'success', message: 'Đã sao chép đường dẫn sản phẩm!' });
            }}
            className="flex items-center gap-1 text-slate-600 hover:text-[#0284c7] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>

        {/* Product Title & Ratings Header */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900">
              {product.TenSP}
            </h1>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{ratingStats?.averageRating || 5.0}</span>
                <span className="text-slate-400 font-normal">({ratingStats?.totalReviews ?? 0} đánh giá)</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="nova-tag-installment">Trả góp 0%</span>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            
            {/* Left Column: Image Gallery + Policy (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Main Image Box */}
              <div className="aspect-square bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-4 relative group">
                <img
                  src={activeImage}
                  alt={product.TenSP}
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 nova-tag-discount">-15%</span>
              </div>

              {/* Thumbnails Gallery */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setActiveImage(product.AnhMinhHoa)}
                  className={`w-16 h-16 bg-white rounded-lg border p-1 shrink-0 transition-all ${
                    activeImage === product.AnhMinhHoa
                      ? 'border-[#0284c7] ring-2 ring-sky-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={product.AnhMinhHoa} alt="main" className="w-full h-full object-contain" />
                </button>

                {product.HinhAnhs && product.HinhAnhs.map((img) => (
                  <button
                    key={img.MaAnh}
                    onClick={() => setActiveImage(img.DuongDan)}
                    className={`w-16 h-16 bg-white rounded-lg border p-1 shrink-0 transition-all ${
                      activeImage === img.DuongDan
                        ? 'border-[#0284c7] ring-2 ring-sky-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={img.DuongDan} alt="gallery" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>

              {/* NovaTech Warranty & Service Policy Box */}
              <div className="bg-[#f0f9ff] rounded-xl p-3.5 border border-[#bae6fd] text-xs space-y-2.5">
                <h4 className="font-bold text-[#0369a1] text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                  <span>Chính sách đặc quyền NovaCare</span>
                </h4>
                <div className="space-y-2 text-slate-600">
                  <p className="flex items-start gap-2">
                    <RefreshCw className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                    <span><strong>Lỗi 1 đổi 1 trong 30 ngày</strong> đầu tiên nếu có lỗi kỹ thuật từ nhà sản xuất.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Bảo hành chính hãng 12 tháng</strong> tại các trung tâm bảo hành ủy quyền.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                    <span><strong>Giao hàng siêu tốc NovaExpress</strong> trong vòng 2 giờ.</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing, Options & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Storage Variant Selectors */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Phiên bản bộ nhớ:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['128GB', '256GB', '512GB', '1TB'].map((storage) => (
                    <button
                      key={storage}
                      type="button"
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        selectedStorage === storage
                          ? 'border-[#0284c7] bg-[#e0f2fe] text-[#0284c7] shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Box */}
              <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-200">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-[#0284c7]">
                    {formatPrice(product.GiaBan)}
                  </span>
                  <span className="text-slate-400 line-through text-sm">
                    {formatPrice(giaGoc)}
                  </span>
                  <span className="nova-tag-discount">-15%</span>
                  <span className="nova-tag-installment">Trả góp 0%</span>
                </div>

                {/* Stock info */}
                <div className="mt-2 text-xs">
                  {product.SoLuongTon > 0 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Còn hàng (Sẵn sàng giao ngay tại kho NovaTech)
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Tạm thời hết hàng
                    </span>
                  )}
                </div>
              </div>

              {/* Exclusive Promotion Box */}
              <div className="rounded-xl border border-[#bae6fd] overflow-hidden bg-white">
                <div className="bg-[#0284c7] text-white px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase">
                  <Gift className="w-4 h-4 text-sky-200" />
                  <span>Ưu đãi đặc quyền NovaTech (Trị giá đến 1.500.000đ)</span>
                </div>
                <div className="p-3 text-xs space-y-2 text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Tặng voucher <strong>200.000đ</strong> khi mua kèm phụ kiện sạc nhanh, tai nghe.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Giảm thêm <strong>500.000đ</strong> khi thanh toán qua ví VNPAY hoặc MoMo.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-[#0284c7] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Thu cũ đổi mới: Trợ giá thêm đến <strong>2.000.000đ</strong> khi lên đời máy mới.</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Số lượng:</span>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(quantity - 1)}
                    disabled={product.SoLuongTon === 0}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold transition-colors disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    disabled={product.SoLuongTon === 0}
                    className="w-12 text-center text-xs font-bold border-none outline-none text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(quantity + 1)}
                    disabled={product.SoLuongTon === 0}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold transition-colors disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                
                {/* Primary Button: MUA NGAY */}
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={product.SoLuongTon === 0}
                  className={`w-full py-3 px-4 rounded-xl font-black text-center transition-all cursor-pointer shadow-md ${
                    product.SoLuongTon === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sky-200'
                  }`}
                >
                  <div className="text-base uppercase tracking-wide">MUA NGAY</div>
                  <div className="text-[11px] font-normal text-sky-100">
                    (Giao tận nơi siêu tốc 2h hoặc nhận tại showroom NovaTech)
                  </div>
                </button>

                {/* Grid with Installment & Add to Cart */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={product.SoLuongTon === 0}
                    className="bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] font-bold py-2.5 px-3 rounded-xl text-center transition-colors shadow-sm cursor-pointer"
                  >
                    <div className="text-xs font-black uppercase">MUA TRẢ GÓP 0%</div>
                    <div className="text-[10px] text-slate-500 font-normal">Duyệt hồ sơ online 3 phút</div>
                  </button>

                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={product.SoLuongTon === 0}
                    className="bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-center transition-colors border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          <div className="lg:col-span-7 bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Thông số kỹ thuật {product.TenSP}
            </h3>
            
            {Object.keys(parsedSpecs).length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {Object.entries(parsedSpecs).map(([key, value], idx) => (
                  <div 
                    key={key} 
                    className={`grid grid-cols-3 py-2.5 px-2 ${
                      idx % 2 === 0 ? 'bg-[#f8fafc]' : 'bg-white'
                    }`}
                  >
                    <span className="col-span-1 text-slate-500 font-bold">{key}</span>
                    <span className="col-span-2 text-slate-800 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Đang cập nhật bảng thông số kỹ thuật chi tiết.</p>
            )}
          </div>

          <div className="lg:col-span-5 bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
              Đặc điểm nổi bật
            </h3>
            <div className="text-xs text-slate-600 leading-relaxed space-y-2 font-normal">
              <p>{product.MoTa}</p>
              <div className="p-3 bg-[#f0f9ff] rounded-lg border border-[#bae6fd] text-[#0369a1] font-medium">
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
