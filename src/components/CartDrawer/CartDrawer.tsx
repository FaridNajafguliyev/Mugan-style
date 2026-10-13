import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../lib/format";
import "./CartDrawer.scss";

const CartDrawer: React.FC = () => {
  const { items, isOpen, close, removeItem, adjustQty, subtotalKopecks } = useCart();

  return (
    <>
      <div className={`ms-cart-drawer ${isOpen ? "is-open" : ""}`}>
        <div className="ms-cart-drawer__head">
          <h3>Корзина</h3>
          <button className="ms-cart-drawer__close" onClick={close} aria-label="Закрыть корзину">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <p className="ms-cart-drawer__empty">Корзина пуста</p>
        ) : (
          <>
            <div className="ms-cart-drawer__list">
              {items.map((item) => (
                <div key={item.id} className="ms-cart-drawer__item">
                  <img src={item.image} alt={item.title} />
                  <div className="ms-cart-drawer__item-info">
                    <span className="ms-cart-drawer__item-title">{item.title}</span>
                    <span className="ms-cart-drawer__item-price">
                      {formatPrice(item.priceKopecks, false)}
                    </span>
                    <div className="ms-cart-drawer__item-qty">
                      <button
                        onClick={() => adjustQty(item.id, -1)}
                        disabled={item.qty <= 1}
                        aria-label="Уменьшить количество"
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => adjustQty(item.id, 1)}
                        disabled={item.qty >= item.available}
                        aria-label="Увеличить количество"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="ms-cart-drawer__item-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Удалить товар"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="ms-cart-drawer__foot">
              <div className="ms-cart-drawer__total">
                <span>Итого</span>
                <strong>{formatPrice(subtotalKopecks, false)}</strong>
              </div>
              <Link to="/checkout" className="btn btn--gold" onClick={close}>
                Оформить заказ
              </Link>
            </div>
          </>
        )}
      </div>
      {isOpen && <div className="ms-cart-drawer__backdrop" onClick={close} />}
    </>
  );
};

export default CartDrawer;
