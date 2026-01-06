import { getProductById } from "@/app/actions/products";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const getStockStatus = (current: number, min: number) => {
    if (current === 0)
      return { label: "Hết hàng", variant: "destructive" as const };
    if (current <= min)
      return { label: "Sắp hết", variant: "warning" as const };
    return { label: "Đủ hàng", variant: "success" as const };
  };

  const stockStatus = getStockStatus(product.current_stock, product.min_stock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Chi tiết sản phẩm và thông tin tồn kho
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/products/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tồn kho
                </p>
                <p className="text-2xl font-bold mt-1">
                  {product.current_stock}{" "}
                  <span className="text-sm font-normal">{product.unit}</span>
                </p>
              </div>
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Giá bán
              </p>
              <p className="text-2xl font-bold mt-1">
                {formatPrice(product.sale_price)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Trạng thái
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    product.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium">
                  {product.is_active ? "Đang hoạt động" : "Đã ngừng"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    product.can_sell ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm">
                  {product.can_sell ? "Có thể bán" : "Không được bán"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Mã sản phẩm
              </p>
              <p className="font-mono text-lg font-bold mt-1">
                {product.internal_code}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tên đầy đủ
                    </p>
                    <p className="mt-1">{product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tên ngắn
                    </p>
                    <p className="mt-1">
                      {product.short_name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Danh mục
                    </p>
                    <p className="mt-1">
                      {product.category ? (
                        <Badge variant="secondary">{product.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Đơn vị
                    </p>
                    <p className="mt-1">{product.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Barcode
                    </p>
                    <p className="mt-1 font-mono">
                      {product.barcode || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ngày tạo
                    </p>
                    <p className="mt-1">{formatDate(product.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Giá cả & Tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Giá bán
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {formatPrice(product.sale_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Giá nhập
                    </p>
                    <p className="text-xl mt-1">
                      {product.cost_price ? (
                        formatPrice(product.cost_price)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tồn tối thiểu
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {product.min_stock} {product.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tồn tối đa
                    </p>
                    <p className="text-xl mt-1">
                      {product.max_stock ? (
                        `${product.max_stock} ${product.unit}`
                      ) : (
                        <span className="text-muted-foreground">
                          Không giới hạn
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {product.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ghi chú
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{product.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trạng thái hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.is_active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Hoạt động</span>
                </div>
                <Badge variant={product.is_active ? "success" : "destructive"}>
                  {product.is_active ? "Bật" : "Tắt"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.can_sell ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Có thể bán</span>
                </div>
                <Badge variant={product.can_sell ? "success" : "destructive"}>
                  {product.can_sell ? "Bật" : "Tắt"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Cảnh báo tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tồn kho hiện tại
                  </span>
                  <span className="font-medium">
                    {product.current_stock} {product.unit}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      stockStatus.variant === "destructive"
                        ? "bg-red-500"
                        : stockStatus.variant === "warning"
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: product.max_stock
                        ? `${Math.min(
                            100,
                            (product.current_stock / product.max_stock) * 100
                          )}%`
                        : `${Math.min(
                            100,
                            (product.current_stock /
                              Math.max(product.min_stock * 3, 10)) *
                              100
                          )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Mức tối thiểu</p>
                  <p className="font-medium">
                    {product.min_stock} {product.unit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mức tối đa</p>
                  <p className="font-medium">
                    {product.max_stock
                      ? `${product.max_stock} ${product.unit}`
                      : "—"}
                  </p>
                </div>
              </div>
              {stockStatus.variant !== "success" && (
                <div
                  className={`p-3 rounded text-sm ${
                    stockStatus.variant === "destructive"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {stockStatus.variant === "destructive"
                    ? "⚠️ Sản phẩm đã hết hàng. Cần nhập thêm ngay!"
                    : "⚠️ Tồn kho sắp đạt mức tối thiểu. Cần kiểm tra và nhập thêm."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/products/${product.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa sản phẩm
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <Calendar className="h-4 w-4 mr-2" />
                Xem lịch sử tồn kho
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <FileText className="h-4 w-4 mr-2" />
                Xem lịch sử bán hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
