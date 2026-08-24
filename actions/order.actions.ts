"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ======================================================
// TYPES
// ======================================================

export type CreateOrderItemInput = {
  id: string;
  variantId: string | null;
  quantity: number;
};

export type CreateOrderInput = {
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  notes?: string;
  items: CreateOrderItemInput[];
};

// ======================================================
// HELPERS
// ======================================================

function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, "");
}

function isValidAlgerianPhone(phone: string) {
  return /^0[5-7][0-9]{8}$/.test(phone);
}

function calculateTotal(
  subtotal: number,
  shippingCost: number,
  discount: number
) {
  return subtotal + shippingCost - discount;
}

// ======================================================
// SYNC PRODUCT STOCK
// ======================================================

async function syncProductStock(
  tx: any,
  productId: string
) {
  const result = await tx.productVariant.aggregate({
    where: {
      productId,
    },

    _sum: {
      stock: true,
    },
  });

  const totalStock = result._sum.stock ?? 0;

  await tx.product.update({
    where: {
      id: productId,
    },

    data: {
      stock: totalStock,
    },
  });

  return totalStock;
}

// ======================================================
// FIND VARIANT
// ======================================================

async function findVariantBySelection(
  tx: any,
  productId: string,
  color: string | null,
  size: string | null
) {
  return tx.productVariant.findFirst({
    where: {
      productId,
      color,
      size,
    },
  });
}

// ======================================================
// RESERVE VARIANT STOCK
// ======================================================

async function reserveVariantStock(
  tx: any,
  variantId: string,
  quantity: number
) {
  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error("الكمية غير صحيحة.");
  }

  const updated = await tx.productVariant.updateMany({
    where: {
      id: variantId,

      stock: {
        gte: quantity,
      },
    },

    data: {
      stock: {
        decrement: quantity,
      },
    },
  });

  if (updated.count === 0) {
    const current = await tx.productVariant.findUnique({
      where: {
        id: variantId,
      },

      select: {
        stock: true,
      },
    });

    throw new Error(
      `الكمية المطلوبة غير متوفرة. المتاح حاليًا: ${
        current?.stock ?? 0
      }`
    );
  }
}

// ======================================================
// RESTORE VARIANT STOCK
// ======================================================

async function restoreVariantStock(
  tx: any,
  variantId: string,
  quantity: number
) {
  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return;
  }

  await tx.productVariant.update({
    where: {
      id: variantId,
    },

    data: {
      stock: {
        increment: quantity,
      },
    },
  });
}

// ======================================================
// RESERVE PRODUCT STOCK
// ======================================================

async function reserveProductStock(
  tx: any,
  productId: string,
  quantity: number
) {
  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error("الكمية غير صحيحة.");
  }

  const updated = await tx.product.updateMany({
    where: {
      id: productId,

      stock: {
        gte: quantity,
      },
    },

    data: {
      stock: {
        decrement: quantity,
      },
    },
  });

  if (updated.count === 0) {
    const current = await tx.product.findUnique({
      where: {
        id: productId,
      },

      select: {
        stock: true,
      },
    });

    throw new Error(
      `الكمية المطلوبة غير متوفرة. المتاح حاليًا: ${
        current?.stock ?? 0
      }`
    );
  }
}

// ======================================================
// RESTORE PRODUCT STOCK
// ======================================================

async function restoreProductStock(
  tx: any,
  productId: string,
  quantity: number
) {
  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return;
  }

  await tx.product.update({
    where: {
      id: productId,
    },

    data: {
      stock: {
        increment: quantity,
      },
    },
  });
}

// ======================================================
// RESTORE ORDER ITEM STOCK
// ======================================================

