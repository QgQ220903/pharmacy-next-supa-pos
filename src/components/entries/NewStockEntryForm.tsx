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
} from "lucide-react";
import { createStockEntryAction } from "@/app/actions/inventory";
import { toast } from "sonner";
import { Product } from "@/types";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
        manage_by_batch: p.manage_by_batch,
        batch_number: "",
        expiry_date: "",
        manufacturer: "",
        registration_number: "",
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
    if (items.length === 0)
      return toast.error("Vui lòng thêm ít nhất 1 sản phẩm");

    for (const item of items) {
      if (item.quantity <= 0) {
        return toast.error(`Sản phẩm "${item.name}" có số lượng không hợp lệ`);
      }
      if (item.manage_by_batch) {
        if (!item.batch_number || !item.expiry_date) {
          return toast.error(
            `Sản phẩm "${item.name}" yêu cầu Số lô và Hạn dùng`
          );
        }
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
        router.push("/entries");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu phiếu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Tạo phiếu nhập
            </h1>
            <p className="text-sm text-muted-foreground">
              Thêm sản phẩm và cập nhật tồn kho
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Tổng tiền hàng</div>
            <div className="text-xl font-bold">{formatPrice(totalAmount)}</div>
          </div>
          <Button onClick={handleSave} disabled={loading} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Đang xử lý..." : "Hoàn tất"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Information */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Thông tin đối tác
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">
                  Nhà cung cấp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="supplier"
                  placeholder="Nhập tên nhà cung cấp..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú phiếu nhập</Label>
                <Textarea
                  id="notes"
                  placeholder="Ghi chú thêm về đơn hàng..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/30">
                  <Calculator className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tổng sản phẩm
                </span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tổng số lượng
                </span>
                <span className="font-semibold">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-muted-foreground">
                  Tổng tiền hàng
                </span>
                <span className="text-lg font-bold">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Products */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                  <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Chi tiết hàng hóa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductSearch products={products} onSelect={addItem} />

              {items.length === 0 ? (
                <div className="py-12 text-center space-y-4 border-2 border-dashed rounded-lg bg-muted/30">
                  <Package className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                  <div className="space-y-2">
                    <p className="font-medium">Chưa có sản phẩm</p>
                    <p className="text-sm text-muted-foreground">
                      Tìm kiếm và thêm sản phẩm để bắt đầu
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[35%]">Sản phẩm</TableHead>
                        <TableHead>Thông tin Lô</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow
                          key={item.product_id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.unit}
                                </Badge>
                                {item.manage_by_batch ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-violet-100 text-violet-800 border-violet-200"
                                  >
                                    <Layers className="h-3 w-3 mr-1" />
                                    Theo lô
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                                  >
                                    <Package className="h-3 w-3 mr-1" />
                                    Tổng hợp
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {item.manage_by_batch ? (
                              <div className="space-y-2">
                                <Input
                                  placeholder="Số lô hàng"
                                  value={item.batch_number}
                                  onChange={(e) =>
                                    updateItem(
                                      idx,
                                      "batch_number",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 text-sm"
                                />
                                <div className="space-y-1">
                                  <Label className="text-xs">Hạn dùng</Label>
                                  <Input
                                    type="date"
                                    value={item.expiry_date}
                                    onChange={(e) =>
                                      updateItem(
                                        idx,
                                        "expiry_date",
                                        e.target.value
                                      )
                                    }
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground italic">
                                Không cần thông tin lô
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="space-y-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                                className="h-8 text-center"
                                min="1"
                              />
                              <div className="space-y-1">
                                <Label className="text-xs">Đơn giá</Label>
                                <Input
                                  type="number"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    updateItem(
                                      idx,
                                      "unit_price",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="h-8"
                                  min="0"
                                />
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="text-right font-semibold">
                            {formatPrice(item.quantity * item.unit_price)}
                          </TableCell>

                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setItems(items.filter((_, i) => i !== idx))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
