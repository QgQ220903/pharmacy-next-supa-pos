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
  CheckCircle2,
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
        category: data.category?.trim() || null, // Sẽ lấy giá trị text từ input
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
            Vui lòng điền đầy đủ các thông tin bắt buộc.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Mã sản phẩm *</Label>
            <div className="flex gap-2">
              <Input
                {...register("internal_code")}
                disabled={!!initialData}
                placeholder="VD: PARA001"
                className={cn(errors.internal_code && "border-red-500")}
              />
              {!initialData && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateProductCode}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Tự tạo
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Tên sản phẩm *</Label>
            <Input
              {...register("name")}
              placeholder="Nhập tên thuốc hoặc sản phẩm"
              className={cn("h-11", errors.name && "border-red-500")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* PHẦN THAY ĐỔI: DANH MỤC GỘP 2 CÁCH */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Danh mục</Label>
              <div className="relative">
                <Input
                  {...register("category")}
                  list="category-options"
                  placeholder="Chọn hoặc nhập mới..."
                  className="bg-background"
                  autoComplete="off"
                />
                <datalist id="category-options">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Mã vạch</Label>
              <Input {...register("barcode")} placeholder="Quét mã vạch..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Đơn vị tính</Label>
            <div className="flex flex-wrap gap-2">
              {UNITS.map((u) => (
                <Button
                  key={u}
                  type="button"
                  variant={unit === u ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("unit", u)}
                >
                  {u}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Giá bán (VNĐ) *</Label>
              <Input
                type="number"
                {...register("sale_price", { valueAsNumber: true })}
                className="font-bold text-blue-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-500">
                Giá nhập tham khảo
              </Label>
              <Input
                type="number"
                {...register("cost_price", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tồn tối thiểu</Label>
              <Input
                type="number"
                {...register("min_stock", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-500">
                Tồn tối đa
              </Label>
              <Input
                type="number"
                {...register("max_stock", { valueAsNumber: true })}
              />
            </div>
          </div>

          <Separator />

          <div
            className={cn(
              "p-3 rounded-lg border-2 transition-all",
              manageByBatch
                ? "border-purple-200 bg-purple-50"
                : "border-blue-200 bg-blue-50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {manageByBatch ? (
                  <Layers className="h-5 w-5 text-purple-600" />
                ) : (
                  <Box className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <Label className="font-bold text-sm">
                    Quản lý theo lô hàng
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Theo dõi hạn sử dụng từng đợt nhập
                  </p>
                </div>
              </div>
              <Switch
                checked={manageByBatch}
                onCheckedChange={(val) => setValue("manage_by_batch", val)}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Đang kinh doanh</Label>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setValue("is_active", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Hiển thị tại quầy</Label>
              <Switch
                checked={canSell}
                onCheckedChange={(v) => setValue("can_sell", v)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Ghi chú / Công dụng</Label>
        <Textarea
          {...register("notes")}
          placeholder="Nhập hướng dẫn sử dụng hoặc ghi chú nhanh..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[150px] gap-2"
        >
          {isSubmitting ? (
            "Đang lưu..."
          ) : (
            <>
              <Save className="h-4 w-4" />{" "}
              {initialData ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
