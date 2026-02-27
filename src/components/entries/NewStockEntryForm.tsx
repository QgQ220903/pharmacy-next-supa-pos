// components/entries/NewStockEntryForm.tsx
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
  AlertCircle,
  ArrowLeftRight,
  PackageCheck,
} from "lucide-react";
import { createStockEntryAction, getPopularProducts } from "@/app/actions/inventory";
import { toast } from "sonner";
import { Product } from "@/types";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import LabelPrinter from "@/components/entries/LabelPrinter";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQuickProducts, setShowQuickProducts] = useState(true);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);

  const [printData, setPrintData] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const supplierInputRef = useRef<HTMLInputElement>(null);

  const entryDate = new Date().toISOString().split("T")[0];

  // Load popular products
  useEffect(() => {
    async function loadPopularProducts() {
      const result = await getPopularProducts(8);
      if (result.success) {
        setPopularProducts(result.data);
      }
    }
    loadPopularProducts();
  }, []);

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
        unit: p.base_unit,
        quantity: 1,
        unit_price: p.cost_price || 0,
        sale_price: p.sale_price || 0,
        manage_by_batch: p.manage_by_batch,
        batch_number: "",
        expiry_date: "",
      },
    ]);
    setErrors({});
  };

  const updateItem = (index: number, key: string, val: any) => {
    const newItems = [...items];

    // Xử lý đặc biệt cho số
    if (key === 'quantity' || key === 'unit_price') {
      // Nếu giá trị rỗng, gán 0
      if (val === '' || val === null || val === undefined) {
        newItems[index][key] = 0;
      } else {
        // Chỉ giữ lại các ký tự số
        const numericValue = val.toString().replace(/[^\d]/g, '');
        // Parse thành số nguyên
        const parsed = parseInt(numericValue, 10);
        // Nếu là số hợp lệ và không âm, gán giá trị
        if (!isNaN(parsed) && parsed >= 0) {
          newItems[index][key] = parsed;
        }
        // Nếu không hợp lệ, giữ nguyên
      }
    } else {
      newItems[index][key] = val;
    }

    setItems(newItems);

    // Xóa lỗi liên quan khi người dùng sửa
    if (errors[`item_${index}_${key}`]) {
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_${key}`];
      setErrors(newErrors);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
    0,
  );

  const itemCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!supplier.trim()) {
      newErrors.supplier = "Vui lòng nhập tên nhà cung cấp";
    }

    if (items.length === 0) {
      newErrors.items = "Vui lòng thêm ít nhất 1 sản phẩm";
    }

    items.forEach((item, index) => {
      // Kiểm tra số lượng
      if (item.quantity === undefined || item.quantity === null || item.quantity === '') {
        newErrors[`item_${index}_quantity`] = "Vui lòng nhập số lượng";
      } else {
        const quantity = Number(item.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          newErrors[`item_${index}_quantity`] = "Số lượng phải lớn hơn 0";
        }
      }

      // Kiểm tra đơn giá
      if (item.unit_price === undefined || item.unit_price === null || item.unit_price === '') {
        newErrors[`item_${index}_price`] = "Vui lòng nhập đơn giá";
      } else {
        const price = Number(item.unit_price);
        if (isNaN(price) || price < 0) {
          newErrors[`item_${index}_price`] = "Giá nhập không hợp lệ";
        }
      }

      // Kiểm tra lô và hạn dùng
      if (item.manage_by_batch) {
        if (!item.batch_number?.trim()) {
          newErrors[`item_${index}_batch`] = "Vui lòng nhập số lô";
        }
        if (!item.expiry_date) {
          newErrors[`item_${index}_expiry`] = "Vui lòng chọn hạn dùng";
        } else {
          // Kiểm tra hạn dùng phải lớn hơn ngày hiện tại
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expiryDate = new Date(item.expiry_date);
          if (expiryDate <= today) {
            newErrors[`item_${index}_expiry`] = "Hạn dùng phải là ngày trong tương lai";
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi lên server
      const itemsData = items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
        batch_number: item.batch_number?.trim() || null,
        expiry_date: item.expiry_date || null,
      }));

      const result = await createStockEntryAction({
        supplier_name: supplier.trim(),
        items: itemsData,
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
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-4 ring-primary/5">
                <PackageCheck className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Nhập hàng hoàn tất!</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Phiếu nhập đã được lưu thành công. Bạn có thể in tem dán sản
                  phẩm ngay bây giờ.
                </p>
              </div>

              <Separator />

              {/* <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
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
              </div> */}

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
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
      {/* Hiển thị lỗi tổng thể */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="py-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {errors.items || "Vui lòng kiểm tra lại thông tin phiếu nhập"}
          </AlertDescription>
        </Alert>
      )}

      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột trái - Thông tin đối tác */}
        <div className="space-y-6">
          {/* Thông tin nhà cung cấp */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Thông tin đối tác
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Nhà cung cấp <span className="text-destructive">*</span>
                </Label>
                <Input
                  ref={supplierInputRef}
                  placeholder="Nhập tên nhà cung cấp..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className={errors.supplier ? "border-destructive" : ""}
                />
                {errors.supplier && (
                  <p className="text-xs text-destructive">{errors.supplier}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Ghi chú
                </Label>
                <Textarea
                  placeholder="Ghi chú về đơn hàng..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Thông tin phiếu */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Thông tin phiếu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Ngày nhập
                  </Label>
                  <div className="flex items-center h-9 px-3 border rounded-md bg-muted/20">
                    <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm">{formatDate(entryDate)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Mã phiếu
                  </Label>
                  <div className="flex items-center h-9 px-3 border rounded-md bg-muted/20">
                    <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm font-mono text-muted-foreground">
                      (Tự động)
                    </span>
                  </div>
                </div>
              </div>

              {/* Thống kê nhanh */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Thống kê nhanh
                </p>
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
                        <p className="font-bold text-primary">
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

        {/* Cột phải - Danh sách sản phẩm */}
        <div className="space-y-6">
          {/* Tìm kiếm sản phẩm */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                Thêm sản phẩm
              </CardTitle>
              <CardDescription>
                Tìm kiếm và chọn sản phẩm để thêm vào phiếu nhập
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductSearch products={popularProducts} onSelect={addItem} />

              {showQuickProducts && popularProducts.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-xs text-muted-foreground">
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
                  <div className="grid grid-cols-2 gap-3">
                    {popularProducts.slice(0, 4).map((product) => (
                      <button
                        key={product.id}
                        type="button"
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
                              {product.base_unit}
                            </span>
                            <span className="text-xs font-medium">
                              {formatPrice(product.cost_price || 0)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danh sách sản phẩm đã thêm */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Danh sách sản phẩm ({items.length})
                </CardTitle>
                {items.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setItems([])}
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Xóa tất cả
                  </Button>
                )}
              </div>
              <CardDescription>
                {items.length === 0
                  ? "Chưa có sản phẩm nào. Tìm kiếm và thêm sản phẩm ở trên."
                  : `Đã thêm ${items.length} sản phẩm vào phiếu`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="min-w-[250px]">Sản phẩm</TableHead>
                            <TableHead className="min-w-[120px]">Số lô</TableHead>
                            <TableHead className="min-w-[120px]">Hạn dùng</TableHead>
                            <TableHead className="min-w-[80px] text-center">SL</TableHead>
                            <TableHead className="min-w-[140px] text-right">Đơn giá</TableHead>
                            <TableHead className="min-w-[120px] text-right">Thành tiền</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">
                                    {item.name}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {item.unit}
                                    </Badge>
                                    {item.manage_by_batch && (
                                      <Badge variant="secondary" className="text-xs gap-1">
                                        <Layers className="h-3 w-3" />
                                        Theo lô
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              {/* Số lô */}
                              <TableCell>
                                {item.manage_by_batch ? (
                                  <div>
                                    <Input
                                      placeholder="Số lô"
                                      value={item.batch_number}
                                      onChange={(e) =>
                                        updateItem(idx, "batch_number", e.target.value)
                                      }
                                      className={`h-9 text-sm ${errors[`item_${idx}_batch`] ? "border-destructive" : ""}`}
                                    />
                                    {errors[`item_${idx}_batch`] && (
                                      <p className="text-xs text-destructive mt-1">
                                        {errors[`item_${idx}_batch`]}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </TableCell>

                              {/* Hạn dùng */}
                              <TableCell>
                                {item.manage_by_batch ? (
                                  <div>
                                    <Input
                                      type="date"
                                      value={item.expiry_date}
                                      onChange={(e) =>
                                        updateItem(idx, "expiry_date", e.target.value)
                                      }
                                      className={`h-9 text-sm ${errors[`item_${idx}_expiry`] ? "border-destructive" : ""}`}
                                    />
                                    {errors[`item_${idx}_expiry`] && (
                                      <p className="text-xs text-destructive mt-1">
                                        {errors[`item_${idx}_expiry`]}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                              </TableCell>

                              {/* Số lượng */}
                              <TableCell>
                                <div>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={item.quantity === 0 ? '' : item.quantity}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^\d]/g, '');
                                      updateItem(idx, "quantity", value ? parseInt(value, 10) : 0);
                                    }}
                                    className={`w-20 text-center ${errors[`item_${idx}_quantity`] ? "border-destructive" : ""}`}
                                  />
                                  {errors[`item_${idx}_quantity`] && (
                                    <p className="text-xs text-destructive mt-1">
                                      {errors[`item_${idx}_quantity`]}
                                    </p>
                                  )}
                                </div>
                              </TableCell>

                              {/* Đơn giá */}
                              <TableCell>
                                <div className="relative min-w-[140px]">
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={item.unit_price === 0 ? '' : item.unit_price}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^\d]/g, '');
                                      updateItem(idx, "unit_price", value ? parseInt(value, 10) : 0);
                                    }}
                                    onBlur={(e) => {
                                      // Format lại khi mất focus
                                      if (e.target.value) {
                                        const num = parseInt(e.target.value.replace(/[^\d]/g, ''), 10);
                                        updateItem(idx, "unit_price", num);
                                      }
                                    }}
                                    placeholder="0"
                                    className={`pl-8 pr-2 h-9 text-right font-mono ${errors[`item_${idx}_price`] ? "border-destructive" : ""}`}
                                  />
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                    ₫
                                  </span>
                                  {errors[`item_${idx}_price`] && (
                                    <p className="text-xs text-destructive mt-1 absolute -bottom-5 left-0 whitespace-nowrap">
                                      {errors[`item_${idx}_price`]}
                                    </p>
                                  )}
                                </div>
                              </TableCell>

                              {/* Thành tiền */}
                              <TableCell className="text-right font-semibold text-primary min-w-[120px]">
                                {formatPrice((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
                              </TableCell>

                              {/* Nút xóa */}
                              <TableCell>
                                <Button
                                  type="button"
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

                  {/* Tổng kết và nút lưu */}
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

                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.back()}
                          disabled={loading}
                          className="gap-2 h-10 px-4"
                        >
                          <ArrowLeftRight className="h-4 w-4 rotate-180" />
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          size="lg"
                          className="gap-2 shadow-md hover:shadow-lg transition-shadow min-w-[200px]"
                        >
                          {loading ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-3">
                    Chưa có sản phẩm nào
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Sử dụng công cụ tìm kiếm ở trên để thêm sản phẩm vào phiếu nhập
                  </p>
                  {!showQuickProducts && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowQuickProducts(true)}
                      className="gap-2"
                    >
                      <Search className="h-4 w-4" />
                      Hiện sản phẩm thường dùng
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}