"use client";
import { useState, useEffect, useRef } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Save,
  ArrowLeft,
  Package,
  Truck,
  FileText,
  CheckCircle2,
  Plus,
  Calendar,
  Hash,
  DollarSign,
  Receipt,
  ClipboardList,
  AlertTriangle,
  X,
  Layers,
  ShoppingCart,
  Tag,
  Search,
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
  const [entryDate] = useState(new Date().toISOString().split("T")[0]);
  const [showQuickProducts, setShowQuickProducts] = useState(true);

  const [printData, setPrintData] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [entryCode] = useState(`PN${Date.now().toString().slice(-8)}`);

  const supplierInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (supplierInputRef.current) {
      setTimeout(() => supplierInputRef.current?.focus(), 100);
    }
  }, []);

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

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
    0,
  );

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleSave = async () => {
    if (!supplier.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    if (items.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    for (const item of items) {
      if (item.quantity <= 0 || item.quantity === "") {
        toast.error(`Sản phẩm "${item.name}" có số lượng không hợp lệ`);
        return;
      }
      if (item.manage_by_batch) {
        if (!item.batch_number?.trim()) {
          toast.error(`Sản phẩm "${item.name}" yêu cầu số lô`);
          return;
        }
        if (!item.expiry_date) {
          toast.error(`Sản phẩm "${item.name}" yêu cầu hạn dùng`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const result = await createStockEntryAction({
        supplier,
        notes,
        total_amount: totalAmount,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          batch_number: item.batch_number || null,
          expiry_date: item.expiry_date || null,
          product_name: item.name,
          unit_name: item.unit,
          sale_price: item.sale_price,
        })),
        entry_code: entryCode,
        entry_date: entryDate,
      });

      if (result.success) {
        toast.success("Nhập hàng thành công!");

        if (result.printData && result.printData.length > 0) {
          setPrintData(result.printData);
          setIsSuccess(true);
        } else {
          setTimeout(() => {
            router.push("/entries");
            router.refresh();
          }, 1500);
        }
      } else {
        toast.error(result.message || "Lỗi khi lưu phiếu");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-green-200 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Nhập hàng hoàn tất!</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full">
                  <Receipt className="h-4 w-4 text-green-600" />
                  <span className="font-mono font-semibold text-green-700">
                    {entryCode}
                  </span>
                </div>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Phiếu nhập đã được lưu thành công. Bạn có thể in tem dán sản
                  phẩm ngay bây giờ.
                </p>
              </div>

              <Separator />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-800">
                      Lưu ý quan trọng
                    </p>
                    <p className="text-sm text-amber-700">
                      Sản phẩm nhập kho phải có tem dán đầy đủ thông tin trước
                      khi bán.
                    </p>
                  </div>
                </div>
              </div>

              <LabelPrinter labels={printData} />

              <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/entries");
                    router.refresh();
                  }}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay về danh sách
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tạo phiếu mới
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tạo phiếu nhập mới</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span className="font-mono bg-muted px-2 py-1 rounded">
                    {entryCode}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{entryDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-muted-foreground">Tổng tiền hàng</p>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Product Search Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Tìm kiếm và thêm sản phẩm
              </CardTitle>
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {products.length} sản phẩm có sẵn
              </Badge>
            </div>
            <CardDescription>
              Tìm kiếm sản phẩm từ danh mục để thêm vào phiếu nhập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProductSearch products={products} onSelect={addItem} />

              {showQuickProducts && products.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">
                      Sản phẩm thường dùng
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowQuickProducts(false)}
                    >
                      Ẩn
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {products.slice(0, 4).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addItem(product)}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all group text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 flex-shrink-0">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {product.unit}
                            </span>
                            <span className="text-xs font-medium">
                              {formatPrice(product.cost_price || 0)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supplier Information */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-5 w-5 text-blue-600" />
                  Thông tin đối tác
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-input" className="text-sm">
                    Nhà cung cấp <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="supplier-input"
                    ref={supplierInputRef}
                    placeholder="Nhập tên nhà cung cấp..."
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Ghi chú
                  </Label>
                  <Textarea
                    placeholder="Ghi chú về đơn hàng..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Thống kê nhanh</span>
                    <Badge className="gap-1">{items.length} SP</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Số lượng tổng
                          </p>
                          <p className="font-bold">{itemCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Tổng tiền
                          </p>
                          <p className="font-bold">
                            {formatPrice(totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      Danh sách sản phẩm đã thêm
                    </CardTitle>
                    <CardDescription>
                      {items.length === 0
                        ? "Chưa có sản phẩm nào. Tìm kiếm và thêm sản phẩm ở trên."
                        : `Đã thêm ${items.length} sản phẩm vào phiếu`}
                    </CardDescription>
                  </div>
                  {items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setItems([])}
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa tất cả
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {items.length > 0 ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="w-[250px]">
                                Sản phẩm
                              </TableHead>
                              <TableHead className="text-center">
                                Số lô
                              </TableHead>
                              <TableHead className="text-center">
                                Hạn dùng
                              </TableHead>
                              <TableHead className="text-center">
                                Số lượng
                              </TableHead>
                              <TableHead className="text-right">
                                Đơn giá
                              </TableHead>
                              <TableHead className="text-right">
                                Thành tiền
                              </TableHead>
                              <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, idx) => (
                              <TableRow key={idx} className="hover:bg-muted/30">
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {item.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {item.unit}
                                      </Badge>
                                      {item.manage_by_batch && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs gap-1"
                                        >
                                          <Layers className="h-3 w-3" />
                                          Theo lô
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {item.manage_by_batch ? (
                                    <div className="flex items-center gap-1">
                                      <Hash className="h-4 w-4 text-muted-foreground" />
                                      <Input
                                        placeholder="Số lô"
                                        value={item.batch_number}
                                        onChange={(e) =>
                                          updateItem(
                                            idx,
                                            "batch_number",
                                            e.target.value,
                                          )
                                        }
                                        className="h-9 w-full text-sm"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {item.manage_by_batch ? (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <Input
                                        type="date"
                                        value={item.expiry_date}
                                        onChange={(e) =>
                                          updateItem(
                                            idx,
                                            "expiry_date",
                                            e.target.value,
                                          )
                                        }
                                        className="h-9 text-sm"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateItem(
                                        idx,
                                        "quantity",
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="h-9 w-20 mx-auto text-center"
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {formatPrice(item.unit_price)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-primary">
                                  {formatPrice(
                                    (item.quantity || 0) *
                                      (item.unit_price || 0),
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => removeItem(idx)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Summary & Action */}
                    <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Tổng thanh toán
                          </p>
                          <p className="text-3xl font-bold text-primary">
                            {formatPrice(totalAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {items.length} sản phẩm • {itemCount} đơn vị
                          </p>
                        </div>

                        <Button
                          onClick={handleSave}
                          disabled={
                            loading || !supplier.trim() || items.length === 0
                          }
                          size="lg"
                          className="gap-2 shadow-md hover:shadow-lg transition-shadow min-w-[200px]"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-5 w-5" />
                              Lưu phiếu nhập
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-3">
                      Chưa có sản phẩm nào trong phiếu
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Sử dụng công cụ tìm kiếm ở trên để thêm sản phẩm vào phiếu
                      nhập
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          if (products.length > 0) addItem(products[0]);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Thêm sản phẩm mẫu
                      </Button>
                      {!showQuickProducts && (
                        <Button
                          variant="ghost"
                          onClick={() => setShowQuickProducts(true)}
                          className="gap-2"
                        >
                          <Search className="h-4 w-4" />
                          Hiện sản phẩm thường dùng
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
