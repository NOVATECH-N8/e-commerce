import React from 'react';
import { Phone, MapPin, ShieldCheck, Truck, RefreshCw, Award, CreditCard, ExternalLink, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white text-slate-700 mt-12 border-t border-slate-200">
      
      {/* 4 Pillars Banner / Cam kết mua hàng NovaTech */}
      <div className="bg-[#f0f9ff] border-b border-[#bae6fd] py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shrink-0 font-bold shadow-sm">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Giao hàng nhanh 2 giờ</p>
              <p className="text-slate-500 text-[11px]">Miễn phí đơn từ 500.000đ</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shrink-0 font-bold shadow-sm">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Lỗi 1 đổi 1 trong 30 ngày</p>
              <p className="text-slate-500 text-[11px]">Bảo hành nhanh toàn quốc</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shrink-0 font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Bảo hành chính hãng 12 tháng</p>
              <p className="text-slate-500 text-[11px]">Trung tâm bảo hành ủy quyền</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shrink-0 font-bold shadow-sm">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Chính hãng 100%</p>
              <p className="text-slate-500 text-[11px]">Hoàn tiền 200% nếu phát hiện hàng giả</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
        
        {/* Column 1: Hotline Support */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded bg-[#0284c7] text-white flex items-center justify-center font-bold">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-black text-slate-900 text-sm">NOVATECH</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Hệ thống bán lẻ điện thoại, máy tính bảng, laptop và phụ kiện công nghệ chính hãng hàng đầu.
          </p>

          <div className="space-y-1 text-slate-600">
            <p>
              Gọi mua hàng: <strong className="text-[#0284c7] font-bold">1900 6868</strong> (7:30 - 22:00)
            </p>
            <p>
              Khiếu nại: <strong className="text-[#0284c7] font-bold">1800 6869</strong> (8:00 - 21:30)
            </p>
            <p>
              Bảo hành: <strong className="text-[#0284c7] font-bold">1800 6870</strong> (8:00 - 21:00)
            </p>
          </div>

          <div className="pt-2">
            <h5 className="font-bold text-slate-800 mb-1.5">Phương thức thanh toán</h5>
            <div className="flex flex-wrap gap-1.5">
              {['Visa', 'Mastercard', 'JCB', 'VNPAY', 'MoMo', 'COD', 'Trả góp 0%'].map((pay) => (
                <span key={pay} className="px-2 py-0.5 bg-[#f0f9ff] border border-[#bae6fd] rounded text-[10px] font-semibold text-[#0369a1]">
                  {pay}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Về công ty */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-sm mb-2">Về NovaTech</h4>
          <ul className="space-y-1.5 text-slate-600">
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Giới thiệu công ty</a></li>
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Tuyển dụng nhân sự mới</a></li>
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Gửi góp ý, phản hồi dịch vụ</a></li>
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Hệ thống showroom NovaTech</a></li>
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Chính sách bảo mật thông tin</a></li>
          </ul>
        </div>

        {/* Column 3: Chính sách & Dịch vụ */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-900 text-sm mb-2">Chính sách & Hỗ trợ</h4>
          <ul className="space-y-1.5 text-slate-600">
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Chính sách bảo hành NovaCare</a></li>
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Chính sách đổi trả 30 ngày</a></li>
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Chính sách vận chuyển siêu tốc</a></li>
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Hướng dẫn mua trả góp 0%</a></li>
            <li><a href="#" className="hover:text-[#0284c7] transition-colors">Quy chế hoạt động sàn TMĐT</a></li>
          </ul>
        </div>

        {/* Column 4: Hệ sinh thái & Chứng nhận */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm mb-2">Dịch vụ NovaTech</h4>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-600">
            <span className="p-1.5 bg-[#f0f9ff] border border-[#bae6fd] rounded text-center text-[#0369a1]">NovaCare</span>
            <span className="p-1.5 bg-[#f0f9ff] border border-[#bae6fd] rounded text-center text-[#0369a1]">NovaExpress</span>
            <span className="p-1.5 bg-[#f0f9ff] border border-[#bae6fd] rounded text-center text-[#0369a1]">NovaTrade</span>
            <span className="p-1.5 bg-[#f0f9ff] border border-[#bae6fd] rounded text-center text-[#0369a1]">NovaPay</span>
          </div>

          <div className="pt-2">
            <h5 className="font-bold text-slate-800 mb-1.5">Chứng nhận uy tín</h5>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 bg-sky-50 border border-sky-200 text-[#0284c7] rounded font-bold text-[10px]">
                ✔ ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG
              </span>
              <span className="inline-block px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold text-[10px]">
                🛡 DMCA PROTECTED
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="bg-[#f8fafc] text-slate-500 py-4 px-4 text-center text-[11px] border-t border-slate-200">
        <p className="max-w-4xl mx-auto leading-relaxed">
          &copy; 2026 NovaTech Corporation. Hệ thống bán lẻ thiết bị công nghệ chính hãng hàng đầu Việt Nam.
          <br />
          Địa chỉ: Tòa nhà Công Nghệ NovaTech, Quận 1, TP. Hồ Chí Minh. Hotline hỗ trợ: 1900 6868. Email: support@novatech.vn.
        </p>
      </div>

    </footer>
  );
};

export default Footer;
