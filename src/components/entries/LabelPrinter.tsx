"use client";
import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { 
  Printer, 
  Tag, 
  Check, 
  Package, 
  Calendar, 
  AlertCircle,
  Minus,
  Plus,
  Layers,
  FileText,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils";

interface LabelItem {
  id: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  name: string;
  internal_code: string;
  sale_price: number;
  products?: {
    name: string;
    internal_code: string;
    sale_price: number;
  };
}

interface PrintableLabel {
  id: string;
  batch_number: string;
  expiry_date: string;
  printQuantity: number;
  quantity: number;
  name: string;
  internal_code: string;
  sale_price: number;
  products?: {
    name: string;
    internal_code: string;
    sale_price: number;
  };
}

type PrintMode = "all" | "one-per-lot" | "custom";

export default function LabelPrinter({ labels }: { labels: LabelItem[] }) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [printMode, setPrintMode] = useState<PrintMode>("one-per-lot");
  const [printItems, setPrintItems] = useState<PrintableLabel[]>(() => 
    labels.map(item => ({
      ...item,
      printQuantity: 1,
      quantity: item.quantity,
    }))
  );

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (!labels || labels.length === 0) return null;

  const totalLabels = printItems.reduce((acc, curr) => acc + curr.printQuantity, 0);
  const totalImported = labels.reduce((acc, curr) => acc + curr.quantity, 0);

  const updatePrintQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > 999) return;
    const newItems = [...printItems];
    newItems[index].printQuantity = newQuantity;
    setPrintItems(newItems);
    setPrintMode("custom");
  };

  const handleModeChange = (mode: PrintMode) => {
    setPrintMode(mode);
    
    switch (mode) {
      case "all":
        setPrintItems(labels.map(item => ({
          ...item,
          printQuantity: item.quantity,
          quantity: item.quantity,
        })));
        break;
      case "one-per-lot":
        setPrintItems(labels.map(item => ({
          ...item,
          printQuantity: 1,
          quantity: item.quantity,
        })));
        break;
      case "custom":
        break;
    }
  };

  const resetQuantities = () => {
    setPrintMode("one-per-lot");
    setPrintItems(labels.map(item => ({
      ...item,
      printQuantity: 1,
      quantity: item.quantity,
    })));
  };

  const setAllQuantities = (quantity: number) => {
    setPrintMode("custom");
    setPrintItems(printItems.map(item => ({
      ...item,
      printQuantity: quantity,
    })));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header đơn giản */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
        <FileText className="h-4 w-4" />
        <span>Nhập hàng</span>
        <span>/</span>
        <span className="text-foreground">In tem</span>
      </div>

      {/* Card chính - bo góc nhẹ, không gradient */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">Nhập hàng thành công</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Đã nhập {totalImported} sản phẩm. Bạn có thể in tem dán với số lượng mong muốn.
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="h-7 px-3 gap-1.5 text-xs">
              <Tag className="h-3.5 w-3.5" />
              {totalLabels} tem
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Alert đơn giản, nhẹ nhàng */}
          <Alert className="bg-muted/30 border border-border/50 py-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-xs text-muted-foreground">
              Tem dán cần có: tên thuốc, số lô, hạn dùng và giá bán. In số lượng phù hợp với nhu cầu thực tế.
            </AlertDescription>
          </Alert>

          {/* Tabs đơn giản */}
          <Tabs value={printMode} onValueChange={(v) => handleModeChange(v as PrintMode)}>
            <div className="flex items-center justify-between">
              <TabsList className="h-9">
                <TabsTrigger value="one-per-lot" className="text-xs gap-1.5 h-8 px-3">
                  <Layers className="h-3.5 w-3.5" />
                  Mỗi lô 1 tem
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs gap-1.5 h-8 px-3">
                  <Package className="h-3.5 w-3.5" />
                  Theo số lượng
                </TabsTrigger>
                <TabsTrigger value="custom" className="text-xs gap-1.5 h-8 px-3">
                  <Settings2 className="h-3.5 w-3.5" />
                  Tùy chỉnh
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Select onValueChange={(v) => setAllQuantities(parseInt(v))}>
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Set số lượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" className="text-xs">0 tem</SelectItem>
                    <SelectItem value="1" className="text-xs">1 tem</SelectItem>
                    <SelectItem value="2" className="text-xs">2 tem</SelectItem>
                    <SelectItem value="3" className="text-xs">3 tem</SelectItem>
                    <SelectItem value="5" className="text-xs">5 tem</SelectItem>
                    <SelectItem value="10" className="text-xs">10 tem</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetQuantities}
                  className="h-8 text-xs px-3"
                >
                  Đặt lại
                </Button>
              </div>
            </div>

            <Separator className="my-3" />

            <TabsContent value={printMode} className="mt-0">
              {/* Bảng đơn giản, không màu nền */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-9 text-xs font-medium">Sản phẩm / Lô</TableHead>
                      <TableHead className="h-9 text-xs font-medium text-center">HSD</TableHead>
                      <TableHead className="h-9 text-xs font-medium text-center">Giá bán</TableHead>
                      <TableHead className="h-9 text-xs font-medium text-center">SL nhập</TableHead>
                      <TableHead className="h-9 text-xs font-medium text-center">Số tem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {printItems.map((item, idx) => {
                      const productInfo = item.products || {
                        name: item.name,
                        internal_code: item.internal_code,
                        sale_price: item.sale_price
                      };
                      
                      return (
                        <TableRow key={idx} className="text-sm">
                          <TableCell className="py-3">
                            <div className="space-y-1">
                              <span className="font-medium">{productInfo.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Lô: {item.batch_number}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {productInfo.internal_code}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {formatDate(item.expiry_date, "DD/MM/YY")}
                          </TableCell>
                          <TableCell className="text-center text-xs font-medium">
                            {formatPrice(productInfo.sale_price || 0)}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs bg-muted/50 px-2 py-0.5 rounded">
                              {item.quantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updatePrintQuantity(idx, item.printQuantity - 1)}
                                disabled={item.printQuantity <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min="0"
                                max="999"
                                value={item.printQuantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) updatePrintQuantity(idx, val);
                                }}
                                className="w-14 h-7 text-center text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updatePrintQuantity(idx, item.printQuantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer với thống kê và nút in */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{printItems.length} lô hàng</span>
              <span>{totalLabels} tem sẽ in</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-8 px-4 text-xs"
              >
                Nhập tiếp
              </Button>
              <Button
                onClick={() => handlePrint()}
                size="sm"
                disabled={totalLabels === 0}
                className="h-8 px-5 text-xs gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                In {totalLabels} tem
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VÙNG IN TEM (giữ nguyên) */}
      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-label-area">
          {printItems.flatMap((item, idx) => {
            const productInfo = item.products || {
              name: item.name,
              internal_code: item.internal_code,
              sale_price: item.sale_price
            };
            
            return Array.from({ length: item.printQuantity }).map((_, i) => (
              <div key={`${idx}-${i}`} className="label-page">
                <div className="label-content">
                  <div className="label-header">
                    <div className="label-name">{productInfo.name}</div>
                    <div className="label-code">{productInfo.internal_code}</div>
                  </div>
                  <div className="label-price">
                    {formatPrice(productInfo.sale_price || 0)}
                  </div>
                  <div className="label-footer">
                    <span>Lô: {item.batch_number}</span>
                    <span>HSD: {formatDate(item.expiry_date, "DD/MM/YY")}</span>
                  </div>
                </div>
              </div>
            ));
          })}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-label-area {
            margin: 0;
            padding: 2mm;
            display: flex;
            flex-wrap: wrap;
            gap: 1mm;
            background: white;
          }
          .label-page {
            width: 50mm;
            height: 30mm;
            padding: 1.5mm;
            page-break-inside: avoid;
            break-inside: avoid;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-sizing: border-box;
          }
          .label-content {
            width: 100%;
            height: 100%;
            border: 1px solid #000;
            border-radius: 2px;
            display: flex;
            flex-direction: column;
            background: white;
            padding: 2px;
          }
          .label-header {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 2px;
          }
          .label-name {
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            line-height: 1.2;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            padding: 0 2px;
            color: #000;
          }
          .label-code {
            font-size: 6pt;
            color: #666;
            font-family: monospace;
          }
          .label-price {
            font-size: 12pt;
            font-weight: 900;
            text-align: center;
            color: #d32f2f;
            padding: 2px 0;
            border-bottom: 1px dashed #ccc;
            letter-spacing: 0.5px;
          }
          .label-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 6pt;
            font-weight: 500;
            padding: 2px 4px 0;
            color: #333;
          }
          .label-footer span {
            background: #f5f5f5;
            padding: 1px 3px;
            border-radius: 2px;
          }
        }
      `}</style>
    </div>
  );
}