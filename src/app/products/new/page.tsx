import { getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-lg">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Thêm sản phẩm mới
          </h1>
          <p className="text-sm text-muted-foreground">
            Thiết lập thông tin sản phẩm và cấu hình quản lý kho
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="border bg-card shadow-sm">
            <CardContent className="p-6">
              <ProductForm categories={categories} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Guides */}
        <div className="space-y-6">
          {/* Management Mode Card */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/30">
                  <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                Chế độ quản lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Quản lý theo lô</p>
                    <p className="text-muted-foreground text-xs">
                      Theo dõi hạn dùng từng đợt nhập (FEFO)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Quản lý tổng hợp</p>
                    <p className="text-muted-foreground text-xs">
                      Không cần theo dõi hạn dùng từng lô
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Mẹo nhập liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Có thể nhập tay mã sản phẩm hoặc bấm tạo mã tự động
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Danh mục sẽ tự động ghi nhớ khi nhập mới
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}