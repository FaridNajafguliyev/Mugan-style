import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import { AdminAuthGuard } from "./context/AdminAuthContext";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import OrderResult from "./pages/OrderResult";
import TrackOrder from "./pages/TrackOrder";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetail from "./pages/admin/OrderDetail";
import AdminProducts from "./pages/admin/Products";
import AdminInventory from "./pages/admin/Inventory";
import AdminCustomers from "./pages/admin/Customers";
import AdminDelivery from "./pages/admin/Delivery";
import AdminSettings from "./pages/admin/Settings";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderNumber/result" element={<OrderResult />} />
          <Route path="/track-order" element={<TrackOrder />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminAuthGuard>
              <AdminLayout />
            </AdminAuthGuard>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="delivery" element={<AdminDelivery />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
