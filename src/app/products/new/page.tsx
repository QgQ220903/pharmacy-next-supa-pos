import { getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Layers,
  Info,
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  AlertCircle,
  FileText,
  CheckCircle,
  Scale,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            Thêm sản phẩm mới
          </h1>
          <p className="text-sm text-muted-foreground">
            Thiết lập thông tin sản phẩm và cấu hình quản lý kho
          </p>
        </div>
      </div>

      {/* Workflow Guide - Moved to Top */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Hướng dẫn nhập liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-muted">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">1. Thông tin cơ bản</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Nhập tên, mã sản phẩm và đơn vị tính chính
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-muted">
                  <Tag className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">2. Danh mục & Barcode</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Chọn danh mục có sẵn hoặc nhập mới
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-muted">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">3. Giá bán & Quy đổi</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Thiết lập giá bán và tỷ lệ quy đổi đơn vị
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-muted">
                  <Scale className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">4. Tồn kho & Định mức</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cài đặt mức tồn tối thiểu và tối đa
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-muted">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">5. Cấu hình quản lý</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Chọn chế độ quản lý lô hàng hoặc tổng hợp
              </p>
            </div>
          </div>

          <Separator />

          {/* Important Notes */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium">Lưu ý quan trọng</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Mã sản phẩm</p>
                <p className="text-xs text-muted-foreground">
                  Không thể thay đổi sau khi tạo. Có thể tự tạo mã hoặc nhập tay.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Tồn kho ban đầu</p>
                <p className="text-xs text-muted-foreground">
                  Luôn = 0 khi tạo mới. Cần nhập kho qua phiếu nhập để tăng tồn.
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Quản lý theo lô</p>
                <p className="text-xs text-muted-foreground">
                  Dành cho thuốc có hạn dùng. Tổng hợp cho vật tư không hạn.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form - Full Width with Info Cards */}
      <div className="space-y-8">
        <Card>
          <CardContent className="p-8">
            <ProductForm categories={categories} />
          </CardContent>
        </Card>

        {/* Informational Cards - Below the Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pricing & Unit Conversion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Giá bán & Quy đổi đơn vị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-emerald-100 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                  <Badge variant="outline" className="mb-2 bg-emerald-200 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200">
                    Giá bán chính
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Giá bán cho đơn vị tính gốc (1 viên, 1 chai)
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                  <Badge variant="outline" className="mb-2 bg-blue-200 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200">
                    Quy đổi tự động
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Hệ thống tính giá các đơn vị khác dựa trên tỷ lệ quy đổi
                  </p>
                </div>
              </div>

              <Separator />

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Ví dụ tính toán</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giá bán chính:</span>
                    <span className="font-medium text-foreground">5.000đ/viên</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quy đổi:</span>
                    <span className="font-medium text-foreground">1 vỉ = 10 viên</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary/20">
                    <span className="text-primary">Giá bán lẻ:</span>
                    <span className="font-bold text-primary">50.000đ/vỉ</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Chế độ quản lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 rounded-lg border bg-violet-500/10 border-violet-500/30">
                  <Badge variant="outline" className="mb-2 bg-violet-500/20 border-violet-500/40 text-violet-700 dark:text-violet-300">
                    Theo lô hàng
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Dành cho thuốc có hạn dùng. Theo dõi từng lô, xuất theo FEFO (hết hạn trước xuất trước).
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-sky-500/10 border-sky-500/30">
                  <Badge variant="outline" className="mb-2 bg-sky-500/20 border-sky-500/40 text-sky-700 dark:text-sky-300">
                    Tổng hợp
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Dành cho vật tư không hạn. Quản lý tồn tổng, không theo dõi từng lô.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Mẹo hữu ích
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-muted">
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sử dụng barcode</p>
                    <p className="text-xs text-muted-foreground">
                      Quét barcode giúp bán hàng nhanh chóng, chính xác
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-muted">
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Danh mục thông minh</p>
                    <p className="text-xs text-muted-foreground">
                      Hệ thống tự động ghi nhớ danh mục mới cho lần sau
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-muted">
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Định mức tồn kho</p>
                    <p className="text-xs text-muted-foreground">
                      Thiết lập tồn tối thiểu để nhận cảnh báo nhập hàng kịp thời
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}