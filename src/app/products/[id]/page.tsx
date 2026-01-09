import { getProductById } from "@/app/actions/products";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Layers,
  Box,
  History,
  AlertCircle,
  AlertTriangle,
  Scale,
  Clock,
  Package,
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

  // Phân loại lô hàng
  const today = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(today.getMonth() + 3);

  const batches = product.product_batches || [];
  const expiredBatches = batches.filter((b: any) => new Date(b.expiry_date) < today);
  const nearExpiryBatches = batches.filter((b: any) => {
    const exp = new Date(b.expiry_date);
    return exp >= today && exp <= threeMonthsLater;
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-lg shrink-0">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">
                {product.name}
              </h1>
              {!product.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Ngừng kinh doanh
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <p className="text-sm text-muted-foreground font-mono">
                Mã: {product.internal_code}
              </p>
              {product.barcode && (
                <p className="text-sm text-muted-foreground font-mono">
                  Barcode: {product.barcode}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href={`/inventory/history/${id}`}>
              <History className="h-4 w-4" />
              <span>Thẻ kho</span>
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-2">
            <Link href={`/products/${id}/edit`}>
              <Edit className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Alert Badges */}
      {expiredBatches.length > 0 || nearExpiryBatches.length > 0 || product.current_stock <= product.min_stock ? (
        <div className="flex flex-wrap gap-2">
          {product.current_stock <= product.min_stock && (
            <Badge variant="destructive" className="gap-2">
              <AlertTriangle className="h-3 w-3" />
              Sắp hết hàng
            </Badge>
          )}
          {expiredBatches.length > 0 && (
            <Badge variant="destructive" className="gap-2">
              <AlertCircle className="h-3 w-3" />
              {expiredBatches.length} lô hết hạn
            </Badge>
          )}
          {nearExpiryBatches.length > 0 && (
            <Badge variant="outline" className="gap-2 text-amber-600 border-amber-200">
              <Clock className="h-3 w-3" />
              {nearExpiryBatches.length} lô sắp hết hạn
            </Badge>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Unit Conversion Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4" />
                <span>Quy đổi đơn vị & Giá bán</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Đơn vị bán</TableHead>
                    <TableHead>Tỷ lệ quy đổi</TableHead>
                    <TableHead>Giá bán</TableHead>
                    <TableHead className="text-right pr-6">Tồn kho</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Main unit */}
                  <TableRow>
                    <TableCell className="pl-6 font-medium">
                      {product.unit} (gốc)
                    </TableCell>
                    <TableCell>1</TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(product.sale_price)}
                    </TableCell>
                    <TableCell className="text-right pr-6 font-semibold">
                      {product.current_stock} {product.unit}
                    </TableCell>
                  </TableRow>
                  
                  {/* Additional units */}
                  {product.units?.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="pl-6">{u.unit_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        1 {u.unit_name} = {u.conversion_factor} {product.unit}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(u.sale_price)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <span className="font-semibold">
                          {Math.floor(product.current_stock / u.conversion_factor)}
                        </span> {u.unit_name}
                        {product.current_stock % u.conversion_factor > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (+{product.current_stock % u.conversion_factor} {product.unit})
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Batch Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {product.manage_by_batch ? (
                  <Layers className="h-4 w-4" />
                ) : (
                  <Box className="h-4 w-4" />
                )}
                <span>
                  {product.manage_by_batch ? "Tồn kho theo lô" : "Quản lý tổng hợp"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {product.manage_by_batch ? (
                batches.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Số lô</TableHead>
                        <TableHead>Hạn sử dụng</TableHead>
                        <TableHead className="text-center">Số lượng tồn</TableHead>
                        <TableHead className="text-right pr-6">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch: any) => {
                        const isExpired = new Date(batch.expiry_date) < today;
                        const isNearExpiry = !isExpired && new Date(batch.expiry_date) <= threeMonthsLater;

                        return (
                          <TableRow key={batch.id}>
                            <TableCell className="pl-6 font-medium font-mono">
                              {batch.batch_number}
                            </TableCell>
                            <TableCell className={cn(
                              "font-medium",
                              isExpired && "text-destructive",
                              isNearExpiry && "text-amber-600"
                            )}>
                              {formatDate(batch.expiry_date)}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {batch.quantity} {product.unit}
                            </TableCell>
                            <TableCell className="text-right pr-6">
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
                      Hệ thống quản lý tồn kho tổng hợp không theo dõi hạn sử dụng từng lô
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className={cn(
                  "text-4xl font-bold",
                  product.current_stock <= product.min_stock && "text-destructive"
                )}>
                  {product.current_stock}
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.unit}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tồn tối thiểu</span>
                  <span className="font-medium">
                    {product.min_stock} {product.unit}
                  </span>
                </div>
                {product.max_stock && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tồn tối đa</span>
                    <span className="font-medium">
                      {product.max_stock} {product.unit}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Danh mục</span>
                  <span className="font-medium">{product.category || "Chưa phân loại"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quản lý theo lô</span>
                  <span className="font-medium">
                    {product.manage_by_batch ? (
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        Có
                      </span>
                    ) : "Không"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ngày tạo</span>
                  <span className="font-medium">{formatDate(product.created_at)}</span>
                </div>
              </div>

              {product.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Ghi chú
                    </p>
                    <p className="text-sm leading-relaxed p-3 bg-muted/30 rounded-lg">
                      {product.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}