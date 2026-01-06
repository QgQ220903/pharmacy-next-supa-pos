import { getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header đơn giản */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-10 w-10" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Thêm sản phẩm mới
            </h1>
            <p className="text-sm text-muted-foreground">
              Thêm thuốc/sản phẩm mới vào hệ thống quản lý kho
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form sản phẩm */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <ProductForm categories={categories} />
            </div>
          </div>
        </div>

        {/* Sidebar với thông tin hữu ích */}
        <div className="space-y-6">
          {/* Card Tips */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <span className="text-xs text-primary">💡</span>
                </div>
                Mẹo nhập liệu nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Mã sản phẩm</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nhấn "Tạo mã" để hệ thống tự động tạo mã duy nhất. Mã này dùng
                  để phân biệt sản phẩm.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Quản lý tồn kho</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Đặt tồn tối thiểu để nhận cảnh báo khi hàng sắp hết.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Giá cả</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Giá nhập dùng để tính toán lợi nhuận, có thể để trống.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card Important Notes */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    !
                  </span>
                </div>
                Lưu ý quan trọng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <span className="text-muted-foreground">
                    Các trường có dấu <span className="text-red-500">*</span> là
                    bắt buộc
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <span className="text-muted-foreground">
                    Mã sản phẩm không thể thay đổi sau khi tạo
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <span className="text-muted-foreground">
                    Sản phẩm "Không thể bán" sẽ ẩn tại quầy bán hàng
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card Status Guide */}
          {/* <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                Trạng thái sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-md bg-green-50 dark:bg-green-900/10">
                <span className="text-sm">Đang hoạt động</span>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-red-50 dark:bg-red-900/10">
                <span className="text-sm">Ngừng hoạt động</span>
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-blue-50 dark:bg-blue-900/10">
                <span className="text-sm">Không thể bán</span>
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
