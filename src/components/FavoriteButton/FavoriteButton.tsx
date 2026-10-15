import React from "react";
import "./FavoriteButton.scss";

interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ active, onToggle, className = "" }) => {
  return (
    <button
      type="button"
      className={`ms-favorite-btn ${active ? "is-active" : ""} ${className}`}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 20.5s-7.5-4.6-10-9.3C.4 8 1.8 4.5 5.2 3.6c2.1-.6 4.2.3 5.4 2.1l1.4 2 1.4-2c1.2-1.8 3.3-2.7 5.4-2.1 3.4.9 4.8 4.4 3.2 7.6-2.5 4.7-10 9.3-10 9.3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;
