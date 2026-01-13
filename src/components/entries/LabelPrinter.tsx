"use client";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Tag, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export default function LabelPrinter({ labels }: { labels: any[] }) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (!labels || labels.length === 0) return null;

  return (
    <div className="mt-6 p-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Nhập hàng thành công!</h3>
            <p className="text-sm text-muted-foreground font-sans">
              Chú nên in tem dán ngay để đảm bảo quy định y tế.
            </p>
          </div>
        </div>
        
        <Button onClick={() => handlePrint()} size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg font-bold">
          <Printer className="mr-2 h-5 w-5" /> IN {labels.reduce((acc, curr) => acc + Number(curr.quantity), 0)} TEM DÁN
        </Button>
      </div>

      {/* VÙNG IN TEM (BỊ ẨN TRÊN MÀN HÌNH) */}
      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-label-area">
          {labels.map((item, idx) => (
            // Tạo số lượng tem dựa trên số lượng thuốc đã nhập
            Array.from({ length: Number(item.quantity) }).map((_, i) => (
              <div key={`${idx}-${i}`} className="label-page">
                <div className="label-content">
                  <div className="label-header">{item.name}</div>
                  <div className="label-price">{formatPrice(item.price)}</div>
                  <div className="label-footer">
                    <span>Lô: {item.batch}</span>
                    <span>HSD: {item.expiry}</span>
                  </div>
                </div>
              </div>
            ))
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .print-label-area { margin: 0; padding: 0; }
          .label-page {
            width: 35mm;  /* Chiều rộng tem */
            height: 22mm; /* Chiều cao tem */
            padding: 1.5mm;
            page-break-after: always;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: sans-serif;
            box-sizing: border-box;
          }
          .label-content {
            width: 100%;
            height: 100%;
            border: 0.1mm solid #ccc;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .label-header {
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            line-height: 1.1;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .label-price {
            font-size: 11pt;
            font-weight: 900;
            text-align: center;
            color: black;
          }
          .label-footer {
            display: flex;
            justify-content: space-between;
            font-size: 5pt;
            font-weight: bold;
            border-top: 0.1mm solid black;
            padding-top: 0.5mm;
          }
        }
      `}</style>
    </div>
  );
}