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
  Info,
  Layers,
  Package,
  Truck,
  FileText,
} from "lucide-react";
import { createStockEntryAction } from "@/app/actions/inventory";
import { toast } from "sonner";
import { Product } from "@/types";

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
    // Kiểm tra thông tin chung
    if (!supplier.trim()) return toast.error("Vui lòng nhập tên Nhà cung cấp");
    if (items.length === 0)
      return toast.error("Vui lòng thêm ít nhất 1 sản phẩm");

    // Kiểm tra dữ liệu từng dòng hàng (Validation)
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
        entry_code: `PN${Date.now().toString().slice(-8)}`, // Thêm vào đây
        entry_date: new Date().toISOString(), // Thêm vào đây
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
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background p-4 rounded-lg border shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
              Lập phiếu nhập hàng
            </h1>
            <p className="text-xs text-slate-500 italic">
              Tạo phiếu nhập kho và cập nhật tồn kho hệ thống
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block mr-4">
            <p className="text-[10px] uppercase text-slate-500 font-bold">
              Tổng cộng tiền hàng
            </p>
            <p className="text-lg font-black text-blue-600">
              {totalAmount.toLocaleString()}đ
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 shadow-md h-11 px-6"
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? "Đang xử lý..." : "Hoàn tất & Nhập kho"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Thông tin chung */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b py-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase">
                <Truck className="h-4 w-4 text-blue-600" /> Thông tin đối tác
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="supplier"
                  className="text-xs font-semibold uppercase text-slate-600"
                >
                  Nhà cung cấp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="supplier"
                  placeholder="VD: Công ty Dược phẩm Tuệ Linh..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="focus-visible:ring-blue-500 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-xs font-semibold uppercase text-slate-600"
                >
                  Ghi chú phiếu nhập
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Ghi chú thêm về đơn hàng, số hóa đơn..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] resize-none focus-visible:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Danh sách hàng hóa */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b py-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase">
                <FileText className="h-4 w-4 text-blue-600" /> Chi tiết hàng hóa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 bg-white border-b">
                <ProductSearch products={products} onSelect={addItem} />
              </div>

              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30">
                      <TableHead className="w-[35%]">Sản phẩm</TableHead>
                      <TableHead className="min-w-[200px]">
                        Thông tin Lô
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        SL
                      </TableHead>
                      <TableHead className="w-[140px] text-right">
                        Thành tiền
                      </TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-32 text-center text-slate-400 italic"
                        >
                          Chưa có sản phẩm nào được chọn. Hãy tìm kiếm ở trên.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow
                          key={item.product_id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <TableCell className="align-top py-4">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 leading-tight">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border">
                                  {item.unit}
                                </span>
                                {item.manage_by_batch ? (
                                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                    <Layers size={10} /> THEO LÔ
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                                    <Package size={10} /> HÀNG TỔNG
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-4">
                            {item.manage_by_batch ? (
                              <div className="grid gap-2">
                                <Input
                                  placeholder="Số lô hàng"
                                  className="h-8 text-[11px] border-slate-200 focus:border-blue-400"
                                  value={item.batch_number}
                                  onChange={(e) =>
                                    updateItem(
                                      idx,
                                      "batch_number",
                                      e.target.value
                                    )
                                  }
                                />
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    Hạn dùng:
                                  </span>
                                  <Input
                                    type="date"
                                    className="h-8 text-[11px] border-slate-200"
                                    value={item.expiry_date}
                                    onChange={(e) =>
                                      updateItem(
                                        idx,
                                        "expiry_date",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="h-20 flex items-center justify-center text-[10px] text-slate-400 italic bg-slate-50/50 border border-dashed rounded-md px-4 text-center">
                                Không cần thông tin lô
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="align-top py-4">
                            <div className="space-y-3">
                              <Input
                                type="number"
                                className="text-center h-8 font-bold border-slate-300"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    idx,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                              />
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">
                                  Đơn giá:
                                </span>
                                <Input
                                  type="number"
                                  className="text-right h-8 text-xs border-transparent bg-slate-50 focus:bg-white"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    updateItem(
                                      idx,
                                      "unit_price",
                                      Number(e.target.value)
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-4 text-right">
                            <p className="font-black text-slate-800 text-sm mt-1">
                              {(
                                item.quantity * item.unit_price
                              ).toLocaleString()}
                              đ
                            </p>
                          </TableCell>

                          <TableCell className="align-top py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                              onClick={() =>
                                setItems(items.filter((_, i) => i !== idx))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
