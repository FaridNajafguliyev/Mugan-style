import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import { AdminAuthGuard } from "./context/AdminAuthContext";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Lazily loaded: checkout/order pages are visited far less often than the
// core storefront above, and the entire /admin/* tree is irrelevant to a
// shopper — splitting it out of the main bundle keeps the public-facing
// catalog/product pages light.
const Favorites = lazy(() => import("./pages/Favorites"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderResult = lazy(() => import("./pages/OrderResult"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Requisites = lazy(() => import("./pages/Requisites"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/OrderDetail"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminInventory = lazy(() => import("./pages/admin/Inventory"));
const AdminCustomers = lazy(() => import("./pages/admin/Customers"));
const AdminDelivery = lazy(() => import("./pages/admin/Delivery"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

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
      <Suspense fallback={null}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:id" element={<Product />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:orderNumber/result" element={<OrderResult />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/requisites" element={<Requisites />} />
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
      </Suspense>
    </>
  );
};

export default App;
