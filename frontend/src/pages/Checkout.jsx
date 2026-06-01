import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck, ShieldCheck, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';

const Checkout = () => {
  const { cart, cartTotal, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  // Sync user details
  useEffect(() => {
    if (user) {
      setEmail(user.Email || '');
      setPhone(user.SDT || '');
      setFullName(user.TenKH || '');
    }
  }, [user]);

  // Prevent accessing checkout with empty cart
  useEffect(() => {
    if (cart.length === 0 && !successOrder) {
      navigate('/cart');
    }
  }, [cart, navigate, successOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !phone.trim() || !fullName.trim() || !address.trim() || !city.trim()) {
      setToast({ type: 'error', message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng.' });
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(phone.trim().replace(/[\s.-]/g, ''))) {
      setToast({ type: 'error', message: 'Số điện thoại không hợp lệ (yêu cầu 9 đến 11 số).' });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDeliveryAddress = `${address.trim()}, ${city.trim()}${zipCode ? ` (Mã ZIP: ${zipCode.trim()})` : ''}`;
      
      const response = await api.post('/orders', {
        DiaChiGiaoHang: fullDeliveryAddress,
        SDTNhanHang: phone,
        GhiChu: `Họ tên: ${fullName} | Email: ${email}`
      });

      setSuccessOrder(response.data.order);
      setToast({ type: 'success', message: 'Đặt hàng thành công!' });
      await refreshCart();
    } catch (error) {
      console.error('Checkout error:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    if (price < 1000) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (successOrder) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-fade-in flex flex-col items-center">
        <div className="w-16 h-16 bg-cyan-50 text-cyan-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 font-display">Đặt hàng thành công!</h2>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          Cảm ơn bạn đã mua hàng tại Nemo. Đơn hàng <span className="font-bold text-slate-800">#{successOrder.MaDonHang}</span> của bạn đang được xử lý.
        </p>

        <div className="w-full bg-slate-50 rounded-2xl p-5 border border-slate-100/50 my-6 text-left space-y-2 text-sm text-slate-600">
          <p><strong>Mã đơn hàng:</strong> #{successOrder.MaDonHang}</p>
          <p><strong>Số điện thoại:</strong> {successOrder.SDTNhanHang}</p>
          <p><strong>Địa chỉ giao hàng:</strong> {successOrder.DiaChiGiaoHang}</p>
          <p><strong>Tổng tiền:</strong> <span className="text-primary-600 font-bold">{formatPrice(successOrder.TongTien)}</span></p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Link
            to="/tracking"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            Theo dõi đơn hàng
          </Link>
          <Link
            to="/"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
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

      {/* Breadcrumb back */}
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-primary-600 font-semibold text-xs transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Quay lại giỏ hàng
      </Link>

      <h1 className="text-3xl font-extrabold text-slate-800 font-display">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: 3-step Billing Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Contact Information */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
              <span className="w-5.5 h-5.5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
              Thông tin liên hệ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ Email *</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại *</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại nhận hàng"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-155 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
              <span className="w-5.5 h-5.5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
              Địa chỉ giao hàng
            </h3>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ và tên người nhận *</label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl text-xs"
                  required
                />
              </div>

              {/* Street Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ nhà/đường *</label>
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl text-xs"
                  required
                />
              </div>

              {/* City & ZIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thành phố / Tỉnh thành *</label>
                  <input
                    type="text"
                    placeholder="Quận/huyện, tỉnh thành phố"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã bưu chính (ZIP Code)</label>
                  <input
                    type="text"
                    placeholder="Không bắt buộc"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Payment */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
              <span className="w-5.5 h-5.5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
              Phương thức thanh toán
            </h3>

            <div className="space-y-3">
              {/* COD only option card */}
              <div className="border-2 border-primary-500 rounded-xl p-4 bg-primary-50/10 flex items-start gap-3 text-xs">
                <input
                  type="radio"
                  checked={true}
                  readOnly
                  className="rounded-full border-primary-500 text-primary-600 focus:ring-primary-500 w-4 h-4 mt-0.5"
                />
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 font-display">
                    <Truck className="w-4 h-4 text-primary-600" />
                    Thanh toán khi nhận hàng (COD)
                  </span>
                  <p className="text-slate-500 text-[11px] font-light leading-relaxed">
                    Nhận hàng rồi mới thanh toán tiền mặt. Quý khách vui lòng kiểm tra sản phẩm trước khi thanh toán trực tiếp cho nhân viên giao hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Invoice Review Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 font-display">Tóm tắt đơn hàng</h3>

            {/* Badged item card grid */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.MaSP} className="flex gap-4 items-center justify-between">
                  <div className="flex gap-3 items-center truncate">
                    {/* Image with quantity badge overlapping top right */}
                    <div className="relative w-11 h-11 bg-slate-50 border border-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center p-1.5">
                      <img
                        src={item.AnhMinhHoa}
                        alt={item.TenSP}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white text-[9px] font-extrabold h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white">
                        {item.SoLuong}
                      </span>
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 text-xs truncate font-display">{item.TenSP}</p>
                      <p className="text-slate-400 text-[9px] truncate mt-0.5">Thiết kế cao cấp</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-700 text-xs">
                    {formatPrice(item.GiaBan * item.SoLuong)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Tạm tính</span>
                <span className="text-slate-800 font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-600 font-bold">Miễn phí</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium pb-4 border-b border-slate-100">
                <span>Thuế ước tính</span>
                <span className="text-slate-800 font-bold">$0.00</span>
              </div>
              
              <div className="flex justify-between items-end pt-2">
                <span className="font-bold text-slate-800 text-sm">Tổng cộng</span>
                <span className="text-lg font-black text-slate-800">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 text-xs shadow-md shadow-primary-200 cursor-pointer"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận mua hàng ➔'}
            </button>
            
            <div className="flex items-center gap-1.5 justify-center text-[9px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Đơn hàng của bạn sẽ được bảo mật và giao hàng nhanh chóng.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
