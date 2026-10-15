import React, { createContext, useContext, useEffect, useState } from "react";

interface FavoritesContextValue {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

const STORAGE_KEY = "mugan_favorites";

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function loadInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ids, setIds] = useState<string[]>(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const isFavorite = (id: string) => ids.includes(id);

  const toggleFavorite = (id: string) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  return (
    <FavoritesContext.Provider value={{ ids, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
