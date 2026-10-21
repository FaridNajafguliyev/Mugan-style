export function formatPrice(kopecks: number, priceFrom = true): string {
  const rubles = Math.round(kopecks / 100);
  const formatted = rubles.toLocaleString("ru-RU");
  return priceFrom ? `от ${formatted} ₽` : `${formatted} ₽`;
}

export function discountPercent(priceKopecks: number, oldPriceKopecks?: number): number | null {
  if (!oldPriceKopecks || oldPriceKopecks <= priceKopecks) return null;
  return Math.round((1 - priceKopecks / oldPriceKopecks) * 100);
}

const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";

// Cloudinary serves the exact file we uploaded unless the URL asks for a
// transform — product photos are ~1240x1656 originals, so a catalog card
// or thumbnail was downloading the full image just to shrink it in CSS.
// Inserting w_/q_auto/f_auto makes Cloudinary resize and compress on the
// fly (cached after the first request) instead.
export function cloudinaryResize(url: string, width: number): string {
  if (!url.includes(CLOUDINARY_UPLOAD_MARKER)) return url;
  return url.replace(CLOUDINARY_UPLOAD_MARKER, `${CLOUDINARY_UPLOAD_MARKER}w_${width},q_auto,f_auto/`);
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
