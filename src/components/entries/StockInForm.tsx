"use client";
import { useState } from "react";
import { Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductSearch } from "@/components/products/ProductSearch";
import { Trash2, Calculator, Save, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createStockEntryAction } from "@/app/actions/inventory";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SelectedItem extends Product {
  inputQty: number;
  inputPrice: number;
}

export default function StockInForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");

  const addItem = (product: Product) => {
    if (items.find((i) => i.id === product.id)) {
      toast.warning("Sản phẩm này đã có trong danh sách");
      return;
    }
    setItems([
      ...items,
      { ...product, inputQty: 1, inputPrice: product.cost_price || 0 },
    ]);
  };

  const updateItem = (id: string, fields: Partial<SelectedItem>) => {
    setItems(items.map((i) => (i.id === id ? { ...i, ...fields } : i)));
  };

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const totalAmount = items.reduce(
    (sum, i) => sum + i.inputQty * i.inputPrice,
    0
  );

  // ... (các phần cũ giữ nguyên)
  const handleSubmit = async () => {
    if (items.length === 0)
      return toast.error("Vui lòng chọn ít nhất 1 sản phẩm");

    setLoading(true);
    // Tạo mã phiếu theo format của bạn
    const entryCode = `PNK${new Date().getTime().toString().slice(-8)}`;

    const result = await createStockEntryAction({
      entry_code: entryCode,
      supplier, // Từ state input
      notes, // Từ state textarea
      total_amount: totalAmount,
      items: items.map((i) => ({
        product_id: i.id,
        quantity: i.inputQty,
        unit_price: i.inputPrice, // Đây chính là unit_price trong stock_entry_items
      })),
    });

    if (result.success) {
      toast.success("Đã nhập kho thành công!");
      router.push("/products");
    } else {
      toast.error(`Lỗi: ${result.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-none bg-transparent">
          <ProductSearch products={products} onSelect={addItem} />
        </Card>

        <Card>
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              Danh sách hàng nhập
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="p-4 text-left font-medium">Sản phẩm</th>
                    <th className="p-4 text-center font-medium w-32">
                      Số lượng
                    </th>
                    <th className="p-4 text-right font-medium w-40">
                      Giá nhập
                    </th>
                    <th className="p-4 text-right font-medium">Thành tiền</th>
                    <th className="p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-12 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 opacity-20" />
                          <p>Chưa có sản phẩm nào được chọn</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {item.internal_code}
                          </div>
                        </td>
                        <td className="p-4">
                          <Input
                            type="number"
                            className="text-center font-bold"
                            value={item.inputQty}
                            onChange={(e) =>
                              updateItem(item.id, {
                                inputQty: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            type="number"
                            className="text-right font-medium"
                            value={item.inputPrice}
                            onChange={(e) =>
                              updateItem(item.id, {
                                inputPrice: Number(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="p-4 text-right font-bold text-blue-600">
                          {formatPrice(item.inputQty * item.inputPrice)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="sticky top-6 border-2 border-primary/10 shadow-lg">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Thanh toán phiếu
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Nhà cung cấp
                </label>
                <Input
                  placeholder="Tên công ty dược, đại lý..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Ghi chú phiếu
                </label>
                <textarea
                  className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Nhập ghi chú (VD: Hóa đơn số 123...)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Tổng mặt hàng:</span>
                <span className="font-medium text-foreground">
                  {items.length}
                </span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold pt-2">
                <span>Tổng tiền:</span>
                <span className="text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <Button
              className="w-full h-14 text-lg shadow-md"
              disabled={loading || items.length === 0}
              onClick={handleSubmit}
            >
              {loading ? (
                "Đang lưu hệ thống..."
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-5 w-5" /> Xác nhận nhập kho
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
