import React, { useEffect } from "react";
import "./Lightbox.scss";

interface LightboxProps {
  images: string[];
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, current, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div className="ms-lightbox" onClick={onClose}>
      <button className="ms-lightbox__close" onClick={onClose}>✕</button>

      <button className="ms-lightbox__prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>‹</button>

      <div className="ms-lightbox__img-wrap" onClick={(e) => e.stopPropagation()}>
        <img src={images[current]} alt="" />
      </div>

      <button className="ms-lightbox__next" onClick={(e) => { e.stopPropagation(); onNext(); }}>›</button>

      <div className="ms-lightbox__dots">
        {images.map((_, i) => (
          <span key={i} className={i === current ? "is-active" : ""} />
        ))}
      </div>
    </div>
  );
};

export default Lightbox;