async function restoreOrderItemStock(
  tx: any,
  item: {
    productId: string;
    color: string | null;
    size: string | null;
    quantity: number;
  }
) {
  if (
    !Number.isInteger(item.quantity) ||
    item.quantity <= 0
  ) {
    return;
  }

  const product = await tx.product.findUnique({
    where: {
      id: item.productId,
    },

    include: {
      variants: true,
    },
  });

  if (!product) {
    throw new Error(
      "تعذر العثور على المنتج لإرجاع المخزون."
    );
  }

  if (product.variants.length > 0) {
    const variant = await findVariantBySelection(
      tx,
      item.productId,
      item.color,
      item.size
    );

    if (!variant) {
      throw new Error(
        "تعذر العثور على النسخة المرتبطة بالمنتج لإرجاع المخزون."
      );
    }

    await restoreVariantStock(
      tx,
      variant.id,
      item.quantity
    );

    await syncProductStock(
      tx,
      item.productId
    );

    return;
  }

  await restoreProductStock(
    tx,
    item.productId,
    item.quantity
  );
}

// ======================================================
// CREATE ORDER
// ======================================================

export async function createOrder(
  input: CreateOrderInput
) {
  try {
    if (!input.name?.trim()) {
      return {
        success: false,
        error: "يرجى إدخال الاسم الكامل.",
      };
    }

    if (!input.phone?.trim()) {
      return {
        success: false,
        error: "يرجى إدخال رقم الهاتف.",
      };
    }

    if (!input.wilaya?.trim()) {
      return {
        success: false,
        error: "يرجى اختيار الولاية.",
      };
    }

    if (!input.commune?.trim()) {
      return {
        success: false,
        error: "يرجى اختيار البلدية.",
      };
    }

    if (!input.address?.trim()) {
      return {
        success: false,
        error: "يرجى إدخال العنوان.",
      };
    }

    if (
      !input.items ||
      input.items.length === 0
    ) {
      return {
        success: false,
        error: "السلة فارغة.",
      };
    }

    const normalizedPhone =
      normalizePhone(input.phone);

    if (
      !isValidAlgerianPhone(
        normalizedPhone
      )
    ) {
      return {
        success: false,
        error:
          "يرجى إدخال رقم هاتف جزائري صحيح.",
      };
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          let subtotal = 0;

          const orderItemsData: {
            productId: string;
            productName: string;
            price: number;
            quantity: number;
            color: string | null;
            size: string | null;
          }[] = [];

          for (const cartItem of input.items) {
            if (
              !cartItem.id ||
              !Number.isInteger(
                cartItem.quantity
              ) ||
              cartItem.quantity <= 0
            ) {
              throw new Error(
                "بيانات أحد المنتجات غير صحيحة."
              );
            }

            const product =
              await tx.product.findUnique({
                where: {
                  id: cartItem.id,
                },

                include: {
                  variants: true,
                },
              });

            if (!product) {
              throw new Error(
                "أحد المنتجات الموجودة في السلة لم يعد موجودًا."
              );
            }

            if (!product.isActive) {
              throw new Error(
                `المنتج "${product.name}" غير متوفر حاليًا.`
              );
            }

            const variantId =
              cartItem.variantId?.trim() ||
              null;

            let selectedVariant = null;

            if (
              product.variants.length > 0
            ) {
              if (!variantId) {
                throw new Error(
                  `يرجى اختيار اللون والمقاس للمنتج "${product.name}".`
                );
              }

              selectedVariant =
                product.variants.find(
                  (variant) =>
                    variant.id ===
                    variantId
                );

              if (!selectedVariant) {
                throw new Error(
                  `النسخة المختارة من المنتج "${product.name}" غير موجودة.`
                );
              }

              await reserveVariantStock(
                tx,
                selectedVariant.id,
                cartItem.quantity
              );

              await syncProductStock(
                tx,
                product.id
              );
            } else {
              if (variantId) {
                throw new Error(
                  `المنتج "${product.name}" لا يحتوي على تنويعات.`
                );
              }

              await reserveProductStock(
                tx,
                product.id,
                cartItem.quantity
              );
            }

            const price =
              product.price;

            subtotal +=
              price *
              cartItem.quantity;

            orderItemsData.push({
              productId:
                product.id,

              productName:
                product.name,

              price,

              quantity:
                cartItem.quantity,

              color:
                selectedVariant?.color ??
                null,

              size:
                selectedVariant?.size ??
                null,
            });
          }

          const customer =
            await tx.customer.create({
              data: {
                name:
                  input.name.trim(),

                phone:
                  normalizedPhone,

                wilaya:
                  input.wilaya.trim(),

                commune:
                  input.commune.trim(),

                address:
                  input.address.trim(),

                notes:
                  input.notes?.trim() ||
                  null,
              },
            });

          const order =
            await tx.order.create({
              data: {
                customerId:
                  customer.id,

                status: "PENDING",

                subtotal,

                shippingCost: 0,

                discount: 0,

                total: subtotal,

                notes:
                  input.notes?.trim() ||
                  null,

                items: {
                  create:
                    orderItemsData,
                },
              },

              include: {
                items: true,
              },
            });

          return order;
        }
      );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin/dashboard"
    );

    revalidatePath(
      "/admin/settings"
    );

    return {
      success: true,

      orderId:
        result.id,

      orderNumber:
        result.orderNumber,

      total:
        result.total,
    };
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return {
      success: false,

      error:
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء إنشاء الطلب.",
    };
  }
}

