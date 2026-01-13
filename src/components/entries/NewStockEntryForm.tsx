"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductSearch } from "@/components/products/ProductSearch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Save,
  ArrowLeft,
  Layers,
  Package,
  Truck,
  FileText,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { createStockEntryAction } from "@/app/actions/inventory";
import { toast } from "sonner";
import { Product } from "@/types";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import LabelPrinter from "@/components/entries/LabelPrinter";

export default function NewStockEntryForm({
  products = [],
}: {
  products: Product[];
}) {
  const router = useRouter();
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [printData, setPrintData] = useState<any[]>([]); 
  const [isSuccess, setIsSuccess] = useState(false); 

  const addItem = (p: Product) => {
    if (items.find((i) => i.product_id === p.id)) {
      return toast.warning("Sản phẩm đã có trong danh sách");
    }
    setItems([
      ...items,
      {
        product_id: p.id,
        name: p.name,
        unit: p.unit,
        quantity: 1,
        unit_price: p.cost_price || 0,
        sale_price: p.sale_price || 0,
        manage_by_batch: p.manage_by_batch,
        batch_number: "",
        expiry_date: "",
      },
    ]);
  };

  const updateItem = (index: number, key: string, val: any) => {
    const newItems = [...items];
    newItems[index][key] = val;
    setItems(newItems);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const handleSave = async () => {
    if (!supplier.trim()) return toast.error("Vui lòng nhập tên Nhà cung cấp");
    if (items.length === 0) return toast.error("Vui lòng thêm ít nhất 1 sản phẩm");

    for (const item of items) {
      if (item.quantity <= 0) return toast.error(`Sản phẩm "${item.name}" không hợp lệ`);
      if (item.manage_by_batch && (!item.batch_number || !item.expiry_date)) {
        return toast.error(`Sản phẩm "${item.name}" yêu cầu Số lô và Hạn dùng`);
      }
    }

    setLoading(true);
    try {
      const result = await createStockEntryAction({
        supplier,
        notes,
        total_amount: totalAmount,
        items,
        entry_code: `PN${Date.now().toString().slice(-8)}`,
        entry_date: new Date().toISOString(),
      });

      if (result.success) {
        toast.success("Đã nhập kho thành công");
        if (result.printData && result.printData.length > 0) {
          setPrintData(result.printData);
          setIsSuccess(true);
        } else {
          router.push("/entries");
          router.refresh();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu phiếu");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <Card className="border-green-500 shadow-lg">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Nhập hàng hoàn tất!</h2>
              <p className="text-muted-foreground">Chú nên in tem dán sản phẩm ngay để tránh bị phạt khi kiểm tra y tế.</p>
            </div>
            
            <Separator />
            
            <LabelPrinter labels={printData} />

            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={() => {
                router.push("/entries");
                router.refresh();
              }}>
                Quay về danh sách
              </Button>
              <Button onClick={() => window.location.reload()}>
                Tiếp tục nhập đơn mới
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Tạo phiếu nhập</h1>
            <p className="text-sm text-muted-foreground">Thêm sản phẩm và cập nhật tồn kho</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Tổng tiền hàng</div>
            <div className="text-xl font-bold">{formatPrice(totalAmount)}</div>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Đang xử lý..." : "Hoàn tất"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" /> 
                Thông tin đối tác
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nhà cung cấp <span className="text-destructive">*</span></Label>
                <Input 
                  placeholder="Nhập tên nhà cung cấp..." 
                  value={supplier} 
                  onChange={(e) => setSupplier(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea 
                  placeholder="Ghi chú thêm..." 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" /> 
                Chi tiết hàng hóa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductSearch products={products} onSelect={addItem} />
              
              {items.length > 0 && (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Sản phẩm</TableHead>
                        <TableHead className="min-w-[140px]">Số lô</TableHead>
                        <TableHead className="min-w-[140px]">Hạn dùng</TableHead>
                        <TableHead className="text-center min-w-[100px]">Số lượng</TableHead>
                        <TableHead className="text-right min-w-[120px]">Đơn giá</TableHead>
                        <TableHead className="text-right min-w-[120px]">Thành tiền</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{item.name}</div>
                              <Badge variant="outline" className="text-xs">{item.unit}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.manage_by_batch ? (
                              <Input 
                                placeholder="Nhập số lô" 
                                value={item.batch_number} 
                                onChange={(e) => updateItem(idx, "batch_number", e.target.value)} 
                                className="h-9"
                              />
                            ) : (
                              <span className="text-xs italic text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.manage_by_batch ? (
                              <Input 
                                type="date" 
                                value={item.expiry_date} 
                                onChange={(e) => updateItem(idx, "expiry_date", e.target.value)} 
                                className="h-9"
                              />
                            ) : (
                              <span className="text-xs italic text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min="1"
                              value={item.quantity} 
                              onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} 
                              className="h-9 w-24 mx-auto text-center"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatPrice(item.quantity * item.unit_price)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setItems(items.filter((_, i) => i !== idx))}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {items.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Chưa có sản phẩm nào được thêm</p>
                  <p className="text-sm mt-1">Tìm kiếm và chọn sản phẩm ở trên để bắt đầu</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}