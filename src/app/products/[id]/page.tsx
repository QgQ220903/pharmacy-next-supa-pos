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
  params: Promise<{ id: string }>; // Khai báo dạng Promise cho Next.js 15+
}) {
  // Giải nén params
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  // Tính toán lợi nhuận dự kiến
  const profit = product.sale_price - (product.cost_price || 0);
  const profitMargin =
    product.sale_price > 0
      ? ((profit / product.sale_price) * 100).toFixed(1)
      : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {product.name}
              </h1>
              {!product.is_active && (
                <Badge variant="destructive">Ngừng kinh doanh</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Mã: {product.internal_code}{" "}
              {product.barcode ? `| Barcode: ${product.barcode}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/inventory-history/${id}`}>
              <History className="h-4 w-4 mr-2" /> Thẻ kho
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/products/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" /> Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Đơn vị
                </p>
                <p className="font-semibold text-slate-700 text-lg">
                  {product.unit}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Danh mục
                </p>
                <p className="mt-1">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-100"
                  >
                    {product.category || "Chưa phân loại"}
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Kiểu quản lý
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {product.manage_by_batch ? (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      <Layers className="h-3 w-3 mr-1" /> Theo lô hàng
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-700">
                      <Box className="h-3 w-3 mr-1" /> Tổng hợp
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Ngày tạo
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {formatDate(product.created_at)}
                </p>
              </div>
            </CardContent>
            {product.notes && (
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Ghi chú / Công dụng
                </p>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-dashed">
                  {product.notes}
                </p>
              </CardContent>
            )}
          </Card>

          {/* HIỂN THỊ THEO LÔ HOẶC THEO TỔNG HỢP */}
          <Card>
            <CardHeader className="border-b bg-slate-50/30">
              <CardTitle className="text-lg flex items-center gap-2">
                {product.manage_by_batch ? (
                  <>
                    <Layers className="h-5 w-5 text-purple-600" /> Tồn kho chi
                    tiết theo lô
                  </>
                ) : (
                  <>
                    <History className="h-5 w-5 text-blue-600" /> Lịch sử biến
                    động
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {product.manage_by_batch ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="pl-6">Số lô (Batch No.)</TableHead>
                      <TableHead>Hạn sử dụng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right pr-6">
                        Số lượng tồn
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.product_batches &&
                    product.product_batches.length > 0 ? (
                      product.product_batches.map((batch: any) => {
                        const isExpired =
                          new Date(batch.expiry_date) < new Date();
                        const isNearExpiry =
                          !isExpired &&
                          new Date(batch.expiry_date) <
                            new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                        return (
                          <TableRow
                            key={batch.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <TableCell className="font-mono font-bold text-slate-700 pl-6">
                              {batch.batch_number}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "font-medium",
                                isExpired
                                  ? "text-red-600"
                                  : isNearExpiry
                                  ? "text-amber-600"
                                  : "text-slate-600"
                              )}
                            >
                              {formatDate(batch.expiry_date)}
                            </TableCell>
                            <TableCell>
                              {isExpired ? (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px]"
                                >
                                  Hết hạn
                                </Badge>
                              ) : isNearExpiry ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-amber-200 text-amber-700 bg-amber-50"
                                >
                                  Sắp hết hạn
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] border-green-200 text-green-700 bg-green-50"
                                >
                                  An toàn
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-bold text-blue-600 pr-6">
                              {batch.quantity}{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                {product.unit}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <div className="flex flex-col items-center text-slate-400">
                            <Package className="h-10 w-10 mb-2 opacity-20" />
                            <p className="italic text-sm">
                              Chưa có thông tin lô hàng. Vui lòng tạo phiếu nhập
                              kho.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-blue-50">
                    <Box className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="max-w-xs mx-auto">
                    <p className="font-semibold text-slate-700">
                      Sản phẩm quản lý tổng hợp
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Hệ thống không theo dõi hạn sử dụng riêng lẻ cho sản phẩm
                      này. Tổng tồn kho được cập nhật dựa trên giao dịch
                      xuất/nhập.
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 text-blue-600"
                      asChild
                    >
                      <Link href={`/inventory-history/${id}`}>
                        Xem thẻ kho chi tiết
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI: KHO & GIÁ */}
        <div className="space-y-6">
          {/* CARD TỒN KHO */}
          <Card
            className={cn(
              "border-2",
              product.current_stock <= product.min_stock
                ? "border-red-200 bg-red-50/30"
                : "border-primary/10 bg-primary/5"
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-slate-500 flex justify-between items-center">
                Tổng tồn thực tế
                {product.current_stock <= product.min_stock && (
                  <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <h2
                  className={cn(
                    "text-5xl font-black tracking-tighter",
                    product.current_stock <= product.min_stock
                      ? "text-red-600"
                      : "text-slate-900"
                  )}
                >
                  {product.current_stock}
                </h2>
                <span className="text-slate-500 font-bold mb-1 ml-2 uppercase text-sm">
                  {product.unit}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm border-t border-dashed pt-4">
                <div className="flex justify-between text-slate-500">
                  <span>Định mức tối thiểu:</span>
                  <span className="font-bold">
                    {product.min_stock} {product.unit}
                  </span>
                </div>
                {product.max_stock && (
                  <div className="flex justify-between text-slate-500">
                    <span>Định mức tối đa:</span>
                    <span className="font-bold">
                      {product.max_stock} {product.unit}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CARD GIÁ CẢ */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-slate-500">
                Thông tin tài chính
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Giá bán lẻ</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(product.sale_price)}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase">
                    Giá nhập TB
                  </p>
                  <p className="font-bold text-slate-700">
                    {formatPrice(product.cost_price || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">
                    Lợi nhuận dự kiến
                  </p>
                  <p className="font-bold text-green-600">
                    +{formatPrice(profit)}
                  </p>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between border border-green-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-bold text-green-800 uppercase">
                    Tỷ suất LN
                  </span>
                </div>
                <span className="text-lg font-black text-green-700">
                  {profitMargin}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
