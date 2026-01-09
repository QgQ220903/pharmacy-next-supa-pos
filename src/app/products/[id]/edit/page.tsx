import { getProductById, getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ArrowLeft, Edit3, History, Info, AlertTriangle, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
            <Link href={`/products/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Chỉnh sửa sản phẩm
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Edit3 className="h-3 w-3 mr-1" />
                Chỉnh sửa
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">
                {product.name}
              </p>
              <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                {product.internal_code}
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Cập nhật thông tin, giá bán và cài đặt quản lý cho sản phẩm. 
              Mọi thay đổi sẽ có hiệu lực ngay sau khi lưu.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/products/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại chi tiết
            </Link>
          </Button>
        </div>
      </div>

      {/* Layout mới: Form full width, thông tin hỗ trợ bên dưới */}
      <div className="space-y-8">
        {/* Form chiếm toàn bộ chiều rộng */}
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="p-6">
              <ProductForm initialData={product} categories={categories} />
            </div>
          </CardContent>
        </Card>

        {/* Thông tin hỗ trợ - Grid 3 cột bên dưới */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Thông tin hệ thống */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Thông tin hệ thống
              </CardTitle>
              <CardDescription className="text-sm">
                Thông tin không thể chỉnh sửa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Mã sản phẩm
                </Label>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <code className="text-sm font-mono font-bold">
                    {product.internal_code}
                  </code>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ngày tạo</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(product.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cập nhật lần cuối</span>
                  <span className="text-sm font-medium">
                    {new Date(product.updated_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Lưu ý quan trọng */}
          <Card className="lg:col-span-1 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Lưu ý quan trọng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Thay đổi đơn vị tính
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                      Có thể ảnh hưởng đến báo cáo tồn kho lịch sử
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Giá bán mới
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                      Áp dụng ngay cho các giao dịch mới
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Cảnh báo tồn kho
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                      Kiểm tra lại tồn tối thiểu/max
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Hướng dẫn & Lối tắt */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Hướng dẫn & Lối tắt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hướng dẫn nhanh */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quy đổi đơn vị</p>
                  <p className="text-xs text-muted-foreground">
                    Thêm "Vỉ", "Hộp" để tự động tính giá theo tỉ lệ
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quản lý theo lô</p>
                  <p className="text-xs text-muted-foreground">
                    Bật để theo dõi hạn sử dụng (FEFO)
                  </p>
                </div>
              </div>

              <Separator />

              {/* Lối tắt nhanh */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href={`/products/${id}`}>
                    <Package className="h-4 w-4" />
                    Xem chi tiết tồn kho
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full justify-start gap-2" disabled>
                  <History className="h-4 w-4" />
                  Lịch sử thay đổi
                  <Badge variant="outline" className="ml-auto text-xs">Soon</Badge>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component Label helper
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
}