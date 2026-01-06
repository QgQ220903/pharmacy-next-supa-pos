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
  Barcode,
  DollarSign,
  FileText,
  PlusCircle,
  Save,
  Tag,
  Warehouse,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { updateProduct, createProduct } from "@/app/actions/products";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

  const { register, handleSubmit, watch, setValue, reset } =
    useForm<ProductFormData>({
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
          },
    });

  const isActive = watch("is_active");
  const canSell = watch("can_sell");
  const unit = watch("unit");

  const validateForm = (data: ProductFormData): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.internal_code?.trim()) {
      newErrors.internal_code = "Mã sản phẩm là bắt buộc";
    }

    if (!data.name?.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (data.sale_price < 0) {
      newErrors.sale_price = "Giá bán không được âm";
    }

    if (data.min_stock < 0) {
      newErrors.min_stock = "Tồn tối thiểu không được âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (data: ProductFormData) => {
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

      if (initialData) {
        await updateProduct(initialData.id, cleanData);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(cleanData);
        toast.success("Thêm sản phẩm mới thành công!");
      }

      router.push("/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateProductCode = () => {
    const prefix = "SP";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const newCode = `${prefix}${timestamp}${random}`;
    setValue("internal_code", newCode);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Status Indicator (chỉ hiển thị khi edit) */}
      {initialData && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Chỉnh sửa sản phẩm</h2>
            <p className="text-sm text-muted-foreground">
              Cập nhật thông tin sản phẩm trong kho
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border">
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  isActive ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span className="text-sm">
                {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
              </span>
            </div>
            {!canSell && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border">
                <AlertCircle className="h-3 w-3" />
                <span className="text-sm">Không bán</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng kiểm tra lại các trường thông tin bắt buộc
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="internal_code" className="text-sm font-medium">
              Mã sản phẩm <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="internal_code"
                {...register("internal_code")}
                disabled={!!initialData}
                className={cn(
                  "h-11",
                  errors.internal_code &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
                placeholder="VD: SP001, THUOC001"
              />
              {!initialData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateProductCode}
                  className="h-11 whitespace-nowrap"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tạo mã
                </Button>
              )}
            </div>
            {errors.internal_code && (
              <p className="text-sm text-red-500">{errors.internal_code}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tên sản phẩm <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              className={cn(
                "h-11",
                errors.name && "border-red-500 focus-visible:ring-red-500"
              )}
              placeholder="Nhập tên đầy đủ của sản phẩm"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Danh mục
              </Label>
              <select
                id="category"
                {...register("category")}
                className="w-full h-11 px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode" className="text-sm font-medium">
                Mã vạch (Barcode)
              </Label>
              <Input
                id="barcode"
                {...register("barcode")}
                className="h-11"
                placeholder="Nhập mã vạch"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Đơn vị tính</Label>
            <div className="grid grid-cols-4 gap-2">
              {UNITS.map((u) => (
                <Button
                  key={u}
                  type="button"
                  variant={unit === u ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("unit", u)}
                  className="h-10"
                >
                  {u}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Giá cả</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sale_price" className="text-xs">
                  Giá bán <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₫
                  </span>
                  <Input
                    id="sale_price"
                    type="number"
                    {...register("sale_price", { valueAsNumber: true })}
                    className={cn(
                      "h-11 pl-8",
                      errors.sale_price &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                    placeholder="0"
                    min="0"
                  />
                </div>
                {errors.sale_price && (
                  <p className="text-sm text-red-500">{errors.sale_price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost_price" className="text-xs">
                  Giá nhập
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₫
                  </span>
                  <Input
                    id="cost_price"
                    type="number"
                    {...register("cost_price", { valueAsNumber: true })}
                    className="h-11 pl-8"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Quản lý tồn kho</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_stock" className="text-xs">
                  Tồn tối thiểu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="min_stock"
                  type="number"
                  {...register("min_stock", { valueAsNumber: true })}
                  className={cn(
                    "h-11",
                    errors.min_stock &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                  placeholder="0"
                  min="0"
                />
                {errors.min_stock && (
                  <p className="text-sm text-red-500">{errors.min_stock}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_stock" className="text-xs">
                  Tồn tối đa
                </Label>
                <Input
                  id="max_stock"
                  type="number"
                  {...register("max_stock", { valueAsNumber: true })}
                  className="h-11"
                  placeholder="Không giới hạn"
                  min="0"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  Trạng thái hoạt động
                </Label>
                <p className="text-xs text-muted-foreground">
                  Sản phẩm có đang được sử dụng
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Có thể bán</Label>
                <p className="text-xs text-muted-foreground">
                  Hiển thị tại quầy bán hàng
                </p>
              </div>
              <Switch
                checked={canSell}
                onCheckedChange={(checked) => setValue("can_sell", checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Ghi chú
        </Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Ghi chú thêm về sản phẩm..."
          className="min-h-[100px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
        <div className="text-sm text-muted-foreground">
          Các trường có dấu <span className="text-red-500">*</span> là bắt buộc
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 sm:w-28"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:w-48 gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {initialData ? "Cập nhật" : "Tạo sản phẩm"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
