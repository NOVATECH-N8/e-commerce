import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, AlertCircle, ArrowLeft, ShieldCheck, Truck, Tag, CheckCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';

const Cart = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [voucher, setVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  useEffect(() => {
    // Load public vouchers for quick select
    api.get('/vouchers')
      .then(res => setAvailableVouchers(res.data || []))
      .catch(err => console.error('Fetch vouchers err:', err));
  }, []);

  const handleQtyChange = async (productId, newQty, productName) => {
    const res = await updateQuantity(productId, newQty);
    if (!res.success) {
      setToast({ type: 'error', message: res.message });
    }
  };

  const handleRemove = async (productId, productName) => {
    const res = await removeFromCart(productId);
    if (res.success) {
      setToast({ type: 'success', message: `Đã xóa sản phẩm khỏi giỏ hàng.` });
    } else {
      setToast({ type: 'error', message: res.message });
    }
  };

  const handleApplyVoucher = async (e, codeToApply = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = (codeToApply || voucher).trim().toUpperCase();
    if (!code) {
      setToast({ type: 'error', message: 'Vui lòng nhập mã ưu đãi.' });
      return;
    }

    setLoadingVoucher(true);
    try {
      const res = await api.post('/vouchers/apply', {
        code,
        orderTotal: cartTotal
      });

      if (res.data.valid) {
        setAppliedVoucher(res.data);
        setVoucher(code);
        setToast({ type: 'success', message: res.data.message });
      }
    } catch (err) {
      console.error('Apply voucher error:', err);
      setAppliedVoucher(null);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Mã ưu đãi không hợp lệ hoặc chưa đủ điều kiện.'
      });
    } finally {
      setLoadingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucher('');
    setToast({ type: 'info', message: 'Đã hủy áp dụng mã giảm giá.' });
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      setToast({ type: 'info', message: 'Vui lòng đăng nhập để hoàn tất thông tin đơn hàng.' });
      setTimeout(() => {
        navigate('/login?redirect=checkout');
      }, 1200);
    } else {
      navigate('/checkout', {
        state: {
          voucherCode: appliedVoucher ? appliedVoucher.voucher.MaCode : null,
          discountAmount: appliedVoucher ? appliedVoucher.discountAmount : 0
        }
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-sky-50 text-[#0284c7] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#bae6fd]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
          Hãy khám phá hàng ngàn thiết bị công nghệ chính hãng với ưu đãi đặc quyền tại NovaTech.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold px-6 py-2.5 rounded-lg text-xs shadow-sm transition-transform hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" /> Về trang chủ mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f4f8fc] min-h-screen py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200 pb-3">
          <Link to="/" className="text-[#0284c7] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Mua thêm sản phẩm khác
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[#0284c7] font-black">1. Giỏ hàng</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-500">2. Điền thông tin đặt hàng</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-500">3. Hoàn tất</span>
          </div>
        </div>

        {/* Free Shipping Notification Banner */}
        <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-center gap-2.5 text-xs text-[#0369a1] font-medium">
          <Truck className="w-4 h-4 text-[#0284c7] shrink-0" />
          <span>Đơn hàng của bạn được áp dụng chính sách <strong>Miễn phí giao hàng nhanh NovaExpress trong 2 giờ</strong>!</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Items list (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.MaSP} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                  
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-[#f8fafc] border border-slate-100 rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                    <img
                      src={item.AnhMinhHoa}
                      alt={item.TenSP}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link 
                        to={`/product/${item.MaSP}`}
                        className="text-xs sm:text-sm font-bold text-slate-800 hover:text-[#0284c7] line-clamp-2"
                      >
                        {item.TenSP}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.MaSP, item.TenSP)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Xóa khỏi giỏ hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-[#0284c7] font-extrabold text-sm sm:text-base">
                        {formatPrice(item.GiaBan)}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[11px] text-slate-500 font-medium">Số lượng:</span>
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.MaSP, item.SoLuong - 1, item.TenSP)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.SoLuong}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.MaSP, item.SoLuong + 1, item.TenSP)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Voucher form & Available Vouchers List */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 text-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                  <Tag className="w-3.5 h-3.5 text-[#0284c7]" /> Mã giảm giá:
                </span>
                <form onSubmit={(e) => handleApplyVoucher(e)} className="flex flex-1 max-w-sm gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã (VD: NOVATECH50)"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 font-mono uppercase focus:ring-1 focus:ring-[#0284c7] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loadingVoucher}
                    className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loadingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                  </button>
                </form>
              </div>

              {/* Applied Voucher Pill */}
              {appliedVoucher && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">{appliedVoucher.voucher.MaCode}: Giảm {formatPrice(appliedVoucher.discountAmount)}</p>
                      <p className="text-[10px] text-emerald-600">{appliedVoucher.voucher.MoTa}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="p-1 hover:bg-emerald-100 rounded text-emerald-700 transition-colors"
                    title="Hủy mã này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Quick Suggestion Chips */}
              {availableVouchers.length > 0 && !appliedVoucher && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <p className="text-[11px] text-slate-500 font-medium">Mã ưu đãi có thể dùng:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableVouchers.map((v) => (
                      <button
                        key={v.MaVoucher}
                        type="button"
                        onClick={() => handleApplyVoucher(null, v.MaCode)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{v.MaCode}</span>
                        <span className="font-normal text-slate-500 text-[10px]">
                          ({v.LoaiGiam === 'PHAN_TRAM' ? `-${v.GiaTriGiam}%` : `-${formatPrice(v.GiaTriGiam)}`})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary Box */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-bold text-slate-800">{formatPrice(cartTotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Vận chuyển NovaExpress:</span>
                  <span className="font-bold text-emerald-600">MIỄN PHÍ</span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-[#0284c7] font-bold">
                    <span>Ưu đãi ({appliedVoucher.voucher.MaCode}):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">Cần thanh toán:</span>
                <span className="text-xl font-black text-[#0284c7]">{formatPrice(finalTotal)}</span>
              </div>

              <button
                onClick={handleCheckoutRedirect}
                className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-black py-3 rounded-xl text-sm uppercase tracking-wide transition-all shadow-md shadow-sky-100 cursor-pointer block text-center"
              >
                TIẾN HÀNH ĐẶT HÀNG
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                (Được kiểm tra hàng trước khi thanh toán)
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <p className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-[#0284c7]" />
                Cam kết tại NovaTech:
              </p>
              <p>✔ 100% hàng chính hãng, nguyên seal mới</p>
              <p>✔ Hỗ trợ đổi trả miễn phí trong 30 ngày nếu lỗi NSX</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