// ======================================================
// GET ORDERS
// ======================================================

export async function getOrders() {
  const orders =
    await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        customer: true,

        items: {
          include: {
            product: true,
          },
        },
      },
    });

  return orders;
}

// ======================================================
// GET SINGLE ORDER
// ======================================================

export async function getOrderById(
  orderId: string
) {
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        customer: true,

        items: {
          include: {
            product: {
              include: {
                variants: {
                  orderBy: [
                    {
                      color: "asc",
                    },
                    {
                      size: "asc",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    });

  if (!order) {
    throw new Error(
      "الطلب غير موجود."
    );
  }

  return order;
}

// ======================================================
// CONFIRM ORDER
// PENDING → PROCESSING
// ======================================================

export async function confirmOrder(
  orderId: string
) {
  try {
    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      throw new Error(
        "الطلب غير موجود."
      );
    }

    if (
      order.status !== "PENDING"
    ) {
      throw new Error(
        "لا يمكن بدء توصيل هذا الطلب."
      );
    }

    await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: "PROCESSING",
      },
    });

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/dashboard"
    );

    revalidatePath(
      "/admin/settings"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "CONFIRM ORDER ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء تحديث الطلب."
    );
  }
}

// ======================================================
// DELIVER ORDER
// PROCESSING → DELIVERED
// ======================================================

export async function deliverOrder(
  orderId: string
) {
  try {
    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      throw new Error(
        "الطلب غير موجود."
      );
    }

    if (
      order.status !== "PROCESSING"
    ) {
      throw new Error(
        "يجب أن يكون الطلب قيد المعالجة قبل تسليمه."
      );
    }

    await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: "DELIVERED",
      },
    });

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/dashboard"
    );

    revalidatePath(
      "/admin/settings"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "DELIVER ORDER ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء تسليم الطلب."
    );
  }
}

// ======================================================
// RETURN DELIVERED ORDER TO PROCESSING
// DELIVERED → PROCESSING
// ======================================================

export async function returnOrderToProcessing(
  orderId: string
) {
  try {
    const order =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!order) {
      throw new Error(
        "الطلب غير موجود."
      );
    }

    if (
      order.status !== "DELIVERED"
    ) {
      throw new Error(
        "يمكن إرجاع الطلب فقط من حالة تم التسليم."
      );
    }

    await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        status: "PROCESSING",
      },
    });

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/dashboard"
    );

    revalidatePath(
      "/admin/settings"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "RETURN ORDER TO PROCESSING ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء إرجاع الطلب."
    );
  }
}

// ======================================================
// UPDATE ORDER ITEM
// ======================================================

