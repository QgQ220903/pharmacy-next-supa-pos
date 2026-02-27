import { searchProductsForPOS } from "@/app/actions/sales";
import POSForm from "./POSForm";
import { PackageSearch, PlusCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default async function POSPage() {
  // Lấy sản phẩm phổ biến ban đầu
  const result = await searchProductsForPOS("", 1, 20);
  const initialProducts = result.success ? result.data : [];
  const totalCount = result.totalCount || 0;

  if (totalCount === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full blur-xl"></div>
            <PackageSearch className="h-20 w-20 text-primary relative z-10" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-3">
            Kho hàng trống
          </h1>
          <p className="text-muted-foreground mb-6">
            Chưa có sản phẩm nào sẵn sàng để bán. Hãy nhập hàng để bắt đầu.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button asChild size="lg" className="flex-1 sm:flex-none">
              <Link href="/entries/new" className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Nhập hàng
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
              <Link href="/products">
                Quản lý sản phẩm
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với breadcrumb - giống trang sản phẩm */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <History className="h-4 w-4" />
        <span>Bán hàng</span>
        <span>/</span>
        <span className="text-foreground font-medium">POS</span>
      </div>

      {/* Header chính - giống trang nhập hàng */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Bán hàng tại quầy
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chọn sản phẩm và thanh toán
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/sales" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Lịch sử bán</span>
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/products/new" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Thêm sản phẩm</span>
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Form POS */}
      <POSForm initialProducts={initialProducts} totalCount={totalCount} />
    </div>
  );
}