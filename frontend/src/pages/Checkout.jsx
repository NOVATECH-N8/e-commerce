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
      <div className="w-full bg-[#f4f8fc] min-h-screen py-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-sky-100 text-[#0284c7] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <h2 className="text-xl font-black text-slate-900 uppercase">Đặt hàng thành công!</h2>
          <p className="text-xs text-slate-600">
            Cảm ơn quý khách đã tin tưởng mua sắm tại <strong>NovaTech</strong>. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 15 phút.
          </p>

          <div className="bg-[#f0f9ff] rounded-xl p-4 text-left text-xs space-y-2 border border-[#bae6fd]">
            <p><strong>Mã đơn hàng:</strong> <span className="text-[#0284c7] font-bold">#{successOrder.MaDonHang}</span></p>
            <p><strong>Người nhận:</strong> {fullName} ({successOrder.SDTNhanHang})</p>
            <p><strong>Nơi nhận hàng:</strong> {successOrder.DiaChiGiaoHang}</p>
            {successOrder.TienGiamGia > 0 && (
              <p><strong>Ưu đãi giảm giá:</strong> <span className="text-emerald-600 font-bold">-{formatPrice(successOrder.TienGiamGia)}</span></p>
            )}
            <p><strong>Tổng tiền:</strong> <span className="text-[#0284c7] font-black text-sm">{formatPrice(successOrder.TongTien)}</span></p>
            <p><strong>Hình thức:</strong> {successOrder.PhuongThucThanhToan === 'VIETQR' ? 'Chuyển khoản VietQR Napas 24/7' : 'Thanh toán khi nhận hàng (COD)'}</p>
          </div>

          {/* VietQR Payment Card if applicable */}
          {vietQrInfo && (
            <div className="bg-white rounded-xl p-4 text-left text-xs space-y-3 border-2 border-[#0284c7] shadow-md">
              <div className="flex items-center gap-2 text-[#0284c7] font-black text-sm uppercase border-b border-sky-100 pb-2">
                <QrCode className="w-5 h-5" />
                <span>Mã QR Thanh Toán Tự Động</span>
              </div>

              <div className="text-center py-1">
                <img
                  src={vietQrInfo.qrUrl}
                  alt="VietQR Code"
                  className="w-48 h-48 mx-auto rounded-xl border border-slate-200 p-1 bg-white shadow-sm"
                />
                <p className="text-[11px] text-slate-500 mt-2 font-medium">Mở app Ngân hàng hoặc Ví MoMo/ZaloPay để quét</p>
              </div>

              <div className="bg-[#f8fafc] rounded-lg p-3 space-y-2 border border-slate-200 text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Ngân hàng thụ hưởng:</span>
                  <span className="font-bold text-slate-900">{vietQrInfo.bankId}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{vietQrInfo.accountNo}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(vietQrInfo.accountNo, 'acc')}
                      className="p-1 hover:bg-slate-200 rounded text-[#0284c7] transition-colors"
                      title="Sao chép STK"
                    >
                      {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Chủ tài khoản:</span>
                  <span className="font-bold text-slate-900">{vietQrInfo.accountName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Số tiền:</span>
                  <span className="font-black text-[#0284c7] text-sm">{formatPrice(vietQrInfo.amount)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#0284c7] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      {vietQrInfo.memo}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(vietQrInfo.memo, 'memo')}
                      className="p-1 hover:bg-slate-200 rounded text-[#0284c7] transition-colors"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ Quý khách vui lòng giữ nguyên nội dung chuyển khoản để hệ thống xác nhận thanh toán tự động.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              to="/tracking"
              className="flex-1 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm"
            >
              Tra cứu đơn hàng
            </Link>
            <Link
              to="/"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-lg text-xs transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
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
          <Link to="/cart" className="text-[#0284c7] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại giỏ hàng
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">1. Giỏ hàng</span>
            <span className="text-slate-400">→</span>
            <span className="text-[#0284c7] font-black">2. Điền thông tin đặt hàng</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-500">3. Hoàn tất</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Delivery & Customer details */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Delivery Type Option */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700">1. Chọn hình thức nhận hàng</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('home')}
                  className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    deliveryType === 'home'
                      ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] ring-1 ring-[#0284c7]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Giao tận nơi siêu tốc</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('store')}
                  className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    deliveryType === 'store'
                      ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7] ring-1 ring-[#0284c7]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Nhận tại Showroom</span>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700">2. Thông tin người nhận</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại nhận hàng *</label>
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-bold text-slate-700 block mb-1">Email nhận hóa đơn điện tử</label>
                <input
                  type="email"
                  placeholder="Ví dụ: email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="text-xs space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tỉnh / Thành phố *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold"
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
                    <label className="font-bold text-slate-700 block mb-1">Địa chỉ cụ thể (Số nhà, tên đường, phường/xã) *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Tòa nhà NovaTech, Đường Lê Lợi, Quận 1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                      required
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-[#f0f9ff] rounded-lg border border-[#bae6fd] text-slate-800">
                    <p className="font-bold text-[#0369a1]">Địa chỉ Showroom NovaTech:</p>
                    <p className="mt-1 text-slate-600">Showroom NovaTech trung tâm tại {city}. Nhân viên tư vấn sẽ liên hệ để quý khách đến trải nghiệm và nhận máy.</p>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ghi chú đơn hàng (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700">3. Phương thức thanh toán</h3>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-[#0284c7] bg-[#f0f9ff]/60 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-[#0284c7]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-slate-500 text-[11px]">Được kiểm tra máy và phụ kiện trước khi thanh toán</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="text-[#0284c7]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">Chuyển khoản ngân hàng / Quét mã QR</span>
                    <span className="text-slate-500 text-[11px]">Hỗ trợ quét qua ứng dụng ngân hàng hoặc ví MoMo, VNPAY</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Review */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Đơn hàng ({cart.length} sản phẩm)
              </h3>

              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.MaSP} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={item.AnhMinhHoa} alt={item.TenSP} className="w-10 h-10 object-contain rounded border p-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{item.TenSP}</p>
                        <p className="text-slate-400 text-[10px]">SL: {item.SoLuong}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0">
                      {formatPrice(item.GiaBan * item.SoLuong)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-bold text-slate-800">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vận chuyển:</span>
                  <span className="font-bold text-emerald-600">MIỄN PHÍ</span>
                </div>
                {passedDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Mã ưu đãi ({passedVoucherCode}):</span>
                    <span>-{formatPrice(passedDiscountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#0284c7]">{formatPrice(finalCheckoutTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-black py-3 rounded-xl text-sm uppercase tracking-wide transition-all shadow-md shadow-sky-100 cursor-pointer block text-center disabled:opacity-60"
              >
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>

              <div className="text-[11px] text-slate-500 space-y-1 text-center pt-1">
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