export async function updateOrderItem(
  input: {
    orderId: string;
    itemId: string;
    productId: string;
    variantId?: string | null;
    color?: string | null;
    size?: string | null;
    quantity: number;
  }
) {
  try {
    if (
      !input.orderId ||
      !input.itemId
    ) {
      throw new Error(
        "بيانات الطلب غير صحيحة."
      );
    }

    if (!input.productId) {
      throw new Error(
        "يرجى اختيار المنتج."
      );
    }

    if (
      !Number.isInteger(
        input.quantity
      ) ||
      input.quantity <= 0
    ) {
      throw new Error(
        "الكمية يجب أن تكون أكبر من صفر."
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const order =
            await tx.order.findUnique({
              where: {
                id: input.orderId,
              },

              include: {
                items: true,
              },
            });

          if (!order) {
            throw new Error(
              "الطلب غير موجود."
            );
          }

          const oldItem =
            order.items.find(
              (item) =>
                item.id ===
                input.itemId
            );

          if (!oldItem) {
            throw new Error(
              "المنتج غير موجود داخل الطلب."
            );
          }

          const oldProduct =
            await tx.product.findUnique({
              where: {
                id: oldItem.productId,
              },

              include: {
                variants: true,
              },
            });

          if (!oldProduct) {
            throw new Error(
              "المنتج القديم غير موجود."
            );
          }

          const newProduct =
            await tx.product.findUnique({
              where: {
                id: input.productId,
              },

              include: {
                variants: true,
              },
            });

          if (!newProduct) {
            throw new Error(
              "المنتج الجديد غير موجود."
            );
          }

          if (!newProduct.isActive) {
            throw new Error(
              `المنتج "${newProduct.name}" غير متوفر حاليًا.`
            );
          }

          let oldVariant = null;

          if (
            oldProduct.variants
              .length > 0
          ) {
            oldVariant =
              await findVariantBySelection(
                tx,
                oldItem.productId,
                oldItem.color,
                oldItem.size
              );

            if (!oldVariant) {
              throw new Error(
                `تعذر تحديد النسخة القديمة "${oldItem.color ?? ""} ${oldItem.size ?? ""}" للمنتج "${oldProduct.name}".`
              );
            }
          }

          let newVariant = null;

          const requestedVariantId =
            input.variantId?.trim() ||
            null;

          if (
            newProduct.variants
              .length > 0
          ) {
            if (!requestedVariantId) {
              throw new Error(
                `يرجى اختيار النسخة المطلوبة من المنتج "${newProduct.name}".`
              );
            }

            newVariant =
              newProduct.variants.find(
                (variant) =>
                  variant.id ===
                  requestedVariantId
              );

            if (!newVariant) {
              throw new Error(
                "النسخة المختارة لا تنتمي إلى المنتج المحدد."
              );
            }
          } else {
            if (requestedVariantId) {
              throw new Error(
                "المنتج المحدد لا يحتوي على تنويعات."
              );
            }
          }

          const oldStockKey =
            oldVariant
              ? `variant:${oldVariant.id}`
              : `product:${oldItem.productId}`;

          const newStockKey =
            newVariant
              ? `variant:${newVariant.id}`
              : `product:${newProduct.id}`;

          const sameStock =
            oldStockKey ===
            newStockKey;

          if (sameStock) {
            const difference =
              input.quantity -
              oldItem.quantity;

            if (
              difference > 0
            ) {
              if (newVariant) {
                await reserveVariantStock(
                  tx,
                  newVariant.id,
                  difference
                );

                await syncProductStock(
                  tx,
                  newProduct.id
                );
              } else {
                await reserveProductStock(
                  tx,
                  newProduct.id,
                  difference
                );
              }
            } else if (
              difference < 0
            ) {
              const returned =
                Math.abs(
                  difference
                );

              if (newVariant) {
                await restoreVariantStock(
                  tx,
                  newVariant.id,
                  returned
                );

                await syncProductStock(
                  tx,
                  newProduct.id
                );
              } else {
                await restoreProductStock(
                  tx,
                  newProduct.id,
                  returned
                );
              }
            }
          } else {
            if (oldVariant) {
              await restoreVariantStock(
                tx,
                oldVariant.id,
                oldItem.quantity
              );

              await syncProductStock(
                tx,
                oldItem.productId
              );
            } else {
              await restoreProductStock(
                tx,
                oldItem.productId,
                oldItem.quantity
              );
            }

            if (newVariant) {
              await reserveVariantStock(
                tx,
                newVariant.id,
                input.quantity
              );

              await syncProductStock(
                tx,
                newProduct.id
              );
            } else {
              await reserveProductStock(
                tx,
                newProduct.id,
                input.quantity
              );
            }
          }

          const newColor =
            newVariant?.color ??
            input.color?.trim() ??
            null;

          const newSize =
            newVariant?.size ??
            input.size?.trim() ??
            null;

          const updatedItem =
            await tx.orderItem.update({
              where: {
                id: input.itemId,
              },

              data: {
                productId:
                  newProduct.id,

                productName:
                  newProduct.name,

                price:
                  newProduct.price,

                quantity:
                  input.quantity,

                color:
                  newColor,

                size:
                  newSize,
              },
            });

          const allItems =
            await tx.orderItem.findMany({
              where: {
                orderId:
                  input.orderId,
              },
            });

          const subtotal =
            allItems.reduce(
              (
                sum,
                item
              ) =>
                sum +
                item.price *
                  item.quantity,
              0
            );

          const total =
            calculateTotal(
              subtotal,
              order.shippingCost,
              order.discount
            );

          await tx.order.update({
            where: {
              id: input.orderId,
            },

            data: {
              subtotal,
              total,
            },
          });

          return updatedItem;
        }
      );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      `/admin/orders/${input.orderId}`
    );

    revalidatePath(
      "/admin/dashboard"
    );

    revalidatePath(
      "/admin/settings"
    );

    return {
      success: true,

      item: result,
    };
  } catch (error) {
    console.error(
      "UPDATE ORDER ITEM ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء تعديل المنتج."
    );
  }
}

