export function kopecksToRublesString(kopecks: number): string {
  return (kopecks / 100).toFixed(2);
}

export function rublesStringToKopecks(rubles: string): number {
  return Math.round(parseFloat(rubles) * 100);
}

export function formatRubles(kopecks: number): string {
  const rubles = Math.round(kopecks / 100);
  return `${rubles.toLocaleString("ru-RU")} ₽`;
}
