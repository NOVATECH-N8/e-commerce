import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, PlusCircle, AlertCircle, Upload } from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const ProductAdmin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form/Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    TenSP: '',
    GiaBan: '',
    AnhMinhHoa: '',
    MoTa: '',
    ThongSo: '{}', // String representation of JSON
    SoLuongTon: '0',
    TrangThai: 'Đang bán',
    MaDM: '',
    galleryUrls: '' // Newline separated URLs
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(searchQuery ? `/products?search=${searchQuery}` : '/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setToast({ type: 'error', message: 'Không thể tải danh sách sản phẩm.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchQuery]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      TenSP: '',
      GiaBan: '',
      AnhMinhHoa: '',
      MoTa: '',
      ThongSo: '{\n  "Màn hình": "6.1 inch",\n  "Hệ điều hành": "iOS 17",\n  "RAM": "8 GB"\n}',
      SoLuongTon: '10',
      TrangThai: 'Đang bán',
      MaDM: categories[0]?.MaDM || '',
      galleryUrls: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    if (!product) return;
    setEditingProduct(product);
    
    // Format specification JSON string nicely for the textarea
    let specsStr = '{}';
    if (product.ThongSo) {
      try {
        const parsed = typeof product.ThongSo === 'string' 
          ? JSON.parse(product.ThongSo) 
          : product.ThongSo;
        if (parsed === null) {
          specsStr = '{}';
        } else {
          specsStr = JSON.stringify(parsed, null, 2);
        }
      } catch (e) {
        specsStr = String(product.ThongSo || '');
      }
    }

    // Format gallery URLs bulletproof
    const galleryStr = product.HinhAnhs?.map(img => img?.DuongDan || '').filter(Boolean).join('\n') || '';

    setFormData({
      TenSP: product.TenSP || '',
      GiaBan: product.GiaBan !== undefined && product.GiaBan !== null ? product.GiaBan.toString() : '0',
      AnhMinhHoa: product.AnhMinhHoa || '',
      MoTa: product.MoTa || '',
      ThongSo: specsStr,
      SoLuongTon: product.SoLuongTon !== undefined && product.SoLuongTon !== null ? product.SoLuongTon.toString() : '0',
      TrangThai: product.TrangThai || 'Đang bán',
      MaDM: product.MaDM || '',
      galleryUrls: galleryStr
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);
    setUploadingImg(true);
    try {
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = `http://localhost:5000${res.data.url}`;
      setFormData(prev => ({ ...prev, AnhMinhHoa: fileUrl }));
      setToast({ type: 'success', message: 'Tải ảnh sản phẩm lên thành công!' });
    } catch (err) {
      console.error('Upload product img err:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi tải ảnh.' });
    } finally {
      setUploadingImg(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const { TenSP, GiaBan, AnhMinhHoa, MoTa, ThongSo, SoLuongTon, TrangThai, MaDM, galleryUrls } = formData;

    // Field Validations
    if (!TenSP || GiaBan === '' || SoLuongTon === '') {
      setToast({ type: 'error', message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' });
      return;
    }

    if (isNaN(parseFloat(GiaBan)) || isNaN(parseInt(SoLuongTon))) {
      setToast({ type: 'error', message: 'Giá bán và số lượng tồn kho phải là số hợp lệ.' });
      return;
    }

    if (parseFloat(GiaBan) < 0 || parseInt(SoLuongTon) < 0) {
      setToast({ type: 'error', message: 'Giá bán và số lượng tồn kho không được âm.' });
      return;
    }

    // Validate Specifications JSON format
    let finalSpecs = {};
    if (ThongSo && ThongSo.trim()) {
      try {
        finalSpecs = JSON.parse(ThongSo);
      } catch (e) {
        setToast({ type: 'error', message: 'Thông số kỹ thuật phải là định dạng JSON hợp lệ (ví dụ: {"Key": "Value"}).' });
        return;
      }
    }

    // Process gallery URLs into objects
    const finalGallery = galleryUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url !== '');

    const productPayload = {
      TenSP,
      GiaBan: parseFloat(GiaBan),
      AnhMinhHoa: AnhMinhHoa.trim(),
      MoTa,
      ThongSo: finalSpecs,
      SoLuongTon: parseInt(SoLuongTon),
      TrangThai,
      MaDM: MaDM ? parseInt(MaDM) : null,
      HinhAnhs: finalGallery
    };

    try {
      if (editingProduct) {
        // Update product
        const res = await api.put(`/products/${editingProduct.MaSP}`, productPayload);
        setToast({ type: 'success', message: res.data.message });
      } else {
        // Create product
        const res = await api.post('/products', productPayload);
        setToast({ type: 'success', message: res.data.message });
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Save product error:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Không thể lưu sản phẩm.' });
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm '${name}'? Hành động này sẽ xóa vĩnh viễn sản phẩm và bộ sưu tập ảnh liên quan.`)) {
      try {
        const res = await api.delete(`/products/${productId}`);
        setToast({ type: 'success', message: res.data.message });
        fetchProducts();
      } catch (error) {
        console.error('Delete product error:', error);
        setToast({ type: 'error', message: error.response?.data?.message || 'Không thể xóa sản phẩm.' });
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 font-display">Quản lý Sản phẩm</h2>
          <p className="text-slate-400 text-xs mt-1">Danh sách sản phẩm trong hệ thống</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-primary-200 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 max-w-md w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-slate-700 w-full"
        />
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto border border-slate-150 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150">
              <th className="p-4 w-12 text-center">ID</th>
              <th className="p-4">Hình ảnh</th>
              <th className="p-4">Tên sản phẩm</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4 text-right">Đơn giá</th>
              <th className="p-4 text-center">Tồn kho</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-center w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="8" className="p-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                  Đang tải danh sách...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.MaSP} className="hover:bg-slate-50/55 transition-colors">
                  <td className="p-4 text-center text-slate-400 font-bold">{product.MaSP}</td>
                  <td className="p-4">
                    <img
                      src={product.AnhMinhHoa}
                      alt={product.TenSP}
                      className="w-12 h-12 object-cover rounded-lg border bg-slate-50 flex-shrink-0"
                    />
                  </td>
                  <td className="p-4 font-bold text-slate-800 line-clamp-2 max-w-xs">{product.TenSP}</td>
                  <td className="p-4 text-slate-500 font-medium">
                    {product.DanhMuc?.TenDM || 'Không xác định'}
                  </td>
                  <td className="p-4 text-right font-bold text-primary-600">{formatPrice(product.GiaBan)}</td>
                  <td className="p-4 text-center font-semibold">
                    <span className={product.SoLuongTon === 0 ? 'text-rose-500' : 'text-slate-700'}>
                      {product.SoLuongTon}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      product.TrangThai === 'Đang bán'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {product.TrangThai}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.MaSP, product.TenSP)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-20">
              <h3 className="text-lg font-black text-slate-800 font-display">
                {editingProduct ? `Cập nhật: Sản phẩm #${editingProduct.MaSP}` : 'Thêm sản phẩm mới'}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  form="productForm"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md shadow-primary-100 transition-all cursor-pointer"
                >
                  Lưu lại
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form id="productForm" onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Business Status */}
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái kinh doanh:</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="TrangThai"
                      value="Đang bán"
                      checked={formData.TrangThai === 'Đang bán'}
                      onChange={handleFormChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-1">Đang bán</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="TrangThai"
                      value="Ngừng bán"
                      checked={formData.TrangThai === 'Ngừng bán'}
                      onChange={handleFormChange}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-1">Ngừng bán</span>
                  </label>
                </div>
              </div>
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên sản phẩm *</label>
                <input
                  type="text"
                  name="TenSP"
                  value={formData.TenSP}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                  required
                />
              </div>

              {/* Grid: Price, Stock, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Giá bán (VND) *</label>
                  <input
                    type="number"
                    name="GiaBan"
                    value={formData.GiaBan}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    name="SoLuongTon"
                    value={formData.SoLuongTon}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục sản phẩm</label>
                  <select
                    name="MaDM"
                    value={formData.MaDM}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.MaDM} value={cat.MaDM}>{cat.TenDM}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Image URL & File Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ảnh minh họa *</label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-[#d70018] rounded-[4px] text-xs font-bold cursor-pointer transition-colors border border-red-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImg ? 'Đang tải...' : 'Tải ảnh từ máy'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFile}
                      disabled={uploadingImg}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="AnhMinhHoa"
                    value={formData.AnhMinhHoa}
                    onChange={handleFormChange}
                    placeholder="https://... hoặc bấm nút Tải ảnh từ máy"
                    className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                    required
                  />
                  {formData.AnhMinhHoa && (
                    <img
                      src={formData.AnhMinhHoa}
                      alt="Preview"
                      className="w-10 h-10 object-contain rounded-lg border border-slate-200 p-0.5 shrink-0 bg-white shadow-xs"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả sản phẩm</label>
                <textarea
                  name="MoTa"
                  value={formData.MoTa}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 h-24 resize-none"
                />
              </div>

              {/* Specifications (JSON Formatted) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    Thông số kỹ thuật (Cú pháp JSON)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Ví dụ: {"{\"RAM\": \"8GB\", \"Ổ cứng\": \"256GB\"}"}</span>
                </div>
                <textarea
                  name="ThongSo"
                  value={formData.ThongSo}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 h-24 font-mono"
                />
              </div>

              {/* Image Gallery (Multiple lines) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bộ sưu tập ảnh chi tiết (Mỗi URL một dòng)</label>
                <textarea
                  name="galleryUrls"
                  value={formData.galleryUrls}
                  onChange={handleFormChange}
                  placeholder="https://image-url-1.com&#10;https://image-url-2.com"
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 h-20 font-mono"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAdmin;
