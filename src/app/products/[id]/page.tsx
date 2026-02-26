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
  DollarSign,
  Tag,
  Barcode,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate, formatNumber, formatCompactNumber } from "@/lib/utils";
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
import { Progress } from "@/components/ui/progress";

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
  const expiredBatches = batches.filter((b) => new Date(b.expiry_date) < today);
  const nearExpiryBatches = batches.filter((b) => {
    const exp = new Date(b.expiry_date);
    return exp >= today && exp <= threeMonthsLater;
  });
  const validBatches = batches.filter((b) => new Date(b.expiry_date) > threeMonthsLater);

  // Tính tổng giá trị tồn kho
  const totalInventoryValue = (product.current_stock || 0) * (product.cost_price || 0);
  
  // Tính tỷ lệ tồn kho so với min_stock
  const stockPercentage = product.min_stock > 0 
    ? Math.min(100, Math.round(((product.current_stock || 0) / product.min_stock) * 100))
    : 100;

  // Lấy đơn vị cơ bản
  const baseUnit = product.base_unit;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/products" className="hover:text-primary">
                Sản phẩm
              </Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {product.name}
              </h1>
              {!product.is_active && (
                <Badge variant="secondary" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  Ngừng kinh doanh
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/inventory/history/${id}`}>
              <History className="h-4 w-4" />
              Lịch sử
            </Link>
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link href={`/products/${id}/edit`}>
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Link>
          </Button>
        </div>
      </div>

      {/* Alert Badges */}
      {(expiredBatches.length > 0 || nearExpiryBatches.length > 0 || (product.current_stock || 0) <= product.min_stock) && (
        <div className="flex flex-wrap gap-2">
          {(product.current_stock || 0) <= product.min_stock && (
            <Badge variant="destructive" className="gap-2">
              <AlertTriangle className="h-3 w-3" />
              Tồn kho thấp ({product.current_stock} / {product.min_stock} {baseUnit})
            </Badge>
          )}
          {expiredBatches.length > 0 && (
            <Badge variant="destructive" className="gap-2">
              <AlertCircle className="h-3 w-3" />
              {expiredBatches.length} lô hết hạn
            </Badge>
          )}
          {nearExpiryBatches.length > 0 && (
            <Badge variant="outline" className="gap-2 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <Clock className="h-3 w-3" />
              {nearExpiryBatches.length} lô sắp hết hạn
            </Badge>
          )}
        </div>
      )}

      {/* Grid 3 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái - Thông tin cơ bản (2 cột) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Mã sản phẩm</p>
                  <p className="text-sm font-medium font-mono">{product.internal_code}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Barcode className="h-3 w-3" />
                    Mã vạch
                  </p>
                  <p className="text-sm font-medium font-mono">{product.barcode || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Danh mục
                  </p>
                  <p className="text-sm font-medium">{product.category || "Chưa phân loại"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ngày tạo
                  </p>
                  <p className="text-sm font-medium">{formatDate(product.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Đơn vị tính & Giá bán */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                Đơn vị tính & Giá bán
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Đơn vị</TableHead>
                    <TableHead>Quy đổi</TableHead>
                    <TableHead>Giá bán</TableHead>
                    <TableHead className="text-right pr-4">Tồn kho quy đổi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Đơn vị cơ bản */}
                  <TableRow className="bg-muted/20">
                    <TableCell className="pl-4 font-medium">
                      {baseUnit}
                      <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1">Gốc</Badge>
                    </TableCell>
                    <TableCell>1</TableCell>
                    <TableCell className="font-semibold text-primary">{formatPrice(product.sale_price)}</TableCell>
                    <TableCell className="text-right pr-4 font-semibold">
                      {formatNumber(product.current_stock || 0)} {baseUnit}
                    </TableCell>
                  </TableRow>
                  
                  {/* Đơn vị quy đổi */}
                  {product.units && product.units.length > 0 ? (
                    product.units
                      .filter((u) => !u.is_base_unit)
                      .map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="pl-4">{unit.unit_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            1 {unit.unit_name} = {unit.conversion_factor} {baseUnit}
                          </TableCell>
                          <TableCell className="font-medium">{formatPrice(unit.sale_price)}</TableCell>
                          <TableCell className="text-right pr-4">
                            {product.current_stock ? (
                              <>
                                <span className="font-medium">
                                  {Math.floor(product.current_stock / unit.conversion_factor)}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                  {unit.unit_name}
                                </span>
                                {product.current_stock % unit.conversion_factor > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    (dư {product.current_stock % unit.conversion_factor} {baseUnit})
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Không có đơn vị quy đổi
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Chi tiết lô hàng */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {product.manage_by_batch ? (
                  <Layers className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Box className="h-4 w-4 text-muted-foreground" />
                )}
                {product.manage_by_batch ? "Quản lý theo lô" : "Quản lý tổng hợp"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {product.manage_by_batch ? (
                batches.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4">Số lô</TableHead>
                        <TableHead>Hạn sử dụng</TableHead>
                        <TableHead className="text-right">Số lượng</TableHead>
                        <TableHead className="text-right pr-4">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Lô hết hạn */}
                      {expiredBatches.map((batch) => (
                        <TableRow key={batch.id} className="bg-destructive/5">
                          <TableCell className="pl-4 font-mono text-sm">{batch.batch_number}</TableCell>
                          <TableCell className="text-destructive font-medium">
                            {formatDate(batch.expiry_date)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatNumber(batch.quantity)} {baseUnit}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Badge variant="destructive" className="text-xs">Hết hạn</Badge>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Lô sắp hết hạn */}
                      {nearExpiryBatches.map((batch) => (
                        <TableRow key={batch.id} className="bg-amber-50/50 dark:bg-amber-950/10">
                          <TableCell className="pl-4 font-mono text-sm">{batch.batch_number}</TableCell>
                          <TableCell className="text-amber-600 dark:text-amber-400 font-medium">
                            {formatDate(batch.expiry_date)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatNumber(batch.quantity)} {baseUnit}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Badge variant="outline" className="border-amber-200 text-amber-700 dark:text-amber-400">
                              Sắp hết hạn
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Lô còn hạn */}
                      {validBatches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="pl-4 font-mono text-sm">{batch.batch_number}</TableCell>
                          <TableCell>{formatDate(batch.expiry_date)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatNumber(batch.quantity)} {baseUnit}
                          </TableCell>
                          <TableCell className="text-right pr-4">
                            <Badge variant="secondary" className="text-xs">Còn hạn</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm font-medium">Chưa có lô hàng</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tạo phiếu nhập kho để thêm lô hàng
                    </p>
                  </div>
                )
              ) : (
                <div className="py-8 text-center">
                  <Box className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm font-medium">Quản lý tổng hợp</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Sản phẩm được quản lý tồn kho tổng hợp, không theo dõi theo lô
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột phải - Thông tin tồn kho & giá trị */}
        <div className="space-y-6">
          {/* Tồn kho hiện tại */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tồn kho hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-center space-y-3">
                <div className={cn(
                  "text-4xl font-bold",
                  (product.current_stock || 0) <= product.min_stock && "text-destructive"
                )}>
                  {formatNumber(product.current_stock || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {baseUnit}
                </div>
                
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">So với tồn tối thiểu</span>
                    <span className={cn(
                      "font-medium",
                      stockPercentage <= 100 ? "text-green-600" : "text-destructive"
                    )}>
                      {stockPercentage}%
                    </span>
                  </div>
                  <Progress value={stockPercentage} className="h-2" />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tồn tối thiểu</span>
                  <span className="font-medium">{formatNumber(product.min_stock)} {baseUnit}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tình trạng</span>
                  <span className={cn(
                    "font-medium",
                    (product.current_stock || 0) <= product.min_stock 
                      ? "text-destructive" 
                      : "text-green-600"
                  )}>
                    {(product.current_stock || 0) <= product.min_stock 
                      ? "Cần nhập thêm" 
                      : "Đủ hàng"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Giá trị tồn kho */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Giá trị tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Giá vốn</span>
                <span className="font-medium">
                  {product.cost_price ? formatPrice(product.cost_price) : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Giá bán</span>
                <span className="font-medium text-primary">{formatPrice(product.sale_price)}</span>
              </div>
              
              {/* Lợi nhuận ước tính */}
              {product.cost_price && product.cost_price > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lợi nhuận</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(product.sale_price - product.cost_price)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({Math.round(((product.sale_price - product.cost_price) / product.sale_price) * 100)}%)
                    </span>
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-medium">Tổng giá trị tồn</span>
                <span className="text-lg font-bold text-primary">
                  {formatCompactNumber(totalInventoryValue)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                * Tính theo giá vốn
              </p>
            </CardContent>
          </Card>

          {/* Thông tin bổ sung */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                Thông tin khác
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Quản lý theo lô</span>
                <span className="font-medium flex items-center gap-1">
                  {product.manage_by_batch ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Có
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      Không
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Trạng thái</span>
                <span className="font-medium">
                  {product.is_active ? (
                    <span className="text-green-600">Đang kinh doanh</span>
                  ) : (
                    <span className="text-muted-foreground">Ngừng kinh doanh</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Cập nhật lần cuối</span>
                <span className="font-medium text-xs">{formatDate(product.updated_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Thống kê nhanh */}
          {batches.length > 0 && (
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Thống kê lô hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Còn hạn</p>
                    <p className="text-lg font-semibold text-green-600">{validBatches.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sắp hết</p>
                    <p className="text-lg font-semibold text-amber-600">{nearExpiryBatches.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hết hạn</p>
                    <p className="text-lg font-semibold text-destructive">{expiredBatches.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}