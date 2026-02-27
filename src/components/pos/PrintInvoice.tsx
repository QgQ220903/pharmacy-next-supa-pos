"use client";

import React from "react";
import { formatPrice, formatDate } from "@/lib/utils";

interface PrintInvoiceProps {
  data: {
    saleCode: string;
    items: any[];
    customerName?: string;
    customerPhone?: string;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    paymentMethod: string;
    date: Date;
  } | null;
}

export const PrintInvoice = React.forwardRef<HTMLDivElement, PrintInvoiceProps>(
  ({ data }, ref) => {
    if (!data) return null;

    return (
      <div style={{ display: "none" }}>
        <div ref={ref} className="p-4 text-black font-mono text-[11px] w-[80mm] bg-white">
          {/* Header */}
          <div className="text-center mb-4 pb-2 border-b border-black">
            <h2 className="text-base font-bold uppercase">NHÀ THUỐC PHARMA</h2>
            <p className="text-[9px]">123 Đường ABC, Quận XYZ</p>
            <p className="text-[9px]">ĐT: 0123 456 789</p>
          </div>

          {/* Thông tin hóa đơn */}
          <div className="mb-3 text-[10px]">
            <p>Mã HD: {data.saleCode}</p>
            <p>Ngày: {formatDate(data.date, "DD/MM/YYYY HH:mm")}</p>
            {data.customerName && <p>Khách: {data.customerName}</p>}
            {data.customerPhone && <p>SĐT: {data.customerPhone}</p>}
            <p>PTTT: {data.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}</p>
          </div>

          {/* Chi tiết sản phẩm */}
          <table className="w-full mb-3 text-[10px]">
            <thead>
              <tr className="border-t border-b border-black">
                <th className="text-left py-1">Tên thuốc</th>
                <th className="text-center py-1">SL</th>
                <th className="text-right py-1">Đơn giá</th>
                <th className="text-right py-1">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-dashed border-gray-300">
                  <td className="py-2 pr-2">
                    <div className="font-medium">{item.name}</div>
                    {item.selected_batches?.[0]?.batch_number && (
                      <div className="text-[8px] text-gray-600">
                        Lô: {item.selected_batches[0].batch_number}
                      </div>
                    )}
                  </td>
                  <td className="text-center py-2">
                    {item.quantity} {item.unit_name}
                  </td>
                  <td className="text-right py-2">
                    {formatPrice(item.sale_price)}
                  </td>
                  <td className="text-right py-2 font-medium">
                    {formatPrice(item.quantity * item.sale_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Tổng kết */}
          <div className="text-right space-y-1 text-[10px]">
            <p className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatPrice(data.totalAmount)}</span>
            </p>
            {data.discount > 0 && (
              <p className="flex justify-between text-red-600">
                <span>Giảm giá:</span>
                <span>-{formatPrice(data.discount)}</span>
              </p>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-black">
              <span>TỔNG CỘNG:</span>
              <span>{formatPrice(data.finalAmount)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-[9px] italic">
            <p>Cảm ơn quý khách và hẹn gặp lại!</p>
            <p className="mt-1">(Hàng đã bán không đổi trả)</p>
          </div>
        </div>
      </div>
    );
  }
);

PrintInvoice.displayName = "PrintInvoice";