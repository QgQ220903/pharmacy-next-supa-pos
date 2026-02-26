import { getProductById, getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ArrowLeft, Info, AlertTriangle, Calendar, Barcode, Tag, Layers, Box } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getProductCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/products/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/products" className="hover:text-primary">
              Sản phẩm
            </Link>
            <span>/</span>
            <Link href={`/products/${id}`} className="hover:text-primary">
              {product.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">Chỉnh sửa</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">
            Chỉnh sửa sản phẩm
          </h1>
        </div>
      </div>

      {/* Form chính - full width */}
      <Card>
        <CardContent className="p-6">
          <ProductForm initialData={product} categories={categories} />
        </CardContent>
      </Card>

      {/* Sidebar thông tin - đặt xuống dưới dạng grid 3 cột */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin hiện tại */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-muted-foreground" />
              Thông tin hiện tại
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã SP:</span>
                <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                  {product.internal_code}
                </code>
              </div>
              
              {product.barcode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Barcode className="h-3 w-3" />
                    Mã vạch:
                  </span>
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                    {product.barcode}
                  </code>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Danh mục:
                </span>
                <span className="text-xs">{product.category || "Chưa có"}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Tạo:
                </span>
                <span className="text-xs">{formatDate(product.created_at)}</span>
              </div>
            </div>

            <div className="pt-2">
              <Badge variant={product.is_active ? "default" : "secondary"} className="w-full justify-center">
                {product.is_active ? "Đang kinh doanh" : "Ngừng kinh doanh"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin thêm */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              Thông tin thêm
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quản lý theo lô:</span>
                <span className="font-medium flex items-center gap-1">
                  {product.manage_by_batch ? (
                    <>
                      <Layers className="h-3.5 w-3.5 text-blue-600" />
                      Có
                    </>
                  ) : (
                    <>
                      <Box className="h-3.5 w-3.5 text-muted-foreground" />
                      Không
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đơn vị cơ bản:</span>
                <span className="font-medium">{product.base_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số đơn vị quy đổi:</span>
                <span className="font-medium">{product.units?.filter(u => !u.is_base_unit).length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tồn kho hiện tại:</span>
                <span className="font-medium">{product.current_stock || 0} {product.base_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số lô:</span>
                <span className="font-medium">{product.product_batches?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lưu ý khi chỉnh sửa */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Lưu ý khi chỉnh sửa
            </div>
            <ul className="space-y-2 text-xs text-amber-700/80 dark:text-amber-400/80">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Mã sản phẩm không thể thay đổi sau khi tạo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Thay đổi đơn vị tính có thể ảnh hưởng báo cáo tồn kho</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Giá bán mới áp dụng cho giao dịch từ thời điểm hiện tại</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>Kiểm tra lại tồn tối thiểu sau khi thay đổi</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}