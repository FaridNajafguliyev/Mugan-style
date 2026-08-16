import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import WhatsApp from "../components/WhatsApp/WhatsApp";
import CartDrawer from "../components/CartDrawer/CartDrawer";

const PublicLayout: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsApp />
      <CartDrawer />
    </div>
  );
};

export default PublicLayout;
