import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import "./WhatsApp.scss";

const WhatsApp: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const { isOpen: cartOpen } = useCart();
  const phone = "79265939880";
  const message = encodeURIComponent("Здравствуйте! Хочу узнать подробнее о вашей коллекции.");
  const url = `https://wa.me/${phone}?text=${message}`;

  // Sits bottom-right, same corner as the cart drawer's "Оформить заказ"
  // button — left showing while the drawer is open, it overlapped that
  // button and could catch an accidental tap meant for checkout.
  if (cartOpen) return null;

  return (

      <a href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="ms-whatsapp"
      aria-label="Написать в WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={`ms-whatsapp__label ${hovered ? "is-visible" : ""}`}>
        Написать в WhatsApp
      </span>
      <div className="ms-whatsapp__icon">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.829 1.782 6.86L2 30l7.34-1.762A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#25D366"/>
          <path d="M22.5 19.5c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" fill="white"/>
        </svg>
      </div>
      <div className="ms-whatsapp__pulse" />
    </a>
  );
};

export default WhatsApp;