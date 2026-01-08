"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Product, ProductFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertCircle,
  PlusCircle,
  Save,
  Layers,
  Box,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { updateProduct, createProduct } from "@/app/actions/products";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductFormProps {
  initialData?: Product;
  categories?: string[];
}

const UNITS = ["Viên", "Vỉ", "Hộp", "Chai", "Lọ", "Tuýp", "Gói", "Ống", "Cái"];

export function ProductForm({
  initialData,
  categories = [],
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, handleSubmit, watch, setValue } = useForm<
    ProductFormData & { manage_by_batch: boolean }
  >({
    defaultValues: initialData
      ? {
          ...initialData,
          barcode: initialData.barcode || "",
          category: initialData.category || "",
          cost_price: initialData.cost_price || undefined,
          max_stock: initialData.max_stock || undefined,
          notes: initialData.notes || "",
        }
      : {
          unit: "Viên",
          sale_price: 0,
          min_stock: 0,
          is_active: true,
          can_sell: true,
          manage_by_batch: true,
        },
  });

  const isActive = watch("is_active");
  const canSell = watch("can_sell");
  const unit = watch("unit");
  const manageByBatch = watch("manage_by_batch");

  const validateForm = (data: any): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.internal_code?.trim())
      newErrors.internal_code = "Mã sản phẩm là bắt buộc";
    if (!data.name?.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (data.sale_price < 0) newErrors.sale_price = "Giá bán không được âm";
    if (data.min_stock < 0) newErrors.min_stock = "Tồn tối thiểu không được âm";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (data: any) => {
    if (!validateForm(data)) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanData = {
        ...data,
        barcode: data.barcode?.trim() || null,
        category: data.category?.trim() || null,
        cost_price: data.cost_price || null,
        max_stock: data.max_stock || null,
        notes: data.notes?.trim() || null,
      };

      const res = initialData
        ? await updateProduct(initialData.id, cleanData)
        : await createProduct(cleanData);

      if (res.success) {
        toast.success(
          initialData ? "Cập nhật thành công!" : "Thêm mới thành công!"
        );
        router.push("/products");
        router.refresh();
      } else {
        throw new Error("Đã có lỗi xảy ra");
      }
    } catch (error: any) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateProductCode = () => {
    const newCode = `SP${Date.now().toString().slice(-8)}`;
    setValue("internal_code", newCode);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng kiểm tra lại các trường thông tin bắt buộc.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Product Information */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Product Code */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Mã sản phẩm <span className="text-destructive">*</span>
                  </Label>
                  {!initialData && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateProductCode}
                      className="h-7 text-xs"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Tạo mã
                    </Button>
                  )}
                </div>
                <Input
                  {...register("internal_code")}
                  disabled={!!initialData}
                  placeholder="VD: PARA001"
                  className={cn(
                    "h-10",
                    errors.internal_code && "border-destructive"
                  )}
                />
              </div>

              {/* Product Name */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("name")}
                  placeholder="Nhập tên sản phẩm"
                  className={cn("h-10", errors.name && "border-destructive")}
                />
              </div>

              {/* Category & Barcode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Danh mục</Label>
                  <div className="relative">
                    <Input
                      {...register("category")}
                      list="category-options"
                      placeholder="Chọn hoặc nhập..."
                      className="h-10"
                      autoComplete="off"
                    />
                    <datalist id="category-options">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Mã vạch</Label>
                  <Input
                    {...register("barcode")}
                    placeholder="Quét mã vạch..."
                    className="h-10"
                  />
                </div>
              </div>

              {/* Unit Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Đơn vị tính</Label>
                <div className="flex flex-wrap gap-2">
                  {UNITS.map((u) => (
                    <Badge
                      key={u}
                      variant={unit === u ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1"
                      onClick={() => setValue("unit", u)}
                    >
                      {u}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Ghi chú / Công dụng</Label>
                <Textarea
                  {...register("notes")}
                  placeholder="Nhập hướng dẫn sử dụng hoặc ghi chú..."
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings & Pricing */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Giá & Tồn kho
                </h3>
                <Separator />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Giá bán <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    {...register("sale_price", { valueAsNumber: true })}
                    className="h-10 font-semibold"
                    min="0"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Giá nhập tham khảo
                  </Label>
                  <Input
                    type="number"
                    {...register("cost_price", { valueAsNumber: true })}
                    className="h-10"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tồn tối thiểu</Label>
                  <Input
                    type="number"
                    {...register("min_stock", { valueAsNumber: true })}
                    className="h-10"
                    min="0"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Tồn tối đa
                  </Label>
                  <Input
                    type="number"
                    {...register("max_stock", { valueAsNumber: true })}
                    className="h-10"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Cài đặt
                </h3>
                <Separator />
              </div>

              {/* Batch Management */}
              <div className={cn(
                "p-4 rounded-lg border transition-colors",
                manageByBatch
                  ? "border-violet-200 bg-violet-50/50 dark:bg-violet-950/20"
                  : "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-md",
                      manageByBatch
                        ? "bg-violet-100 dark:bg-violet-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    )}>
                      {manageByBatch ? (
                        <Layers className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      ) : (
                        <Box className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <Label className="font-semibold text-sm">
                        Quản lý theo lô hàng
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {manageByBatch
                          ? "Theo dõi hạn sử dụng từng đợt nhập"
                          : "Quản lý tồn kho tổng hợp"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={manageByBatch}
                    onCheckedChange={(val) => setValue("manage_by_batch", val)}
                  />
                </div>
              </div>

              {/* Status Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Đang kinh doanh
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isActive ? "Hiển thị tại quầy" : "Tạm ẩn khỏi quầy"}
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(v) => setValue("is_active", v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Hiển thị tại quầy
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {canSell ? "Có thể bán" : "Chỉ hiển thị trong kho"}
                    </p>
                  </div>
                  <Switch
                    checked={canSell}
                    onCheckedChange={(v) => setValue("can_sell", v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[140px] gap-2"
        >
          <Save className="h-4 w-4" />
          {isSubmitting
            ? "Đang lưu..."
            : initialData
            ? "Lưu thay đổi"
            : "Tạo sản phẩm"}
        </Button>
      </div>
    </form>
  );
}