// ======================================================
// DELETE ORDER ITEM
// ======================================================

export async function deleteOrderItem(
  orderId: string,
  itemId: string
) {
  try {
    await prisma.$transaction(
      async (tx) => {
        const order =
          await tx.order.findUnique({
            where: {
              id: orderId,
            },

            include: {
              items: true,
            },
          });

        if (!order) {
          throw new Error(
            "الطلب غير موجود."
          );
        }

        const item =
          order.items.find(
            (currentItem) =>
              currentItem.id ===
              itemId
          );

        if (!item) {
          throw new Error(
            "المنتج غير موجود داخل الطلب."
          );
        }

        if (
          order.items.length === 1
        ) {
          throw new Error(
            "لا يمكن حذف آخر منتج من الطلب. احذف الطلب بالكامل بدلًا من ذلك."
          );
        }

        await restoreOrderItemStock(
          tx,
          {
            productId:
              item.productId,

            color:
              item.color,

            size:
              item.size,

            quantity:
              item.quantity,
          }
        );

        await tx.orderItem.delete({
          where: {
            id: itemId,
          },
        });

        const remainingItems =
          await tx.orderItem.findMany({
            where: {
              orderId,
            },
          });

        const subtotal =
          remainingItems.reduce(
            (
              sum,
              currentItem
            ) =>
              sum +
              currentItem.price *
                currentItem.quantity,
            0
          );

        const total =
          calculateTotal(
            subtotal,
            order.shippingCost,
            order.discount
          );

        await tx.order.update({
          where: {
            id: orderId,
          },

          data: {
            subtotal,
            total,
          },
        });
      }
    );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      `/admin/orders/${orderId}`
    );

    revalidatePath(
      "/admin/dashboard"
    );

    revalidatePath(
      "/admin/settings"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "DELETE ORDER ITEM ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء حذف المنتج."
    );
  }
}

// ======================================================
// UPDATE CUSTOMER
// ======================================================

