"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Product, ProductFormData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { updateProduct, createProduct } from "@/app/actions/products"; // Import trực tiếp

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
            is_active: true,
            can_sell: true,
          },
    });

  const isActive = watch("is_active");
  const canSell = watch("can_sell");

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Làm sạch dữ liệu trước khi gửi
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
        toast.success("Cập nhật thành công");
      } else {
        await createProduct(cleanData);
        toast.success("Thêm mới thành công");
      }

      router.push("/products");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Phần Alert trạng thái (giữ nguyên logic của bạn) */}
      {initialData && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isActive ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <span className="font-medium">
                {isActive ? "Đang kinh doanh" : "Ngừng kinh doanh"}
              </span>
            </div>
            {!canSell && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Không được bán</span>
              </div>
            )}
          </div>

          {/* Hiển thị mã nội bộ thay vì tồn kho nếu cột stock chưa có */}
          <div className="text-sm text-muted-foreground italic">
            Mã định danh:{" "}
            <span className="font-mono">{initialData.internal_code}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CỘT 1: THÔNG TIN CƠ BẢN */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mã sản phẩm *</Label>
              <Input {...register("internal_code")} disabled={!!initialData} />
            </div>

            <div className="space-y-2">
              <Label>Tên sản phẩm *</Label>
              <Input {...register("name")} placeholder="Tên thuốc..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <select
                  {...register("category")}
                  className="w-full p-2 border rounded-md bg-background text-sm"
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
                <Label>Barcode</Label>
                <Input {...register("barcode")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Đơn vị tính</Label>
              <div className="flex flex-wrap gap-2">
                {UNITS.map((u) => (
                  <Button
                    key={u}
                    type="button"
                    variant={watch("unit") === u ? "default" : "outline"}
                    size="sm"
                    onClick={() => setValue("unit", u)}
                  >
                    {u}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CỘT 2: GIÁ & KHO */}
        <Card>
          <CardHeader>
            <CardTitle>Giá cả & Tồn kho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giá bán *</Label>
                <Input
                  type="number"
                  {...register("sale_price", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Giá nhập</Label>
                <Input
                  type="number"
                  {...register("cost_price", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tồn kho hiện tại</Label>
                <Input
                  value={watch("current_stock") || 0}
                  disabled
                  className="bg-muted font-bold text-blue-600"
                />
                <p className="text-[10px] text-muted-foreground italic">
                  * Số lượng tồn được cập nhật tự động qua phiếu nhập/xuất
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tồn tối thiểu</Label>
                <Input
                  type="number"
                  {...register("min_stock", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tồn tối đa</Label>
                <Input
                  type="number"
                  {...register("max_stock", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t">
              <div className="flex items-center justify-between">
                <Label>Hoạt động</Label>
                <Switch
                  checked={isActive}
                  onCheckedChange={(v) => setValue("is_active", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Cho phép bán</Label>
                <Switch
                  checked={canSell}
                  onCheckedChange={(v) => setValue("can_sell", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ghi chú</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea {...register("notes")} rows={3} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Đang xử lý..."
            : initialData
            ? "Cập nhật sản phẩm"
            : "Thêm mới sản phẩm"}
        </Button>
      </div>
    </form>
  );
}
