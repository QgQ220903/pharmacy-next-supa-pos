"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Product, ProductFormData, ProductUnit } from "@/types";
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
  Trash2,
  DollarSign,
  Package,
  Barcode,
  Tag,
  Info,
  Calculator,
  ArrowLeftRight,
  CheckCircle2,
  Plus,
  MinusCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { updateProduct, createProduct } from "@/app/actions/products";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductFormProps {
  initialData?: Product & { units?: ProductUnit[] };
  categories?: string[];
}

export function ProductForm({ initialData, categories = [] }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, handleSubmit, watch, setValue, control } = useForm<any>({
    defaultValues: initialData
      ? {
        ...initialData,
        barcode: initialData.barcode || "",
        category: initialData.category || "",
        cost_price: initialData.cost_price || 0,
        max_stock: initialData.max_stock || 0,
        notes: initialData.notes || "",
      }
      : {
        unit: "Viên",
        sale_price: 0,
        min_stock: 0,
        is_active: true,
        can_sell: true,
        manage_by_batch: true,
        units: [
          { unit_name: "Viên", conversion_factor: 1, sale_price: 0, is_base_unit: true }
        ]
      },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  const watchIsActive = watch("is_active");
  const watchCanSell = watch("can_sell");
  const watchMainUnit = watch("unit");
  const watchManageByBatch = watch("manage_by_batch");
  const watchUnits = watch("units");
  const watchSalePrice = watch("sale_price");

  // Đồng bộ tên đơn vị chính với đơn vị cơ sở
  useEffect(() => {
    setValue("units.0.unit_name", watchMainUnit);
  }, [watchMainUnit, setValue]);

  // Đồng bộ giá bán chính với giá của đơn vị cơ sở
  useEffect(() => {
    setValue("units.0.sale_price", watchSalePrice);
  }, [watchSalePrice, setValue]);

  // Tự động tính giá cho các đơn vị dựa trên tỉ lệ quy đổi
  useEffect(() => {
    if (watchSalePrice > 0) {
      const units = watchUnits || [];
      units.forEach((unit: any, index: number) => {
        if (index !== 0 && unit.conversion_factor > 0) {
          const calculatedPrice = watchSalePrice * unit.conversion_factor;
          setValue(`units.${index}.sale_price`, calculatedPrice);
        }
      });
    }
  }, [watchSalePrice, watchUnits, setValue]);

  const validateForm = (data: any): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.internal_code?.trim()) newErrors.internal_code = "Mã sản phẩm là bắt buộc";
    if (!data.name?.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (data.sale_price <= 0) newErrors.sale_price = "Giá bán phải lớn hơn 0";
    if (data.units?.some((u: any) => !u.unit_name?.trim())) newErrors.units = "Tên đơn vị không được để trống";

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
      const res = initialData
        ? await updateProduct(initialData.id, data)
        : await createProduct(data);

      if (res.success) {
        toast.success(initialData ? "Cập nhật thành công!" : "Thêm mới thành công!");
        router.push("/products");
        router.refresh();
      } else {
        toast.error(res.message || "Đã có lỗi xảy ra");
      }
    } catch (error: any) {
      toast.error("Lỗi kết nối hệ thống");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateProductCode = () => {
    setValue("internal_code", `SP${Date.now().toString().slice(-8)}`);
  };

  const addDerivedUnit = () => {
    append({
      unit_name: "",
      conversion_factor: 1,
      sale_price: watchSalePrice || 0,
      is_base_unit: false
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng kiểm tra lại các trường thông tin bắt buộc.
          </AlertDescription>
        </Alert>
      )}

      {/* Layout chính - 2 cột cân đối */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cột trái: Thông tin cơ bản */}
        <div className="space-y-8">
          {/* Card Thông tin sản phẩm */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Thông tin sản phẩm
              </CardTitle>
              <CardDescription className="text-sm">
                Nhập thông tin cơ bản của sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    className={cn("h-10", errors.internal_code && "border-destructive")}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Mã vạch (Barcode)</Label>
                  <Input
                    {...register("barcode")}
                    placeholder="Quét hoặc nhập mã vạch..."
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("name")}
                  placeholder="Nhập tên đầy đủ của sản phẩm"
                  className={cn("h-10", errors.name && "border-destructive")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Danh mục
                  </Label>
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
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Đơn vị cơ bản
                  </Label>
                  <Input
                    {...register("unit")}
                    placeholder="VD: Viên, Chai, Gói..."
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Ghi chú / Thành phần
                </Label>
                <Textarea
                  {...register("notes")}
                  placeholder="Thông tin thêm về sản phẩm..."
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card Quản lý kho */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Box className="h-5 w-5" />
                Quản lý kho
              </CardTitle>
              <CardDescription className="text-sm">
                Cấu hình thông số tồn kho
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Tồn tối thiểu
                  </Label>
                  <Input
                    type="number"
                    {...register("min_stock", { valueAsNumber: true })}
                    className="h-10"
                    min="0"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
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

              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Giá nhập tham khảo
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    {...register("cost_price", { valueAsNumber: true })}
                    className="h-10 pl-8"
                    min="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Giá bán & Cài đặt */}
        <div className="space-y-8">
          {/* Card Giá bán & Quy đổi đơn vị */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Giá bán & Quy đổi đơn vị
              </CardTitle>
              <CardDescription className="text-sm">
                Cấu hình giá bán theo các đơn vị tính khác nhau
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Giá bán cơ bản */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <Label className="text-sm font-semibold">Giá bán cơ bản</Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Đơn vị cơ bản</Label>
                    <Input
                      {...register("unit")}
                      placeholder="Viên"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Giá bán</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        {...register("sale_price", { valueAsNumber: true })}
                        className="h-10 pl-8 font-medium"
                        min="0"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      đ/{watchMainUnit || "đơn vị"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Các đơn vị quy đổi */}
              {/* Các đơn vị quy đổi */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Đơn vị quy đổi
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Thêm các đơn vị như Vỉ, Hộp để tự động tính giá
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDerivedUnit}
                    className="h-9 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm đơn vị
                  </Button>
                </div>

                {/* Danh sách đơn vị quy đổi - Layout cải tiến */}
                {fields.length > 1 && (
                  <div className="space-y-3">
                    {fields.slice(1).map((field, index) => {
                      const actualIndex = index + 1;
                      const unit = watchUnits?.[actualIndex];

                      return (
                        <div
                          key={field.id}
                          className="p-4 border rounded-lg bg-card/50"
                        >
                          <div className="grid grid-cols-12 gap-4 items-end">
                            {/* Tên đơn vị - 4 cột */}
                            <div className="col-span-12 md:col-span-4 space-y-2">
                              <Label className="text-xs text-muted-foreground font-medium">
                                Tên đơn vị
                              </Label>
                              <Input
                                {...register(`units.${actualIndex}.unit_name`)}
                                placeholder="VD: Vỉ, Hộp"
                                className="h-10 text-sm"
                              />
                            </div>

                            {/* Tỉ lệ quy đổi - 3 cột */}
                            <div className="col-span-12 md:col-span-3 space-y-2">
                              <Label className="text-xs text-muted-foreground font-medium">
                                Tỉ lệ quy đổi
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  {...register(`units.${actualIndex}.conversion_factor`, {
                                    valueAsNumber: true,
                                  })}
                                  className="h-10 text-center font-medium"
                                  min="1"
                                  step="1"
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {watchMainUnit}
                                </span>
                              </div>
                            </div>

                            {/* Giá bán - 4 cột */}
                            <div className="col-span-12 md:col-span-4 space-y-2">
                              <Label className="text-xs text-muted-foreground font-medium">
                                Giá bán
                              </Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  {...register(`units.${actualIndex}.sale_price`, {
                                    valueAsNumber: true,
                                  })}
                                  className="h-10 pl-8 pr-4 text-sm font-semibold"
                                  min="0"
                                  step="1000"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-foreground">
                                  đ
                                </span>
                              </div>
                            </div>

                            {/* Nút xóa - 1 cột */}
                            <div className="col-span-12 md:col-span-1 space-y-2">
                              <div className="h-[18px]"></div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(actualIndex)}
                                className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Thông tin tự động tính */}
                          {unit?.conversion_factor > 0 && watchSalePrice > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Tự động tính:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {watchSalePrice?.toLocaleString()}đ
                                  </span>
                                  <span className="text-muted-foreground">×</span>
                                  <span className="font-semibold">
                                    {unit.conversion_factor}
                                  </span>
                                  <span className="text-muted-foreground">=</span>
                                  <span className="font-bold text-green-600 dark:text-green-400">
                                    {unit.sale_price?.toLocaleString()}đ
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Thông báo khi chưa có đơn vị quy đổi */}
                {fields.length === 1 && (
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Chưa có đơn vị quy đổi</p>
                        <p className="text-xs text-muted-foreground">
                          Nhấn "Thêm đơn vị" để tạo các đơn vị tính khác. Hệ thống tự động tính giá dựa trên tỉ lệ quy đổi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ví dụ tính toán */}
                {fields.length > 1 && watchSalePrice > 0 && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Calculator className="h-5 w-5 text-primary" />
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Ví dụ tính toán</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Giá bán cơ bản:</span>
                            <span className="font-medium">{watchSalePrice?.toLocaleString()}đ/{watchMainUnit}</span>
                          </div>
                          {fields.slice(1).map((_, index) => {
                            const actualIndex = index + 1;
                            const unit = watchUnits?.[actualIndex];
                            return (
                              <div key={index} className="flex justify-between items-center">
                                <div className="text-muted-foreground">
                                  {unit?.conversion_factor || 1} {watchMainUnit} = 1 {unit?.unit_name || "đơn vị"}
                                </div>
                                <div className="font-semibold text-primary">
                                  {unit?.sale_price?.toLocaleString()}đ
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card Cài đặt quản lý */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Cài đặt quản lý
              </CardTitle>
              <CardDescription className="text-sm">
                Cấu hình chế độ quản lý sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quản lý theo lô hàng */}
              <div className={cn(
                "p-4 rounded-lg border transition-all",
                watchManageByBatch
                  ? "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800"
                  : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-md",
                      watchManageByBatch
                        ? "bg-violet-100 dark:bg-violet-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    )}>
                      {watchManageByBatch ? (
                        <Layers className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      ) : (
                        <Box className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="font-semibold text-sm">
                        Quản lý theo lô & hạn dùng
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {watchManageByBatch
                          ? "Theo dõi từng lô nhập, xuất kho theo FEFO"
                          : "Quản lý tồn kho tổng hợp"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={watchManageByBatch}
                    onCheckedChange={(val) => setValue("manage_by_batch", val)}
                  />
                </div>
              </div>

              <Separator />

              {/* Trạng thái kinh doanh */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Đang kinh doanh
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {watchIsActive ? "Hiển thị tại quầy" : "Tạm ẩn khỏi quầy"}
                    </p>
                  </div>
                  <Switch
                    checked={watchIsActive}
                    onCheckedChange={(val) => setValue("is_active", val)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Cho phép bán lẻ
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {watchCanSell ? "Có thể bán trực tiếp" : "Chỉ quản lý kho"}
                    </p>
                  </div>
                  <Switch
                    checked={watchCanSell}
                    onCheckedChange={(val) => setValue("can_sell", val)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="gap-2"
        >
          <ArrowLeftRight className="h-4 w-4 rotate-180" />
          Quay lại
        </Button>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Reset form logic here
            }}
            disabled={isSubmitting}
          >
            Đặt lại
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 min-w-[150px]"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {initialData ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}