export async function updateOrderCustomer(
  input: {
    orderId: string;
    name: string;
    phone: string;
    wilaya: string;
    commune: string;
    address: string;
    notes?: string;
  }
) {
  try {
    if (!input.name?.trim()) {
      throw new Error(
        "يرجى إدخال اسم العميل."
      );
    }

    if (!input.phone?.trim()) {
      throw new Error(
        "يرجى إدخال رقم الهاتف."
      );
    }

    const normalizedPhone =
      normalizePhone(
        input.phone
      );

    if (
      !isValidAlgerianPhone(
        normalizedPhone
      )
    ) {
      throw new Error(
        "يرجى إدخال رقم هاتف جزائري صحيح."
      );
    }

    if (!input.wilaya?.trim()) {
      throw new Error(
        "يرجى إدخال الولاية."
      );
    }

    if (!input.commune?.trim()) {
      throw new Error(
        "يرجى إدخال البلدية."
      );
    }

    if (!input.address?.trim()) {
      throw new Error(
        "يرجى إدخال العنوان."
      );
    }

    const order =
      await prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
      });

    if (!order) {
      throw new Error(
        "الطلب غير موجود."
      );
    }

    await prisma.customer.update({
      where: {
        id: order.customerId,
      },

      data: {
        name:
          input.name.trim(),

        phone:
          normalizedPhone,

        wilaya:
          input.wilaya.trim(),

        commune:
          input.commune.trim(),

        address:
          input.address.trim(),

        notes:
          input.notes?.trim() ||
          null,
      },
    });

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      `/admin/orders/${input.orderId}`
    );

    revalidatePath(
      "/admin/dashboard"
    );

    revalidatePath(
      "/admin/settings"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "UPDATE CUSTOMER ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء تعديل بيانات العميل."
    );
  }
}

// ======================================================
// DELETE ORDER
// ======================================================

export async function deleteOrder(
  orderId: string
) {
  try {
    await prisma.$transaction(
      async (tx) => {
        const order =
          await tx.order.findUnique({
            where: {
              id: orderId,
            },

            include: {
              items: true,
            },
          });

        if (!order) {
          throw new Error(
            "الطلب غير موجود."
          );
        }

        for (
          const item of order.items
        ) {
          await restoreOrderItemStock(
            tx,
            {
              productId:
                item.productId,

              color:
                item.color,

              size:
                item.size,

              quantity:
                item.quantity,
            }
          );
        }

        await tx.order.delete({
          where: {
            id: orderId,
          },
        });
      }
    );

    revalidatePath(
      "/admin/orders"
    );

    revalidatePath(
      "/admin/dashboard"
    );

    revalidatePath(
      "/admin/settings"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "DELETE ORDER ERROR:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "حدث خطأ أثناء حذف الطلب."
    );
  }
}

// ======================================================
// DASHBOARD / SALES SUMMARY
// ======================================================
//
// المبيعات تعتمد فقط على الطلبات DELIVERED.
// لا يوجد أي تعديل على Prisma.
//
// تُرجع الدالة:
// - totalSales
// - deliveredOrders
// - totalOrders
// - averageOrderValue
// - monthlySales
// - recentSales
//
// ======================================================

