"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Product, ProductUnit } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus,
  Grip,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { updateProduct, createProduct } from "@/app/actions/products";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductFormProps {
  initialData?: Product & { units?: ProductUnit[] };
  categories?: string[];
}

// Danh sách gợi ý đơn vị phổ biến
const COMMON_UNITS = [
  "Viên", "Vỉ", "Hộp", "Chai", "Lọ", "Tuýp", "Bịch", "Gói", 
  "Ống", "Miếng", "Túi", "Thùng", "Kg", "Gram", "Ml", "Lít"
];

// Interface cho dữ liệu gửi lên server (bao gồm cả units)
interface ProductSubmitData {
  internal_code: string;
  barcode?: string | null;
  name: string;
  category?: string | null;
  base_unit: string;
  sale_price: number;
  cost_price?: number | null;
  min_stock: number;
  manage_by_batch: boolean;
  is_active: boolean;
  units?: ProductUnit[];
}

export function ProductForm({ initialData, categories = [] }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Default values
  const defaultValues = initialData ? {
    internal_code: initialData.internal_code,
    barcode: initialData.barcode || "",
    name: initialData.name,
    category: initialData.category || "",
    base_unit: initialData.base_unit,
    sale_price: initialData.sale_price,
    cost_price: initialData.cost_price || 0,
    min_stock: initialData.min_stock,
    manage_by_batch: initialData.manage_by_batch ?? true,
    is_active: initialData.is_active ?? true,
    units: initialData.units && initialData.units.length > 0 ? initialData.units : [
      { 
        unit_name: initialData.base_unit, 
        conversion_factor: 1, 
        sale_price: initialData.sale_price, 
        is_base_unit: true 
      }
    ],
  } : {
    internal_code: "",
    barcode: "",
    name: "",
    category: "",
    base_unit: "",
    sale_price: 0,
    cost_price: 0,
    min_stock: 10,
    manage_by_batch: true,
    is_active: true,
    units: [
      { unit_name: "", conversion_factor: 1, sale_price: 0, is_base_unit: true }
    ]
  };

  const { register, handleSubmit, watch, setValue, control } = useForm<any>({
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  const watchIsActive = watch("is_active");
  const watchBaseUnit = watch("base_unit");
  const watchManageByBatch = watch("manage_by_batch");
  const watchUnits = watch("units");
  const watchSalePrice = watch("sale_price");

  // Đồng bộ tên đơn vị chính với đơn vị cơ sở
  useEffect(() => {
    if (fields.length > 0 && watchBaseUnit) {
      setValue("units.0.unit_name", watchBaseUnit);
      setValue("units.0.is_base_unit", true);
    }
  }, [watchBaseUnit, setValue, fields.length]);

  // Đồng bộ giá bán chính với giá của đơn vị cơ sở
  useEffect(() => {
    if (fields.length > 0) {
      setValue("units.0.sale_price", watchSalePrice);
    }
  }, [watchSalePrice, setValue, fields.length]);

  // Tự động tính giá cho các đơn vị dựa trên tỉ lệ quy đổi
  useEffect(() => {
    if (watchSalePrice > 0 && watchUnits) {
      watchUnits.forEach((unit: any, index: number) => {
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
    if (!data.base_unit?.trim()) newErrors.base_unit = "Đơn vị cơ bản là bắt buộc";
    if (data.sale_price < 0) newErrors.sale_price = "Giá bán không được âm";
    if (data.min_stock < 0) newErrors.min_stock = "Tồn tối thiểu không được âm";
    
    // Validate đơn vị cơ bản
    if (!data.units[0]?.unit_name?.trim()) {
      newErrors.base_unit = "Đơn vị cơ bản phải có tên";
    }
    
    // Validate các đơn vị quy đổi
    if (data.units.length > 1) {
      for (let i = 1; i < data.units.length; i++) {
        const unit = data.units[i];
        if (!unit.unit_name?.trim()) {
          newErrors.units = "Tất cả đơn vị phải có tên";
          break;
        }
        if (unit.conversion_factor <= 0) {
          newErrors.units = "Tỉ lệ quy đổi phải lớn hơn 0";
          break;
        }
      }
    }

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
      // Chuẩn bị dữ liệu gửi lên server
      const submitData: ProductSubmitData = {
        internal_code: data.internal_code,
        barcode: data.barcode || null,
        name: data.name,
        category: data.category || null,
        base_unit: data.base_unit,
        sale_price: Number(data.sale_price),
        cost_price: data.cost_price ? Number(data.cost_price) : null,
        min_stock: Number(data.min_stock),
        manage_by_batch: data.manage_by_batch,
        is_active: data.is_active,
        units: data.units.map((unit: any, index: number) => ({
          unit_name: unit.unit_name,
          conversion_factor: Number(unit.conversion_factor),
          sale_price: Number(unit.sale_price),
          is_base_unit: index === 0, // Đơn vị đầu tiên là base unit
        })),
      };

      const res = initialData
        ? await updateProduct(initialData.id, submitData)
        : await createProduct(submitData);

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
    const prefix = "SP";
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setValue("internal_code", `${prefix}${randomNum}`);
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="py-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {errors.units || "Vui lòng kiểm tra lại các trường thông tin bắt buộc."}
          </AlertDescription>
        </Alert>
      )}

      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột trái */}
        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      Mã SP <span className="text-destructive">*</span>
                    </Label>
                    {!initialData && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateProductCode}
                        className="h-6 text-xs px-2"
                      >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Tạo mã
                      </Button>
                    )}
                  </div>
                  <Input
                    {...register("internal_code")}
                    disabled={!!initialData}
                    placeholder="SP001"
                    className={cn("h-9 text-sm", errors.internal_code && "border-destructive")}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Mã vạch</Label>
                  <Input
                    {...register("barcode")}
                    placeholder="Nhập mã vạch"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("name")}
                  placeholder="Nhập tên sản phẩm"
                  className={cn("h-9 text-sm", errors.name && "border-destructive")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Danh mục</Label>
                  <Input
                    {...register("category")}
                    list="category-options"
                    placeholder="Chọn hoặc nhập"
                    className="h-9 text-sm"
                  />
                  <datalist id="category-options">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Đơn vị cơ bản <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...register("base_unit")}
                    list="unit-options"
                    placeholder="VD: Viên, Chai..."
                    className={cn("h-9 text-sm", errors.base_unit && "border-destructive")}
                  />
                  <datalist id="unit-options">
                    {COMMON_UNITS.map((unit) => (
                      <option key={unit} value={unit} />
                    ))}
                  </datalist>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Giá vốn & Tồn kho */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Giá vốn & Tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Giá vốn tham khảo</Label>
                <div className="relative">
                  <Input
                    type="number"
                    {...register("cost_price", { valueAsNumber: true })}
                    className="h-9 pl-7 text-sm"
                    min="0"
                    step="1000"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    ₫
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Tồn tối thiểu <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    {...register("min_stock", { valueAsNumber: true })}
                    className={cn("h-9 text-sm", errors.min_stock && "border-destructive")}
                    min="0"
                    step="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                  <div className="flex items-center h-9 px-3 border rounded-md bg-muted/20">
                    <span className="text-sm text-muted-foreground">
                      {watchIsActive ? "Đang bán" : "Ngừng bán"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải */}
        <div className="space-y-6">
          {/* Giá bán */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                Giá bán & Quy đổi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Giá cơ bản */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Đơn vị cơ bản</Label>
                  <Input
                    value={watchBaseUnit || "Chưa nhập"}
                    disabled
                    className="h-10 text-base bg-muted/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Giá bán cơ bản</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      {...register("sale_price", { valueAsNumber: true })}
                      className="h-10 pl-8 text-base font-medium"
                      min="0"
                      step="1000"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Đơn vị quy đổi */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Đơn vị quy đổi</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Thêm các đơn vị như Vỉ, Hộp để bán lẻ
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={addDerivedUnit}
                    className="gap-2 h-10"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm đơn vị
                  </Button>
                </div>

                {fields.length > 1 ? (
                  <div className="space-y-4">
                    {fields.slice(1).map((field, index) => {
                      const actualIndex = index + 1;
                      return (
                        <div key={field.id} className="p-4 border rounded-lg bg-card space-y-3">
                          <div className="flex items-center gap-3">
                            <Grip className="h-5 w-5 text-muted-foreground" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              {/* Tên đơn vị */}
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Tên đơn vị <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  {...register(`units.${actualIndex}.unit_name`)}
                                  placeholder="VD: Vỉ, Hộp"
                                  className="h-10 text-base"
                                />
                              </div>

                              {/* Tỉ lệ quy đổi */}
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Tỉ lệ quy đổi
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    {...register(`units.${actualIndex}.conversion_factor`, {
                                      valueAsNumber: true,
                                    })}
                                    className="h-10 text-base text-center"
                                    min="1"
                                    step="1"
                                  />
                                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    = 1 {watchBaseUnit || "đv"}
                                  </span>
                                </div>
                              </div>

                              {/* Giá bán */}
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Giá bán
                                </Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    {...register(`units.${actualIndex}.sale_price`, {
                                      valueAsNumber: true,
                                    })}
                                    className="h-10 pl-8 text-base font-semibold"
                                    min="0"
                                    step="1000"
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    ₫
                                  </span>
                                </div>
                              </div>
                            </div>

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

                          {/* Thông tin tự động tính */}
                          {watchUnits?.[actualIndex]?.conversion_factor > 0 && watchSalePrice > 0 && (
                            <div className="ml-12 mt-2 p-2 bg-muted/30 rounded-md border border-dashed">
                              <div className="flex items-center justify-end gap-2 text-sm">
                                <span className="text-muted-foreground">Tự động tính:</span>
                                <span className="font-medium">
                                  {watchSalePrice.toLocaleString()}đ
                                </span>
                                <span className="text-muted-foreground">×</span>
                                <span className="font-semibold">
                                  {watchUnits[actualIndex].conversion_factor}
                                </span>
                                <span className="text-muted-foreground">=</span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  {(watchSalePrice * watchUnits[actualIndex].conversion_factor).toLocaleString()}đ
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg bg-muted/5">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Chưa có đơn vị quy đổi</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Nhấn "Thêm đơn vị" để tạo các đơn vị tính khác
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cài đặt quản lý */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Cài đặt quản lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Quản lý theo lô & hạn dùng</Label>
                  <p className="text-xs text-muted-foreground">
                    {watchManageByBatch 
                      ? "Theo dõi từng lô nhập, xuất kho theo hạn dùng" 
                      : "Quản lý tồn kho tổng hợp, không theo dõi lô"}
                  </p>
                </div>
                <Switch
                  checked={watchManageByBatch}
                  onCheckedChange={(val) => setValue("manage_by_batch", val)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Trạng thái kinh doanh</Label>
                  <p className="text-xs text-muted-foreground">
                    {watchIsActive ? "Đang bán tại quầy" : "Tạm ngừng bán, không hiển thị"}
                  </p>
                </div>
                <Switch
                  checked={watchIsActive}
                  onCheckedChange={(val) => setValue("is_active", val)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="gap-2 h-10 px-4"
        >
          <ArrowLeftRight className="h-4 w-4 rotate-180" />
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="gap-2 h-10 px-6"
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
    </form>
  );
}