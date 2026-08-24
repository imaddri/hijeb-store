"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ============================================================
// CART ITEM
// ============================================================

export type CartItem = {
  id: string;

  name: string;

  price: number;

  image: string;

  color: string;

  size: string;

  variantId: string | null;

  quantity: number;
};

// ============================================================
// CONTEXT TYPE
// ============================================================

type CartContextType = {
  cart: CartItem[];

  addToCart: (
    item: CartItem
  ) => void;

  removeFromCart: (
    id: string,
    color: string,
    size: string
  ) => void;

  updateQuantity: (
    id: string,
    color: string,
    size: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  cartCount: number;

  cartTotal: number;
};

// ============================================================
// CONTEXT
// ============================================================

const CartContext = createContext<
  CartContextType | undefined
>(undefined);

// ============================================================
// STORAGE
// ============================================================

const CART_STORAGE_KEY =
  "hijab-store-cart";

// ============================================================
// PROVIDER
// ============================================================

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {

  // ==========================================================
  // INITIAL CART
  // ==========================================================

  const [cart, setCart] =
    useState<CartItem[]>(() => {

      if (
        typeof window ===
        "undefined"
      ) {
        return [];
      }

      try {

        const savedCart =
          window.localStorage.getItem(
            CART_STORAGE_KEY
          );

        if (!savedCart) {
          return [];
        }

        const parsedCart =
          JSON.parse(savedCart);

        if (
          !Array.isArray(
            parsedCart
          )
        ) {
          return [];
        }

        // ----------------------------------------------------
        // Compatibility with old cart data
        // ----------------------------------------------------

        return parsedCart.map(
          (item) => ({
            ...item,

            // Old items may not have variantId
            variantId:
              item.variantId ??
              null,
          })
        );

      } catch (error) {

        console.error(
          "خطأ أثناء قراءة السلة:",
          error
        );

        return [];
      }
    });

  // ==========================================================
  // SAVE CART
  // ==========================================================

  useEffect(() => {

    try {

      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );

    } catch (error) {

      console.error(
        "خطأ أثناء حفظ السلة:",
        error
      );

    }

  }, [cart]);

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  function addToCart(
    item: CartItem
  ) {

    setCart(
      (currentCart) => {

        const existingItem =
          currentCart.find(
            (cartItem) => {

              // If both items have a variant,
              // use variantId as the strongest match.

              if (
                item.variantId &&
                cartItem.variantId
              ) {
                return (
                  cartItem.variantId ===
                  item.variantId
                );
              }

              // Fallback for products
              // without variants.

              return (
                cartItem.id ===
                  item.id &&
                cartItem.color ===
                  item.color &&
                cartItem.size ===
                  item.size
              );
            }
          );

        // ====================================================
        // EXISTING
        // ====================================================

        if (existingItem) {

          return currentCart.map(
            (cartItem) => {

              const sameItem =
                item.variantId &&
                cartItem.variantId
                  ? cartItem.variantId ===
                    item.variantId
                  : cartItem.id ===
                      item.id &&
                    cartItem.color ===
                      item.color &&
                    cartItem.size ===
                      item.size;

              if (!sameItem) {
                return cartItem;
              }

              return {
                ...cartItem,

                quantity:
                  cartItem.quantity +
                  item.quantity,
              };
            }
          );
        }

        // ====================================================
        // NEW
        // ====================================================

        return [
          ...currentCart,
          item,
        ];
      }
    );
  }

  // ==========================================================
  // REMOVE
  // ==========================================================

  function removeFromCart(
    id: string,
    color: string,
    size: string
  ) {

    setCart(
      (currentCart) =>
        currentCart.filter(
          (item) =>
            !(
              item.id === id &&
              item.color === color &&
              item.size === size
            )
        )
    );
  }

  // ==========================================================
  // UPDATE QUANTITY
  // ==========================================================

  function updateQuantity(
    id: string,
    color: string,
    size: string,
    quantity: number
  ) {

    if (quantity <= 0) {

      removeFromCart(
        id,
        color,
        size
      );

      return;
    }

    setCart(
      (currentCart) =>
        currentCart.map(
          (item) => {

            if (
              item.id === id &&
              item.color ===
                color &&
              item.size === size
            ) {

              return {
                ...item,
                quantity,
              };
            }

            return item;
          }
        )
    );
  }

  // ==========================================================
  // CLEAR
  // ==========================================================

  function clearCart() {
    setCart([]);
  }

  // ==========================================================
  // CART COUNT
  // ==========================================================

  const cartCount =
    cart.reduce(
      (total, item) =>
        total +
        item.quantity,
      0
    );

  // ==========================================================
  // CART TOTAL
  // ==========================================================

  const cartTotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
          item.quantity,
      0
    );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <CartContext.Provider
      value={{
        cart,

        addToCart,

        removeFromCart,

        updateQuantity,

        clearCart,

        cartCount,

        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ============================================================
// USE CART
// ============================================================

export function useCart() {

  const context =
    useContext(
      CartContext
    );

  if (!context) {

    throw new Error(
      "useCart يجب أن يستخدم داخل CartProvider"
    );

  }

  return context;
}