import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Truck, ShieldCheck, CheckCircle, MapPin, Store, CreditCard, QrCode, Copy, Check, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from '../components/Toast';

const Checkout = () => {
  const { cart, cartTotal, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const passedVoucherCode = location.state?.voucherCode || null;
  const passedDiscountAmount = location.state?.discountAmount || 0;

  const [deliveryType, setDeliveryType] = useState('home');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hồ Chí Minh');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);
  const [vietQrInfo, setVietQrInfo] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.Email || '');
      setPhone(user.SDT || '');
      setFullName(user.TenKH || '');
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !successOrder) {
      navigate('/cart');
    }
  }, [cart, navigate, successOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone.trim() || !fullName.trim()) {
      setToast({ type: 'error', message: 'Vui lòng cung cấp họ tên và số điện thoại người nhận.' });
      return;
    }

    if (deliveryType === 'home' && !address.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập địa chỉ giao hàng chi tiết.' });
      return;
    }

    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(phone.trim().replace(/[\s.-]/g, ''))) {
      setToast({ type: 'error', message: 'Số điện thoại không hợp lệ (yêu cầu từ 9 đến 11 số).' });
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDeliveryAddress = deliveryType === 'home'
        ? `${address.trim()}, ${city.trim()}`
        : `Nhận tại Showroom NovaTech (${city.trim()})`;

      const response = await api.post('/orders', {
        DiaChiGiaoHang: fullDeliveryAddress,
        SDTNhanHang: phone,
        GhiChu: `Họ tên: ${fullName} | Email: ${email || 'N/A'} | Hình thức: ${deliveryType === 'home' ? 'Giao tận nơi' : 'Nhận tại showroom'} | Ghi chú: ${note || 'Không có'}`,
        PhuongThucThanhToan: paymentMethod === 'online' ? 'VIETQR' : 'COD',
        voucherCode: passedVoucherCode || undefined
      });

      setSuccessOrder(response.data.order);
      if (response.data.vietQr) {
        setVietQrInfo(response.data.vietQr);
      }
      setToast({ type: 'success', message: 'Đặt hàng thành công!' });
      await refreshCart();
    } catch (error) {
      console.error('Checkout error:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const finalCheckoutTotal = Math.max(0, cartTotal - passedDiscountAmount);

  if (successOrder) {
    return (
      <div className="w-full bg-[#f4f6fa] dark:bg-slate-950 min-h-screen py-10 px-4 transition-colors">
        <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-md shadow-sm border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 dark:bg-slate-800 text-[#d70018] dark:text-rose-400 rounded-md flex items-center justify-center mx-auto border border-red-200 dark:border-slate-700">
            <CheckCircle className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase">Đặt hàng thành công!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Cảm ơn quý khách đã tin tưởng mua sắm tại <strong>NovaTech</strong>. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 15 phút.
          </p>

          <div className="bg-red-50/40 dark:bg-red-950/30 rounded-[4px] p-4 text-left text-xs space-y-2 border border-red-200 dark:border-red-900/60 text-slate-700 dark:text-slate-300">
            <p><strong>Mã đơn hàng:</strong> <span className="text-[#d70018] dark:text-rose-400 font-bold">#{successOrder.MaDonHang}</span></p>
            <p><strong>Người nhận:</strong> {fullName} ({successOrder.SDTNhanHang})</p>
            <p><strong>Nơi nhận hàng:</strong> {successOrder.DiaChiGiaoHang}</p>
            {successOrder.TienGiamGia > 0 && (
              <p><strong>Ưu đãi giảm giá:</strong> <span className="text-emerald-600 dark:text-emerald-400 font-bold">-{formatPrice(successOrder.TienGiamGia)}</span></p>
            )}
            <p><strong>Tổng tiền:</strong> <span className="text-[#d70018] dark:text-rose-400 font-black text-sm">{formatPrice(successOrder.TongTien)}</span></p>
            <p><strong>Hình thức:</strong> {successOrder.PhuongThucThanhToan === 'VIETQR' ? 'Chuyển khoản VietQR Napas 24/7' : 'Thanh toán khi nhận hàng (COD)'}</p>
          </div>

          {/* VietQR Payment Card if applicable */}
          {vietQrInfo && (
            <div className="bg-white dark:bg-slate-900 rounded-md p-4 text-left text-xs space-y-3 border-2 border-[#d70018] shadow-sm">
              <div className="flex items-center gap-2 text-[#d70018] dark:text-rose-400 font-bold text-sm uppercase border-b border-red-100 dark:border-slate-800 pb-2">
                <QrCode className="w-5 h-5" />
                <span>Mã QR Thanh Toán Tự Động</span>
              </div>

              <div className="text-center py-1">
                <img
                  src={vietQrInfo.qrUrl}
                  alt="VietQR Code"
                  className="w-48 h-48 mx-auto rounded-[4px] border border-slate-200 dark:border-slate-700 p-1 bg-white shadow-sm"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">Mở app Ngân hàng hoặc Ví MoMo/ZaloPay để quét</p>
              </div>

              <div className="bg-[#f8fafc] dark:bg-slate-800/60 rounded-[4px] p-3 space-y-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Ngân hàng thụ hưởng:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{vietQrInfo.bankId}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{vietQrInfo.accountNo}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(vietQrInfo.accountNo, 'acc')}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[2px] text-[#d70018] dark:text-rose-400 transition-colors"
                      title="Sao chép STK"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Chủ tài khoản:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{vietQrInfo.accountName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Số tiền:</span>
                  <span className="font-black text-[#d70018] dark:text-rose-400 text-sm">{formatPrice(vietQrInfo.amount)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#d70018] dark:text-rose-400 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded-[2px] border border-red-200 dark:border-red-800">
                      {vietQrInfo.memo}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(vietQrInfo.memo, 'memo')}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[2px] text-[#d70018] dark:text-rose-400 transition-colors"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-[4px] border border-amber-200 dark:border-amber-900">
                ⚠️ Quý khách vui lòng giữ nguyên nội dung chuyển khoản để hệ thống xác nhận thanh toán tự động.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              to="/tracking"
              className="flex-1 btn-retail-primary text-xs py-2.5"
            >
              Tra cứu đơn hàng
            </Link>
            <Link
              to="/"
              className="flex-1 btn-retail-outline text-xs py-2.5"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f4f6fa] dark:bg-slate-950 min-h-screen py-6 transition-colors">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-semibold border-b border-slate-200 dark:border-slate-800 pb-3">
          <Link to="/cart" className="text-[#d70018] dark:text-rose-400 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại giỏ hàng
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">1. Giỏ hàng</span>
            <span className="text-slate-400">→</span>
            <span className="text-[#d70018] dark:text-rose-400 font-bold">2. Điền thông tin đặt hàng</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-500 dark:text-slate-400">3. Hoàn tất</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Delivery & Customer details */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Delivery Type Option */}
            <div className="bg-white dark:bg-slate-900 rounded-md p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">1. Chọn hình thức nhận hàng</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('home')}
                  className={`p-2.5 rounded-[4px] border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    deliveryType === 'home'
                      ? 'border-[#d70018] bg-red-50 dark:bg-red-950/40 text-[#d70018] dark:text-rose-400 ring-1 ring-[#d70018]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Giao tận nơi siêu tốc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('store')}
                  className={`p-2.5 rounded-[4px] border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    deliveryType === 'store'
                      ? 'border-[#d70018] bg-red-50 dark:bg-red-950/40 text-[#d70018] dark:text-rose-400 ring-1 ring-[#d70018]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Nhận tại Showroom</span>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white dark:bg-slate-900 rounded-md p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">2. Thông tin người nhận</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:border-[#d70018] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Số điện thoại nhận hàng *</label>
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:border-[#d70018] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email nhận hóa đơn điện tử</label>
                <input
                  type="email"
                  placeholder="Ví dụ: email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-[4px] border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:border-[#d70018] outline-none"
                />
              </div>

              <div className="text-xs space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tỉnh / Thành phố *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs font-semibold focus:border-[#d70018] outline-none"
                  >
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                  </select>
                </div>

                {deliveryType === 'home' ? (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Địa chỉ cụ thể (Số nhà, tên đường, phường/xã) *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Tòa nhà NovaTech, Đường Lê Lợi, Quận 1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-2.5 rounded-[4px] border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:border-[#d70018] outline-none"
                      required
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-red-50/50 dark:bg-red-950/40 rounded-[4px] border border-red-200 dark:border-red-900 text-slate-800 dark:text-slate-200">
                    <p className="font-bold text-[#d70018] dark:text-rose-300">Địa chỉ Showroom NovaTech:</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Showroom NovaTech trung tâm tại {city}. Nhân viên tư vấn sẽ liên hệ để quý khách đến trải nghiệm và nhận máy.</p>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Ghi chú đơn hàng (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2.5 rounded-[4px] border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-xs focus:border-[#d70018] outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-slate-900 rounded-md p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-200">3. Phương thức thanh toán</h3>

              <div className="space-y-2 text-xs">
                <label className={`flex items-center gap-2.5 p-3 rounded-[4px] border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#d70018] bg-red-50/60 dark:bg-red-950/30 ring-1 ring-[#d70018]'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-[#d70018] accent-[#d70018]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Được kiểm tra máy và phụ kiện trước khi thanh toán</span>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-[4px] border cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-[#d70018] bg-red-50/60 dark:bg-red-950/30 ring-1 ring-[#d70018]'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="text-[#d70018] accent-[#d70018]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Chuyển khoản VietQR Napas 24/7 (Khuyên dùng)</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">Hỗ trợ quét nhanh qua mọi app ngân hàng & ví MoMo, VNPAY</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Review */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white dark:bg-slate-900 rounded-md p-4 shadow-sm border border-slate-200 dark:border-slate-800 text-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Đơn hàng ({cart.length} sản phẩm)
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.MaSP} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={item.AnhMinhHoa} alt={item.TenSP} className="w-10 h-10 object-contain rounded-[2px] border border-slate-200 dark:border-slate-700 p-0.5 shrink-0 bg-white dark:bg-slate-800" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.TenSP}</p>
                        <p className="text-slate-400 text-[10px]">SL: {item.SoLuong}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                      {formatPrice(item.GiaBan * item.SoLuong)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vận chuyển:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">MIỄN PHÍ</span>
                </div>
                {passedDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Mã ưu đãi ({passedVoucherCode}):</span>
                    <span>-{formatPrice(passedDiscountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#d70018] dark:text-rose-400">{formatPrice(finalCheckoutTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#d70018] hover:bg-[#be0015] text-white font-black py-3 rounded-[4px] text-sm uppercase tracking-wide transition-all shadow-sm cursor-pointer block text-center disabled:opacity-60 active:scale-[0.99]"
              >
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 text-center pt-1">
                <p>Nhân viên NovaTech sẽ gọi xác nhận trong vòng 15 phút.</p>
                <p className="text-slate-400">Bằng việc bấm đặt hàng, quý khách đồng ý với Điều khoản mua hàng tại NovaTech.</p>
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Checkout;
