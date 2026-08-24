"use client";

import { Printer } from "lucide-react";

type PrintItem = {
  productName: string;
  quantity: number;
  price: number;
};

type PrintSale = {
  orderNumber: string | number;
  createdAt: string;
  total: number;
  items: PrintItem[];
};

type Props = {
  sales: PrintSale[];
  totalSales: number;
};

function formatDZD(value: number) {
  return new Intl.NumberFormat("ar-DZ", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function PrintSalesButton({
  sales,
  totalSales,
}: Props) {
  function handlePrint() {
    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800"
    );

    if (!printWindow) {
      alert(
        "تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة."
      );
      return;
    }

    const rows = sales
      .map((sale) => {
        const totalQuantity = sale.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const products = sale.items
          .map(
            (item) =>
              `${item.productName} × ${item.quantity}`
          )
          .join("<br />");

        const prices = sale.items
          .map(
            (item) =>
              `${formatDZD(item.price)} دج`
          )
          .join("<br />");

        return `
          <tr>
            <td class="order-number">
              #${sale.orderNumber}
            </td>

            <td>
              ${products || "لا توجد منتجات"}
            </td>

            <td class="center">
              ${totalQuantity}
            </td>

            <td>
              ${formatDate(sale.createdAt)}
            </td>

            <td>
              ${prices || "—"}
            </td>

            <td class="total">
              ${formatDZD(sale.total)} دج
            </td>
          </tr>
        `;
      })
      .join("");

    const printDate =
      new Intl.DateTimeFormat("ar-DZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());

    printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="ar" dir="rtl">

      <head>

        <meta charset="UTF-8" />

        <title>تقرير المبيعات</title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;
            direction: rtl;
            font-family:
              Arial,
              "Tahoma",
              sans-serif;
            color: #18181b;
            background: white;
          }

          .report {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
          }

          .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 18px;
            border-bottom: 2px solid #18181b;
          }

          .header h1 {
            margin: 0;
            font-size: 25px;
            font-weight: 700;
          }

          .header p {
            margin: 8px 0 0;
            color: #71717a;
            font-size: 13px;
          }

          .summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 18px;
            padding: 14px 18px;
            border: 1px solid #d4d4d8;
            border-radius: 10px;
            background: #fafafa;
          }

          .summary-label {
            font-size: 14px;
            font-weight: 600;
          }

          .summary-value {
            font-size: 19px;
            font-weight: 700;
            color: #047857;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          th {
            background: #f4f4f5;
            border: 1px solid #d4d4d8;
            padding: 11px 8px;
            font-size: 12px;
            font-weight: 700;
            text-align: right;
          }

          td {
            border: 1px solid #e4e4e7;
            padding: 10px 8px;
            font-size: 11px;
            line-height: 1.8;
            vertical-align: middle;
          }

          tr {
            page-break-inside: avoid;
          }

          .order-number {
            font-weight: 700;
          }

          .center {
            text-align: center;
          }

          .total {
            color: #047857;
            font-weight: 700;
          }

          .footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 2px solid #18181b;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-label {
            font-size: 16px;
            font-weight: 700;
          }

          .footer-value {
            font-size: 22px;
            font-weight: 700;
            color: #047857;
          }

          @media print {

            body {
              padding: 0;
            }

            .report {
              max-width: none;
            }

            @page {
              size: A4 landscape;
              margin: 12mm;
            }

          }

        </style>

      </head>

      <body>

        <div class="report">

          <div class="header">

            <h1>
              تقرير المبيعات
            </h1>

            <p>
              جميع الطلبات المسلّمة
            </p>

            <p>
              تاريخ الطباعة: ${printDate}
            </p>

          </div>

          <div class="summary">

            <span class="summary-label">
              عدد الطلبات المسلّمة
            </span>

            <span class="summary-value">
              ${sales.length} طلب
            </span>

          </div>

          <table>

            <thead>

              <tr>

                <th style="width: 13%">
                  رقم الطلب
                </th>

                <th style="width: 29%">
                  المنتجات
                </th>

                <th style="width: 9%">
                  العدد
                </th>

                <th style="width: 17%">
                  تاريخ الطلب
                </th>

                <th style="width: 17%">
                  سعر كل منتج
                </th>

                <th style="width: 15%">
                  المجموع
                </th>

              </tr>

            </thead>

            <tbody>

              ${rows}

            </tbody>

          </table>

          <div class="footer">

            <span class="footer-label">
              إجمالي المبيعات
            </span>

            <span class="footer-value">
              ${formatDZD(totalSales)} دج
            </span>

          </div>

        </div>

      </body>

      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();

      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 300);
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 active:scale-95"
    >
      <Printer size={16} />

      طباعة الطلبات
    </button>
  );
}