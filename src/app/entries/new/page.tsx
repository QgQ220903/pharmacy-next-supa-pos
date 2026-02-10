import { getProducts } from "@/app/actions/products";
import NewStockEntryForm from "@/components/entries/NewStockEntryForm";
import { AlertCircle, ArrowLeft, PackagePlus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewEntryPage() {
  // 1. Gọi action lấy danh sách sản phẩm đang kinh doanh
  const { products, totalCount } = await getProducts(
    { is_active: true },
    1,
    1000,
  );

  // 2. Kiểm tra nếu không có sản phẩm nào
  if (products.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border shadow-sm">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                <Link href="/entries">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  Tạo phiếu nhập mới
                </h1>
                <p className="text-muted-foreground">
                  Nhập hàng từ nhà cung cấp và cập nhật tồn kho
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span className="font-medium">{totalCount}</span>
                <span className="text-muted-foreground">sản phẩm có sẵn</span>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <Link
              href="/entries"
              className="hover:text-foreground transition-colors"
            >
              Nhập hàng
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-medium">Tạo phiếu mới</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-in fade-in duration-500">
          <NewStockEntryForm products={products} />
        </div>
      </div>
    </div>
  );
}
