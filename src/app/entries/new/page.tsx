// app/entries/new/page.tsx
import { Suspense } from "react";
import { getProductsForEntry } from "@/app/actions/inventory";
import NewStockEntryForm from "@/components/entries/NewStockEntryForm";
import { AlertCircle, ArrowLeft, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import NewEntryLoading from "./loading";

async function NewEntryContent() {
  const result = await getProductsForEntry();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-6">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold mb-3">
              Không thể tải dữ liệu sản phẩm
            </h2>
            <p className="text-muted-foreground mb-6">
              {result.message || "Đã xảy ra lỗi khi kết nối với cơ sở dữ liệu."}
            </p>
            <Button asChild>
              <Link href="/entries">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const products = result.data || [];

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-6">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold mb-3">
              Chưa có sản phẩm để nhập kho
            </h2>
            <p className="text-muted-foreground mb-6">
              Bạn cần tạo ít nhất một sản phẩm trước khi thực hiện nhập hàng.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="gap-2">
                <Link href="/products/new">
                  <PackagePlus className="h-4 w-4" />
                  Tạo sản phẩm mới
                </Link>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <Link href="/entries">
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại danh sách
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với nút quay lại */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href="/entries">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tạo phiếu nhập mới
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Nhập hàng từ nhà cung cấp và cập nhật tồn kho
          </p>
        </div>
      </div>
      {/* Form */}
      <NewStockEntryForm products={products} />
    </div>
  );
}

export default function NewEntryPage() {
  return (
    <Suspense fallback={<NewEntryLoading />}>
      <NewEntryContent />
    </Suspense>
  );
}