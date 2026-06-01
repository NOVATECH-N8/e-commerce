import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const CategoryAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    TenDM: '',
    MoTa: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setToast({ type: 'error', message: 'Không thể tải danh sách danh mục.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ TenDM: '', MoTa: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      TenDM: cat.TenDM,
      MoTa: cat.MoTa || ''
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.TenDM.trim()) {
      setToast({ type: 'error', message: 'Tên danh mục không được để trống.' });
      return;
    }

    try {
      if (editingCategory) {
        // Edit category
        const res = await api.put(`/categories/${editingCategory.MaDM}`, formData);
        setToast({ type: 'success', message: res.data.message });
      } else {
        // Create category
        const res = await api.post('/categories', formData);
        setToast({ type: 'success', message: res.data.message });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Save category error:', error);
      setToast({ type: 'error', message: error.response?.data?.message || 'Không thể lưu danh mục.' });
    }
  };

  const handleDeleteCategory = async (catId, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục '${name}'?`)) {
      try {
        const res = await api.delete(`/categories/${catId}`);
        setToast({ type: 'success', message: res.data.message });
        fetchCategories();
      } catch (error) {
        console.error('Delete category error:', error);
        // Intercept validation error when products are linked to the category
        setToast({
          type: 'error',
          message: error.response?.data?.message || 'Không thể xóa danh mục.'
        });
      }
    }
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

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 font-display">Quản lý Danh mục</h2>
          <p className="text-slate-400 text-xs mt-1">Quản trị các phân mục sản phẩm</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-primary-200 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      {/* Grid list */}
      <div className="overflow-x-auto border border-slate-150 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150">
              <th className="p-4 w-12 text-center">ID</th>
              <th className="p-4">Tên danh mục</th>
              <th className="p-4">Mô tả chi tiết</th>
              <th className="p-4 text-center w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-400">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                  Đang tải danh sách...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Không có danh mục nào.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.MaDM} className="hover:bg-slate-50/55 transition-colors">
                  <td className="p-4 text-center text-slate-400 font-bold">{cat.MaDM}</td>
                  <td className="p-4 font-bold text-slate-800">{cat.TenDM}</td>
                  <td className="p-4 text-slate-500 font-light">{cat.MoTa || 'Không có mô tả.'}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.MaDM, cat.TenDM)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Xóa danh mục"
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
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-fade-in border border-slate-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-3xl">
              <h3 className="text-lg font-black text-slate-800 font-display">
                {editingCategory ? `Cập nhật danh mục #${editingCategory.MaDM}` : 'Thêm danh mục mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên danh mục *</label>
                <input
                  type="text"
                  name="TenDM"
                  value={formData.TenDM}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả ngắn</label>
                <textarea
                  name="MoTa"
                  value={formData.MoTa}
                  onChange={handleFormChange}
                  className="w-full border border-slate-200 outline-none focus:border-primary-500 rounded-xl px-4 py-2.5 text-sm text-slate-700 h-24 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 px-5 rounded-xl text-xs transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-5 rounded-xl text-xs shadow-md shadow-primary-100 transition-all"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryAdmin;
