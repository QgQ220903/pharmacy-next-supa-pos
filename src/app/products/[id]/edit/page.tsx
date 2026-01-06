import { getProductById, getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft, Edit3, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      {/* Header đồng bộ với trang New */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-10 w-10" asChild>
            <Link href={`/products/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Chỉnh sửa: {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Cập nhật thông tin chi tiết và định mức tồn kho cho sản phẩm
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20">
          <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột chính: Form chỉnh sửa */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <ProductForm initialData={product} categories={categories} />
            </div>
          </div>
        </div>

        {/* Sidebar: Thông tin bổ trợ */}
        <div className="space-y-6">
          {/* Card: Thông tin hệ thống (Read-only) */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Thông tin định danh
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  Mã sản phẩm nội bộ
                </span>
                <p className="text-sm font-mono bg-muted p-2 rounded border-dashed border">
                  {product.internal_code}
                </p>
                <p className="text-[10px] text-amber-600 italic">
                  * Mã định danh không thể thay đổi
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  Ngày tạo
                </span>
                <p className="text-sm font-medium">
                  {new Date(product.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card: Lưu ý khi chỉnh sửa (Tương tự trang New nhưng điều chỉnh nội dung) */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    !
                  </span>
                </div>
                Lưu ý khi chỉnh sửa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <span className="text-muted-foreground">
                    Thay đổi <strong>Đơn vị tính</strong> có thể làm sai lệch
                    báo cáo tồn kho cũ.
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <span className="text-muted-foreground">
                    Giá bán mới sẽ có hiệu lực ngay lập tức tại quầy bán hàng.
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <span className="text-muted-foreground">
                    Kiểm tra kỹ <strong>Tồn tối thiểu</strong> để đảm bảo hệ
                    thống cảnh báo đúng.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Lối tắt nhanh */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/products/${id}`}>
                <Package className="h-4 w-4 mr-2" />
                Xem chi tiết tồn kho
              </Link>
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              disabled
            >
              <History className="h-4 w-4 mr-2" />
              Xem lịch sử thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
