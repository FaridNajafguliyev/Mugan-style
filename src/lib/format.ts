export function formatPrice(kopecks: number, priceFrom = true): string {
  const rubles = Math.round(kopecks / 100);
  const formatted = rubles.toLocaleString("ru-RU");
  return priceFrom ? `от ${formatted} ₽` : `${formatted} ₽`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
