export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "حجاب حريري فاخر",
    category: "حجابات",
    price: 1800,
    badge: "جديد",
    image: "/images/products/hijab-1.jpg",
  },

  {
    id: 2,
    name: "عباية سوداء كلاسيكية",
    category: "عبايات",
    price: 8500,
    oldPrice: 10000,
    badge: "خصم",
    image: "/images/products/abaya-1.jpg",
  },

  {
    id: 3,
    name: "خمار شرعي أنيق",
    category: "خمارات",
    price: 3200,
    badge: "جديد",
    image: "/images/products/khimar-1.jpg",
  },

  {
    id: 4,
    name: "حجاب كريب فاخر",
    category: "حجابات",
    price: 2200,
    image: "/images/products/hijab-2.jpg",
  },

  {
    id: 5,
    name: "عباية مطرزة",
    category: "عبايات",
    price: 12000,
    oldPrice: 14500,
    badge: "عرض",
    image: "/images/products/abaya-2.jpg",
  },

  {
    id: 6,
    name: "خمار واسع Premium",
    category: "خمارات",
    price: 4500,
    badge: "جديد",
    image: "/images/products/khimar-2.jpg",
  },
];