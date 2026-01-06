import { getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NewProductPage() {
  // Lấy danh sách danh mục hiện có để gợi ý trong Form
  const categories = await getProductCategories();

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      {/* Breadcrumb / Quay lại */}
      <div className="flex items-center gap-2">
        <Link
          href="/products"
          className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Thêm thuốc mới</h1>
        <p className="text-muted-foreground">
          Nhập thông tin chi tiết để thêm sản phẩm mới vào hệ thống quản lý kho.
        </p>
      </div>

      {/* Render Form: Form này sẽ tự gọi createProduct bên trong */}
      <ProductForm categories={categories} />
    </div>
  );
}
