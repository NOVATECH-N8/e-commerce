import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, AlertTriangle, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [parsedSpecs, setParsedSpecs] = useState({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setActiveImage(res.data.AnhMinhHoa);
        
        // Parse specifications
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

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await addToCart(product, quantity);
    if (res.success) {
      setToast({ type: 'success', message: `Đã thêm ${quantity} sản phẩm '${product.TenSP}' vào giỏ hàng!` });
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
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin" />
        <p className="text-sm text-slate-500">Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm</h3>
        <p className="text-slate-500 text-sm mt-1">Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center p-4">
            <img
              src={activeImage}
              alt={product.TenSP}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>

          {/* Gallery Thumbnails */}
          {product.HinhAnhs && product.HinhAnhs.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveImage(product.AnhMinhHoa)}
                className={`w-20 h-20 bg-white rounded-xl border p-2 flex-shrink-0 transition-all ${
                  activeImage === product.AnhMinhHoa
                    ? 'border-primary-500 ring-2 ring-primary-100'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={product.AnhMinhHoa} alt="main thumbnail" className="w-full h-full object-contain" />
              </button>
              {product.HinhAnhs.map((img) => (
                <button
                  key={img.MaAnh}
                  onClick={() => setActiveImage(img.DuongDan)}
                  className={`w-20 h-20 bg-white rounded-xl border p-2 flex-shrink-0 transition-all ${
                    activeImage === img.DuongDan
                      ? 'border-primary-500 ring-2 ring-primary-100'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img.DuongDan} alt="gallery thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="space-y-6">
          <div>
            <span className="bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {product.DanhMuc?.TenDM || 'Thiết bị'}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800 mt-3 font-display">
              {product.TenSP}
            </h1>
            
            {/* Stock indicator */}
            <div className="flex items-center gap-2 mt-3 text-sm">
              {product.SoLuongTon > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Còn hàng (Tồn kho: {product.SoLuongTon})
                </span>
              ) : (
                <span className="text-rose-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Hết hàng / Ngừng bán
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-xs text-slate-400">Giá bán chính thức</p>
            <p className="text-3xl font-black text-primary-600 mt-1">
              {formatPrice(product.GiaBan)}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 font-display">Mô tả sản phẩm</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-light">
              {product.MoTa}
            </p>
          </div>

          {/* Add to Cart Actions */}
          <div className="flex items-end gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số lượng</label>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity - 1)}
                  disabled={product.SoLuongTon === 0}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-colors disabled:opacity-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  disabled={product.SoLuongTon === 0}
                  className="w-12 text-center text-sm font-semibold border-none outline-none text-slate-700 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity + 1)}
                  disabled={product.SoLuongTon === 0}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-50 font-bold transition-colors disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.SoLuongTon === 0}
              className={`flex-grow flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-xl shadow-lg transition-all ${
                product.SoLuongTon === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-200 hover:scale-[1.01]'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm Vào Giỏ Hàng
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center">
            <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
              <ShieldCheck className="w-5 h-5 text-primary-500" />
              <span className="text-[10px] font-bold text-slate-700">100% Chính hãng</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
              <Truck className="w-5 h-5 text-primary-500" />
              <span className="text-[10px] font-bold text-slate-700">Giao hàng siêu tốc</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
              <RefreshCw className="w-5 h-5 text-primary-500" />
              <span className="text-[10px] font-bold text-slate-700">1 đổi 1 trong 30 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Section */}
      {Object.keys(parsedSpecs).length > 0 && (
        <div className="mt-16 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-3xl">
          <h3 className="text-xl font-bold text-slate-800 mb-6 font-display">Thông số kỹ thuật</h3>
          <div className="divide-y divide-slate-100">
            {Object.entries(parsedSpecs).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 py-3.5 text-sm">
                <span className="col-span-1 text-slate-500 font-semibold">{key}</span>
                <span className="col-span-2 text-slate-800 font-light">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
