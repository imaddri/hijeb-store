export const shippingRates: Record<string, number> = {
  // ضع أسعار الولايات هنا
  // مثال:
  // "01": 400,
  // "02": 500,
  // "03": 500,

  "16": 400,
  "39": 600,
  "07": 500,
  "30": 700,
};

export function getShippingCost(
  wilayaCode: string
): number {
  return shippingRates[wilayaCode] ?? 0;
}