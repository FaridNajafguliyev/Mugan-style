export interface Product {
  id: string;
  category: "dublenka" | "jacket" | "coat";
  categoryLabel: string;
  title: string;
  material: string;
  lining: string;
  sizes: string;
  price: string;
  description: string;
  images: string[];
}

export const products: Product[] = [
  {
    id: "raven-biker",
    category: "dublenka",
    categoryLabel: "Дублёнка",
    title: "Raven",
    material: "Натуральная кожа",
    lining: "Овчина, цвет тауп",
    sizes: "42–52",
    price: "от 89 000 ₽",
    description:
      "Косая молния, объёмный воротник из стриженой овчины и широкие манжеты. Силуэт в стиле байкерской куртки, вытянутый в элегантное пальто длиной до середины бедра.",
    images: [
      "/images/coat-black-01-front.jpg",
      "/images/coat-black-01-hood.jpg",
      "/images/coat-black-01-back.jpg",
    ],
  },
  {
    id: "kupol-parka",
    category: "dublenka",
    categoryLabel: "Дублёнка",
    title: "Kupol",
    material: "Замша",
    lining: "Овчина, цвет молочный",
    sizes: "44–54",
    price: "от 76 000 ₽",
    description:
      "Короткая дублёнка-парка на завязках с капюшоном, отделанным мехом. Свободный крой для слоёных образов и морозов до −25°.",
    images: [
      "/images/coat-brown-01-front.jpg",
      "/images/coat-brown-01-hood.jpg",
      "/images/coat-brown-01-back.jpg",
    ],
  },
  {
    id: "noch-maxi",
    category: "coat",
    categoryLabel: "Дублёнка",
    title: "Noch",
    material: "Замша",
    lining: "Овчина, цвет тауп",
    sizes: "42–54",
    price: "от 112 000 ₽",
    description:
      "Длинное пальто в пол с контрастной меховой окантовкой швов и капюшоном на кулиске. Самая тёплая модель коллекции — для статусных зимних выходов.",
    images: [
      "/images/coat-black-long-01.jpg",
      "/images/coat-black-long-02.jpg",
      "/images/coat-black-long-03.jpg",
    ],
  },
  {
    id: "yantar-classic",
    category: "coat",
    categoryLabel: "Дублёнка",
    title: "Yantar",
    material: "Замша",
    lining: "Овчина, цвет молочный",
    sizes: "42–52",
    price: "от 118 000 ₽",
    description:
      "Классическое пальто карамельного оттенка с архитектурной строчкой-кантом и крупными пуговицами из натурального рога. Вневременной крой для тех, кто выбирает спокойную роскошь.",
    images: [
      "/images/coat-camel-01.jpg",
      "/images/coat-camel-02.jpg",
      "/images/coat-camel-03.jpg",
    ],
  },
  {
    id: "grom-moto",
    category: "jacket",
    categoryLabel: "Дублёнка",
    title: "Grom",
    material: "Натуральная кожа",
    lining: "Норка, цвет чёрный",
    sizes: "42–50",
    price: "от 134 000 ₽",
    description:
      "Короткая байкерская куртка с воротником и манжетами из меха норки. Дерзкий силуэт для города — сочетается с кожаными брюками и высокими ботинками.",
    images: [
      "/images/jacket-black-moto-01.jpg",
      "/images/jacket-black-moto-02.jpg",
      "/images/jacket-black-back.jpg",
    ],
  },
  {
    id: "polyus-oversize",
    category: "jacket",
    categoryLabel: "Дублёнка",
    title: "Polyus",
    material: "Натуральная кожа, овчина",
    lining: "Стриженая овчина, цвет чёрный",
    sizes: "Oversize, 42–56",
    price: "от 98 000 ₽",
    description:
      "Объёмная куртка-бомбер с капюшоном и кокеткой из стриженой овчины. Спортивный силуэт, который носят оверсайз поверх тёплого свитера.",
    images: [
      "/images/jacket-black-oversize-01.jpg",
      "/images/jacket-black-oversize-02.jpg",
    ],
  },
  {
    id: "tsarska-fox",
    category: "coat",
    categoryLabel: "Дублёнка",
    title: "Tsarska",
    material: "Натуральная кожа",
    lining: "Мех чернобурой лисы",
    sizes: "42–52",
    price: "от 156 000 ₽",
    description:
      "Приталенное пальто с массивным воротником из меха чернобурой лисы. Самая статусная модель: ручная работа, плотная подкладка и крой, подчёркивающий силуэт.",
    images: [
      "/images/coat-fox-collar-01.jpg",
      "/images/coat-fox-collar-02.jpg",
      "/images/coat-fox-collar-03.jpg",
    ],
  },
];

export const categories = [
  { key: "all", label: "Все модели" },
  { key: "dublenka", label: "Дублёнки" },
  { key: "coat", label: "Пальто" },
  { key: "jacket", label: "Куртки" },
] as const;
