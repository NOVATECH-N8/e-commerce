import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, AlertCircle, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Cart = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const handleQtyChange = async (productId, newQty, productName) => {
    const res = await updateQuantity(productId, newQty);
    if (!res.success) {
      setToast({ type: 'error', message: res.message });
    }
  };

  const handleRemove = async (productId, productName) => {
    const res = await removeFromCart(productId);
    if (res.success) {
      setToast({ type: 'success', message: `Đã xóa '${productName}' khỏi giỏ hàng.` });
    } else {
      setToast({ type: 'error', message: res.message });
    }
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      setToast({ type: 'info', message: 'Vui lòng đăng nhập trước khi tiến hành thanh toán.' });
      setTimeout(() => {
        navigate('/login?redirect=checkout');
      }, 1500);
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    if (price < 1000) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 font-display">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-400 text-xs mt-2 max-w-xs mx-auto font-light">
          Xem lại các sản phẩm của bạn trước khi tiến sâu vào thanh toán đại dương. Hãy khám phá các thiết kế để lựa chọn sản phẩm phù hợp.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md shadow-primary-200 transition-transform hover:scale-105"
        >
          Khám phá bộ sưu tập
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 animate-fade-in">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Cart Heading */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 font-display">Giỏ hàng</h1>
        <p className="text-slate-400 text-xs mt-1 font-light">Xem lại các sản phẩm trong giỏ hàng của bạn trước khi thanh toán.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div 
              key={item.MaSP} 
              className="bg-white rounded-2xl border border-slate-150 p-6 flex gap-5 items-center relative hover:border-cyan-100 transition-colors"
            >
              {/* Product preview square */}
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center p-2">
                <img
                  src={item.AnhMinhHoa}
                  alt={item.TenSP}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Product details */}
              <div className="flex-grow flex flex-col justify-between h-24">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/product/${item.MaSP}`} className="font-bold text-slate-800 hover:text-primary-600 transition-colors text-sm font-display line-clamp-1">
                      {item.TenSP}
                    </Link>
                    <p className="text-slate-400 text-[10px] mt-0.5 font-light">
                      {item.TrangThai === 'Ngừng bán' ? 'Đã ngừng kinh doanh' : 'Thiết kế đại dương cao cấp'}
                    </p>
                  </div>
                  
                  {/* Delete icon button */}
                  <button
                    onClick={() => handleRemove(item.MaSP, item.TenSP)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {/* Counter buttons - Bottom Left inside card */}
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => handleQtyChange(item.MaSP, item.SoLuong - 1, item.TenSP)}
                      className="px-2.5 py-1 hover:bg-slate-50 text-slate-400 font-bold transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-slate-700 bg-white">{item.SoLuong}</span>
                    <button
                      onClick={() => handleQtyChange(item.MaSP, item.SoLuong + 1, item.TenSP)}
                      className="px-2.5 py-1 hover:bg-slate-50 text-slate-400 font-bold transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Pricing - Bottom Right inside card */}
                  <span className="font-extrabold text-slate-800 text-sm">
                    {formatPrice(item.GiaBan * item.SoLuong)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Summary panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 font-display">Tóm tắt đơn hàng</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Tạm tính ({cart.reduce((s, i) => s + i.SoLuong, 0)} sản phẩm)</span>
                <span className="text-slate-800 font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Phí giao hàng</span>
                <span className="text-primary-600 font-semibold">Miễn phí giao hàng</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium pb-4">
                <span>Thuế ước tính</span>
                <span className="text-slate-800 font-bold">$0.00</span>
              </div>
              
              <div className="border-t border-slate-100 pt-4 flex justify-between items-end">
                <span className="font-bold text-slate-800 text-sm">Tổng cộng</span>
                <span className="text-xl font-black text-slate-800 leading-none">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 text-xs shadow-md shadow-primary-200 cursor-pointer"
            >
              Tiến hành thanh toán ➔
            </button>

            <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Thanh toán an toàn cung cấp bởi Nemo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
