import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components & Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import ProductAdmin from './pages/admin/ProductAdmin';
import CategoryAdmin from './pages/admin/CategoryAdmin';
import OrderAdmin from './pages/admin/OrderAdmin';
import UserAdmin from './pages/admin/UserAdmin';
import DashboardAdmin from './pages/admin/DashboardAdmin';

// Customer Layout Wrapper
const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Customer & Public Routes */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<Home />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="tracking" element={<OrderHistory />} />
              <Route path="profile" element={<Profile />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Admin Back-office Dashboard Routes (Protected) */}
            <Route path="/admin" element={<AdminLayout />}>
              {/* Redirect /admin to overview dashboard */}
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardAdmin />} />
              <Route path="products" element={<ProductAdmin />} />
              <Route path="categories" element={<CategoryAdmin />} />
              <Route path="orders" element={<OrderAdmin />} />
              <Route path="users" element={<UserAdmin />} />
            </Route>

            {/* CMS Dashboard Routes (Protected) */}
            <Route path="/cms" element={<AdminLayout />}>
              {/* Redirect /cms to overview dashboard */}
              <Route index element={<Navigate to="/cms/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardAdmin />} />
              <Route path="products" element={<ProductAdmin />} />
              <Route path="categories" element={<CategoryAdmin />} />
              <Route path="orders" element={<OrderAdmin />} />
              <Route path="users" element={<UserAdmin />} />
            </Route>

            {/* Fallback wildcard route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
