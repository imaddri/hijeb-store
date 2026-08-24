"use client";

import { CartProvider } from "@/context/CartContext";

interface Props {
  children: React.ReactNode;
}

export default function Providers({ children }: Props) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}