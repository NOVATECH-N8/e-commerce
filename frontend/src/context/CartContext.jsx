import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync cart from API if logged in, otherwise from localStorage
  const fetchCart = async () => {
    setLoading(true);
    if (user) {
      try {
        const response = await api.get('/cart');
        setCart(response.data.items || []);
      } catch (error) {
        console.error('Error fetching cart from server:', error);
      }
    } else {
      const localCart = localStorage.getItem('localCart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      } else {
        setCart([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Save to localStorage when local cart changes and user is guest
  useEffect(() => {
    if (!user) {
      localStorage.setItem('localCart', JSON.stringify(cart));
    }
  }, [cart, user]);

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    const qty = parseInt(quantity);
    
    // 1. Check if discontinued
    if (product.TrangThai === 'Ngừng bán') {
      return { success: false, message: 'Sản phẩm đã ngừng bán. Không thể mua.' };
    }

    // Find if already exists in cart to calculate total requested qty
    const existingItem = cart.find(item => item.MaSP === product.MaSP);
    const currentQty = existingItem ? existingItem.SoLuong : 0;
    const newQty = currentQty + qty;

    // 2. Validate stock limits
    if (newQty > product.SoLuongTon) {
      return {
        success: false,
        message: `Không đủ hàng tồn kho. Chỉ còn lại ${product.SoLuongTon} sản phẩm.`
      };
    }

    if (user) {
      try {
        await api.post('/cart', { MaSP: product.MaSP, SoLuong: qty });
        await fetchCart();
        return { success: true, message: 'Đã thêm vào giỏ hàng thành công.' };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra.' };
      }
    } else {
      // Local management for guests
      if (existingItem) {
        setCart(cart.map(item => 
          item.MaSP === product.MaSP ? { ...item, SoLuong: newQty } : item
        ));
      } else {
        setCart([...cart, {
          MaSP: product.MaSP,
          TenSP: product.TenSP,
          GiaBan: parseFloat(product.GiaBan),
          AnhMinhHoa: product.AnhMinhHoa,
          SoLuong: qty,
          SoLuongTon: product.SoLuongTon,
          TrangThai: product.TrangThai,
          ThanhTien: parseFloat(product.GiaBan) * qty
        }]);
      }
      return { success: true, message: 'Đã thêm vào giỏ hàng thành công.' };
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQty) => {
    const qty = parseInt(newQty);
    if (qty <= 0) {
      return removeFromCart(productId);
    }

    // Find product to check stock
    const item = cart.find(item => item.MaSP === productId);
    if (!item) {
      return { success: false, message: 'Sản phẩm không có trong giỏ hàng.' };
    }

    if (qty > item.SoLuongTon) {
      return {
        success: false,
        message: `Số lượng yêu cầu vượt quá tồn kho (${item.SoLuongTon} sản phẩm).`
      };
    }

    if (user) {
      try {
        await api.put('/cart', { MaSP: productId, SoLuong: qty });
        await fetchCart();
        return { success: true, message: 'Cập nhật giỏ hàng thành công.' };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra.' };
      }
    } else {
      setCart(cart.map(item => 
        item.MaSP === productId ? { ...item, SoLuong: qty, ThanhTien: item.GiaBan * qty } : item
      ));
      return { success: true, message: 'Cập nhật giỏ hàng thành công.' };
    }
  };

  // Remove single item
  const removeFromCart = async (productId) => {
    if (user) {
      try {
        await api.delete(`/cart/${productId}`);
        await fetchCart();
        return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng.' };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra.' };
      }
    } else {
      setCart(cart.filter(item => item.MaSP !== productId));
      return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng.' };
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        await fetchCart();
        return { success: true };
      } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra.' };
      }
    } else {
      setCart([]);
      localStorage.removeItem('localCart');
      return { success: true };
    }
  };

  // Calculations
  const cartCount = cart.reduce((total, item) => total + item.SoLuong, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.GiaBan * item.SoLuong), 0);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
