import React, { useState, useEffect } from 'react';
import { Star, Image as ImageIcon, CheckCircle2, ShieldCheck, X, ThumbsUp, MessageSquare, AlertCircle, Upload } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';

const ProductReviews = ({ productId, onRatingStatsUpdate }) => {
  const { user } = useAuth();

  const [reviewsData, setReviewsData] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: []
  });

  const [canReviewInfo, setCanReviewInfo] = useState({
    canReview: false,
    hasReviewed: false,
    message: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [selectedStar, setSelectedStar] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'WITH_IMAGE', 5, 4, 3, 2, 1
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      setReviewsData(res.data);
      if (onRatingStatsUpdate) {
        onRatingStatsUpdate(res.data);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    }
  };

  const fetchCanReview = async () => {
    if (!user) {
      setCanReviewInfo({ canReview: false, hasReviewed: false, message: 'Vui lòng đăng nhập để đánh giá sản phẩm.' });
      return;
    }
    try {
      const res = await api.get(`/products/${productId}/can-review`);
      setCanReviewInfo(res.data);
      if (res.data.existingReview) {
        setSelectedStar(res.data.existingReview.SoSao || 5);
        setCommentText(res.data.existingReview.NoiDung || '');
        setReviewImage(res.data.existingReview.HinhAnh || null);
      }
    } catch (err) {
      console.error('Check can review error:', err);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
      fetchCanReview();
    }
  }, [productId, user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Vui lòng chỉ chọn file ảnh (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Kích thước ảnh tối đa là 5MB.' });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReviewImage(res.data.url);
      setToast({ type: 'success', message: 'Tải ảnh thực tế lên thành công!' });
    } catch (err) {
      console.error('Upload image error:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi tải ảnh.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setToast({ type: 'error', message: 'Vui lòng viết cảm nhận của bạn về sản phẩm.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/products/${productId}/reviews`, {
        SoSao: selectedStar,
        NoiDung: commentText.trim(),
        HinhAnh: reviewImage
      });

      setToast({ type: 'success', message: res.data.message || 'Gửi đánh giá thành công!' });
      setShowForm(false);
      await fetchReviews();
      await fetchCanReview();
    } catch (err) {
      console.error('Submit review error:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviewsData.reviews.filter((r) => {
    if (activeFilter === 'WITH_IMAGE') return !!r.HinhAnh;
    if (typeof activeFilter === 'number') return r.SoSao === activeFilter;
    return true; // 'ALL'
  });

  const getPercentage = (count) => {
    if (!reviewsData.totalReviews) return 0;
    return Math.round((count / reviewsData.totalReviews) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#d70018]" />
            Đánh giá & Nhận xét của khách hàng
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Nhận xét thực tế từ những người đã mua sản phẩm tại CellphoneS
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              setToast({ type: 'info', message: 'Vui lòng đăng nhập để viết đánh giá.' });
              return;
            }
            if (!canReviewInfo.canReview) {
              setToast({ type: 'warning', message: canReviewInfo.message });
              return;
            }
            setShowForm(!showForm);
          }}
          className="px-4 py-2 bg-[#d70018] hover:bg-[#be0015] text-white text-xs font-bold rounded-[4px] shadow-sm transition-all cursor-pointer"
        >
          {showForm ? 'Đóng lại' : canReviewInfo.hasReviewed ? 'Sửa đánh giá của bạn' : 'Viết đánh giá ngay'}
        </button>
      </div>

      {/* Rating Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#f8fafc] dark:bg-slate-900/60 p-5 rounded-md border border-slate-200 dark:border-slate-700">
        
        {/* Left: Big Average Star */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-4 md:pb-0 md:pr-4">
          <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {reviewsData.averageRating || '5.0'}
            <span className="text-lg text-slate-400 font-normal">/5</span>
          </div>

          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(reviewsData.averageRating || 5)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Dựa trên <strong>{reviewsData.totalReviews}</strong> lượt đánh giá thực tế
          </p>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviewsData.ratingDistribution[star] || 0;
            const pct = getPercentage(count);
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  {star} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </span>

                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#d70018] h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-16 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Review Submission Form (Expandable) */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-red-50/50 dark:bg-slate-800/90 rounded-md p-5 border border-red-200 dark:border-red-900/60 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#d70018] dark:text-rose-400">
              {canReviewInfo.hasReviewed ? 'Cập nhật đánh giá của bạn:' : 'Đánh giá sản phẩm:'}
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Đã xác thực mua hàng
            </span>
          </div>

          {/* Star selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              1. Bạn cảm thấy sản phẩm này như thế nào? *
            </label>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setSelectedStar(star)}
                  className="p-1 transition-transform hover:scale-125 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= (hoverStar || selectedStar)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                {selectedStar === 5 && 'Tuyệt vời, rất hài lòng!'}
                {selectedStar === 4 && 'Hài lòng'}
                {selectedStar === 3 && 'Bình thường'}
                {selectedStar === 2 && 'Không hài lòng'}
                {selectedStar === 1 && 'Rất tệ'}
              </span>
            </div>
          </div>

          {/* Comment text */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              2. Chia sẻ nhận xét chi tiết (chất lượng, độ bền, trải nghiệm dùng) *
            </label>
            <textarea
              rows="3"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Sản phẩm dùng rất mượt, camera chụp sắc nét, giao hàng siêu nhanh..."
              className="w-full text-xs p-3 rounded-[4px] border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-[#d70018]"
              required
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              3. Đính kèm ảnh thực tế (Tùy chọn)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-[4px] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                <Upload className="w-4 h-4 text-[#d70018]" />
                <span>{uploadingImage ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy tính'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {reviewImage && (
                <div className="relative inline-block border border-slate-300 dark:border-slate-600 rounded-[4px] overflow-hidden group">
                  <img
                    src={reviewImage.startsWith('http') ? reviewImage : `http://localhost:5000${reviewImage}`}
                    alt="Preview"
                    className="w-12 h-12 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setReviewImage(null)}
                    className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 opacity-90 hover:opacity-100 transition-opacity"
                    title="Xóa ảnh"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-200 dark:border-red-900/60">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[4px] text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="px-5 py-2 bg-[#d70018] hover:bg-[#be0015] text-white rounded-[4px] text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi nhận xét ngay'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
        <span className="font-bold text-slate-600 dark:text-slate-400 mr-1">Lọc xem theo:</span>

        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-3 py-1.5 rounded-[4px] font-bold transition-colors cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[#d70018] text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Tất cả ({reviewsData.totalReviews})
        </button>

        <button
          onClick={() => setActiveFilter('WITH_IMAGE')}
          className={`px-3 py-1.5 rounded-[4px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
            activeFilter === 'WITH_IMAGE'
              ? 'bg-[#d70018] text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Có hình ảnh
        </button>

        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            onClick={() => setActiveFilter(s)}
            className={`px-3 py-1.5 rounded-[4px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              activeFilter === s
                ? 'bg-[#d70018] text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {s} <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> ({reviewsData.ratingDistribution[s] || 0})
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4 pt-2">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/40 rounded-md border border-dashed border-slate-200 dark:border-slate-700">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Chưa có đánh giá nào phù hợp bộ lọc.</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Hãy là người đầu tiên trải nghiệm và chia sẻ nhận xét!</p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const imgSrc = rev.HinhAnh
              ? rev.HinhAnh.startsWith('http') ? rev.HinhAnh : `http://localhost:5000${rev.HinhAnh}`
              : null;

            return (
              <div
                key={rev.MaDanhGia}
                className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
              >
                {/* User & Date Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#d70018] text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">
                      {(rev.NguoiDung?.TenKH || 'K')[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {rev.NguoiDung?.TenKH || rev.NguoiDung?.TaiKhoan || 'Khách hàng CellphoneS'}
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-normal text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0.2 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Đã mua tại CellphoneS
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {formatDate(rev.NgayDanhGia)}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 pt-0.5">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star
                      key={st}
                      className={`w-3.5 h-3.5 ${
                        st <= rev.SoSao ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal pt-1">
                  {rev.NoiDung}
                </p>

                {/* Review Photo Thumbnail */}
                {imgSrc && (
                  <div className="pt-2">
                    <img
                      src={imgSrc}
                      alt="Ảnh nhận xét"
                      onClick={() => setPreviewModalImg(imgSrc)}
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={previewModalImg} alt="Phóng to ảnh" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-1.5 hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductReviews;
