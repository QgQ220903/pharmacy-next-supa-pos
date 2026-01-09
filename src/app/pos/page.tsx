import { getProducts } from "@/app/actions/products";
import POSForm from "./POSForm";
import { PackageSearch, PlusCircle, BarChart, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function POSPage() {
  const { products } = await getProducts({ is_active: true }, 1, 2000);

  // Lọc sản phẩm có tồn kho > 0
  const availableProducts = products?.filter(p => (p.current_stock ?? 0) > 0) || [];

  // Thống kê nhanh
  const totalProducts = availableProducts.length;
  const totalValue = availableProducts.reduce((sum, p) => 
    sum + (p.current_stock * p.sale_price), 0
  );

  if (availableProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bán hàng</h1>
          <p className="text-muted-foreground">
            Hệ thống bán hàng POS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/sales" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Doanh thu</span>
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/products/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Sản phẩm sẵn sàng</p>
                <p className="text-3xl font-bold">{totalProducts}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                <PackageSearch className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tổng giá trị kho</p>
                <p className="text-3xl font-bold">{formatPrice(totalValue)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10 dark:bg-blue-500/20">
                <BarChart className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{totalProducts}</p>
                  <Badge variant="outline" className="text-xs">
                    Đang bán
                  </Badge>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/10 dark:bg-green-500/20">
                <Package className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form POS */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Giao dịch mới</CardTitle>
          <CardDescription>Chọn sản phẩm và tiến hành thanh toán</CardDescription>
        </CardHeader>
        <CardContent>
          <POSForm products={availableProducts} />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function
function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}