export async function getSalesSummary() {
  const [
    salesAggregate,
    totalOrders,
    recentOrders,
    deliveredOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: "DELIVERED",
      },

      _sum: {
        total: true,
      },

      _count: {
        id: true,
      },
    }),

    prisma.order.count(),

    prisma.order.findMany({
      where: {
        status: "DELIVERED",
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 10,

      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,

        customer: {
          select: {
            name: true,
          },
        },

        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            price: true,
            color: true,
            size: true,
          },
        },
      },
    }),

    prisma.order.findMany({
      where: {
        status: "DELIVERED",
      },

      select: {
        total: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const totalSales =
    salesAggregate._sum.total ?? 0;

  const deliveredCount =
    salesAggregate._count.id ?? 0;

  const averageOrderValue =
    deliveredCount > 0
      ? totalSales / deliveredCount
      : 0;

  // ====================================================
  // MONTHLY SALES
  // ====================================================

  const months = [
    "جانفي",
    "فيفري",
    "مارس",
    "أفريل",
    "ماي",
    "جوان",
    "جويلية",
    "أوت",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const monthlySales = months.map(
    (month) => ({
      month,
      orders: 0,
      sales: 0,
    })
  );

  for (const order of deliveredOrders) {
    const monthIndex =
      order.createdAt.getMonth();

    monthlySales[monthIndex].orders += 1;

    monthlySales[monthIndex].sales +=
      order.total;
  }

  // ====================================================
  // RECENT SALES
  // ====================================================
  //
  // هنا نرجع الطلب نفسه مع:
  // - رقم الطلب
  // - اسم العميل
  // - السعر الإجمالي
  // - تاريخ الطلب
  // - المنتجات
  //
  // حتى تستطيع SettingsPage عرض:
  // الطلب #123
  // العميل: أحمد
  // السعر: 5,000 دج
  //
  // ====================================================

  const recentSales = recentOrders.map(
    (order) => ({
      id: order.id,

      orderNumber:
        order.orderNumber,

      customerName:
        order.customer?.name ??
        "عميل غير معروف",

      total:
        order.total,

      createdAt:
        order.createdAt,

      items:
        order.items,
    })
  );

  return {
    totalSales,

    deliveredOrders:
      deliveredCount,

    totalOrders,

    averageOrderValue,

    monthlySales,

    recentSales,
  };
}

// ======================================================
// DASHBOARD STATS
// ======================================================

export async function getDashboardStats() {
  const [
    products,
    orders,
    categories,
    stock,
    sales,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.order.count(),

    prisma.category.count(),

    prisma.product.aggregate({
      _sum: {
        stock: true,
      },
    }),

    prisma.order.aggregate({
      where: {
        status: "DELIVERED",
      },

      _sum: {
        total: true,
      },

      _count: {
        id: true,
      },
    }),
  ]);

  return {
    products,

    orders,

    categories,

    stock:
      stock._sum.stock ?? 0,

    totalSales:
      sales._sum.total ?? 0,

    deliveredOrders:
      sales._count.id ?? 0,
  };
}

// ======================================================
// RECENT ORDERS
// ======================================================

export async function getRecentOrders(
  limit = 5
) {
  const orders =
    await prisma.order.findMany({
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,

        customer: {
          select: {
            name: true,
          },
        },
      },
    });

  return orders;
}

// ======================================================
// TOP PRODUCTS
// ======================================================
//
// نحسب المنتجات الأكثر مبيعًا اعتمادًا على DELIVERED فقط.
// ======================================================

export async function getTopSellingProducts(
  limit = 5
) {
  const items =
    await prisma.orderItem.findMany({
      where: {
        order: {
          status: "DELIVERED",
        },
      },

      select: {
        productId: true,
        productName: true,
        price: true,
        quantity: true,
      },
    });

  const productsMap =
    new Map<
      string,
      {
        productId: string;
        productName: string;
        quantity: number;
        sales: number;
      }
    >();

  for (const item of items) {
    const existing =
      productsMap.get(
        item.productId
      );

    if (existing) {
      existing.quantity +=
        item.quantity;

      existing.sales +=
        item.price *
        item.quantity;
    } else {
      productsMap.set(
        item.productId,
        {
          productId:
            item.productId,

          productName:
            item.productName,

          quantity:
            item.quantity,

          sales:
            item.price *
            item.quantity,
        }
      );
    }
  }

  return Array.from(
    productsMap.values()
  )
    .sort(
      (a, b) =>
        b.quantity -
        a.quantity
    )
    .slice(0, limit);
}

// ======================================================
// MONTHLY SALES / ORDERS
// ======================================================

export async function getMonthlySales() {
  const orders =
    await prisma.order.findMany({
      where: {
        status: "DELIVERED",
      },

      select: {
        total: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  const months = [
    "جانفي",
    "فيفري",
    "مارس",
    "أفريل",
    "ماي",
    "جوان",
    "جويلية",
    "أوت",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const data = months.map(
    (month) => ({
      month,
      orders: 0,
      sales: 0,
    })
  );

  for (const order of orders) {
    const monthIndex =
      order.createdAt.getMonth();

    data[monthIndex].orders += 1;

    data[monthIndex].sales +=
      order.total;
  }

  return data;
}

// ======================================================
// COMPLETE DASHBOARD DATA
// ======================================================

export async function getDashboardData() {
  const [
    stats,
    recentOrders,
    topProducts,
    monthlySales,
  ] = await Promise.all([
    getDashboardStats(),

    getRecentOrders(5),

    getTopSellingProducts(5),

    getMonthlySales(),
  ]);

  return {
    stats,

    recentOrders,

    topProducts,

    monthlySales,
  };
}