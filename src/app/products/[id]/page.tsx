import { getProductById } from "@/app/actions/products";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Package,
  Layers,
  Box,
  History,
  TrendingUp,
  AlertTriangle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  const profit = product.sale_price - (product.cost_price || 0);
  const profitMargin =
    product.sale_price > 0
      ? ((profit / product.sale_price) * 100).toFixed(1)
      : 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-lg">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {product.name}
              </h1>
              {!product.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Ngừng kinh doanh
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Mã: {product.internal_code}
              {product.barcode && ` • Barcode: ${product.barcode}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/inventory/history/${id}`}>
              <History className="h-4 w-4 mr-2" />
              Thẻ kho
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/products/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Đơn vị
                  </p>
                  <p className="font-semibold">{product.unit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Danh mục
                  </p>
                  <Badge variant="secondary" className="font-normal">
                    {product.category || "Chưa phân loại"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Kiểu quản lý
                  </p>
                  {product.manage_by_batch ? (
                    <Badge variant="outline" className="border-violet-200">
                      <Layers className="h-3 w-3 mr-1 text-violet-600" />
                      Theo lô hàng
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-blue-200">
                      <Box className="h-3 w-3 mr-1 text-blue-600" />
                      Tổng hợp
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Ngày tạo
                  </p>
                  <p className="text-sm">{formatDate(product.created_at)}</p>
                </div>
              </div>

              {product.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Ghi chú / Công dụng
                    </p>
                    <div className="p-3 rounded-lg bg-muted/30 text-sm">
                      {product.notes}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Inventory Details Card */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div
                  className={cn(
                    "p-1.5 rounded-md",
                    product.manage_by_batch
                      ? "bg-violet-100 dark:bg-violet-900/30"
                      : "bg-blue-100 dark:bg-blue-900/30"
                  )}
                >
                  {product.manage_by_batch ? (
                    <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  ) : (
                    <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                {product.manage_by_batch
                  ? "Tồn kho theo lô"
                  : "Quản lý tổng hợp"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {product.manage_by_batch ? (
                product.product_batches?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Số lô</TableHead>
                        <TableHead>Hạn sử dụng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right pr-6">
                          Tồn kho
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.product_batches.map((batch: any) => {
                        const isExpired =
                          new Date(batch.expiry_date) < new Date();
                        const isNearExpiry =
                          !isExpired &&
                          new Date(batch.expiry_date) <
                            new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                        return (
                          <TableRow
                            key={batch.id}
                            className="hover:bg-muted/30"
                          >
                            <TableCell className="font-medium font-mono">
                              {batch.batch_number}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "font-medium",
                                isExpired && "text-destructive",
                                isNearExpiry && "text-amber-600"
                              )}
                            >
                              {formatDate(batch.expiry_date)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  isExpired
                                    ? "destructive"
                                    : isNearExpiry
                                    ? "outline"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {isExpired
                                  ? "Hết hạn"
                                  : isNearExpiry
                                  ? "Sắp hết hạn"
                                  : "An toàn"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {batch.quantity}{" "}
                              <span className="text-muted-foreground text-xs">
                                {product.unit}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                    <div>
                      <p className="font-medium">Chưa có thông tin lô hàng</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tạo phiếu nhập kho để thêm lô hàng
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="inline-flex p-3 rounded-lg bg-muted">
                    <Box className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2 max-w-sm mx-auto">
                    <p className="font-medium">Quản lý tổng hợp</p>
                    <p className="text-sm text-muted-foreground">
                      Hệ thống quản lý tồn kho tổng hợp không theo dõi hạn sử
                      dụng từng lô
                    </p>
                    <Button variant="link" size="sm" asChild className="mt-2">
                      <Link href={`/inventory/history/${id}`}>
                        Xem thẻ kho chi tiết
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Inventory Card */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tồn kho
                </CardTitle>
                {product.current_stock <= product.min_stock && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-3xl font-bold",
                    product.current_stock <= product.min_stock &&
                      "text-destructive"
                  )}
                >
                  {product.current_stock}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {product.unit}
                </span>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tồn tối thiểu</span>
                  <span className="font-medium">
                    {product.min_stock} {product.unit}
                  </span>
                </div>
                {product.max_stock && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tồn tối đa</span>
                    <span className="font-medium">
                      {product.max_stock} {product.unit}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Card */}
          <Card className="border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Thông tin giá
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Giá bán</p>
                <p className="text-xl font-semibold">
                  {formatPrice(product.sale_price)}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Giá nhập</p>
                  <p className="font-medium">
                    {formatPrice(product.cost_price || 0)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Lợi nhuận</p>
                  <p className="font-medium text-emerald-600">
                    +{formatPrice(profit)}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                      Tỷ suất LN
                    </span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                    {profitMargin}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
