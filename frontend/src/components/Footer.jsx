import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-100 text-slate-600 py-16 px-8 mt-auto border-t border-slate-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1 */}
        <div className="space-y-4">
          <span className="text-xl font-bold tracking-tight text-slate-800 font-display flex items-center gap-1.5">
            ⚡ Nemo Tech
          </span>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            Hệ thống bán lẻ điện thoại, máy tính bảng, laptop và phụ kiện công nghệ chính hãng hàng đầu Việt Nam. Mang công nghệ đến cuộc sống của bạn.
          </p>
        </div>

        {/* Column 2 */}
        <div>
          <h4 className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-4 font-display">Về công ty</h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-500">
            <li><a href="#" className="hover:text-primary-600 transition-colors">Về chúng tôi</a></li>
            <li><a href="#" className="hover:text-primary-600 transition-colors">Chính sách bảo mật</a></li>
            <li><a href="#" className="hover:text-primary-600 transition-colors">Tạp chí nội bộ</a></li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-4 font-display">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-xs font-semibold text-slate-500">
            <li><a href="#" className="hover:text-primary-600 transition-colors">Vận chuyển & Đổi trả</a></li>
            <li><a href="#" className="hover:text-primary-600 transition-colors">Bản đồ cửa hàng</a></li>
            <li><a href="#" className="hover:text-primary-600 transition-colors">Hỗ trợ kỹ thuật</a></li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="space-y-4">
          <h4 className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-4 font-display">Cập nhật tin tức</h4>
          <p className="text-xs text-slate-400 font-light">Đăng ký nhận tin tức mới nhất về các bộ sưu tập thiết kế của Nemo.</p>
          <div className="flex bg-white border border-slate-200 rounded-full overflow-hidden p-1 max-w-xs focus-within:ring-2 focus-within:ring-primary-500">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="bg-transparent border-none outline-none text-xs px-3 py-1 flex-grow w-full"
            />
            <button className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2.5 transition-colors flex items-center justify-center">
              <span className="text-[10px] leading-none">➔</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
        <p>&copy; 2026 Nemo. Tất cả các quyền được bảo lưu. Thiết kế lấy cảm hứng từ đại dương.</p>
        <p className="mt-2 sm:mt-0">Được chế tác mang thẩm mỹ dưới nước.</p>
      </div>
    </footer>
  );
};

export default Footer;
