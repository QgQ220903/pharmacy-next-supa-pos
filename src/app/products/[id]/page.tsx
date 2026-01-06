import { getProductById } from "@/app/actions/products";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // 1. Trả về 404 nếu không tìm thấy ID thật trong DB
  if (!product) {
    notFound();
  }

  // 2. Logic tính toán trạng thái kho (Xử lý trường hợp dữ liệu null từ DB)
  const getStockStatus = (current: number | null, min: number | null) => {
    const stock = current ?? 0;
    const minStock = min ?? 0;
    if (stock <= 0)
      return { label: "Hết hàng", variant: "destructive" as const };
    if (stock <= minStock)
      return { label: "Sắp hết", variant: "warning" as const };
    return { label: "Đủ hàng", variant: "success" as const };
  };

  const stockStatus = getStockStatus(product.current_stock, product.min_stock);

  // 3. Tính tỷ lệ % cho thanh Progress bar (Tránh chia cho 0)
  const calculateProgress = () => {
    const current = product.current_stock ?? 0;
    const max = product.max_stock || Math.max((product.min_stock ?? 0) * 3, 10);
    return Math.min(100, (current / max) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            <p className="text-muted-foreground">
              Mã nội bộ:{" "}
              <span className="font-mono font-medium">
                {product.internal_code}
              </span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/products/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa sản phẩm
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tồn kho
                </p>
                <p className="text-2xl font-bold mt-1">
                  {product.current_stock ?? 0}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {product.unit}
                  </span>
                </p>
              </div>
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Giá bán lẻ
            </p>
            <p className="text-2xl font-bold mt-1 text-primary">
              {formatPrice(product.sale_price)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">
              Hoạt động
            </p>
            <div className="flex items-center gap-2 mt-2">
              {product.is_active ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  Đang kinh doanh
                </Badge>
              ) : (
                <Badge variant="destructive">Ngừng kinh doanh</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Barcode</p>
            <p className="font-mono text-lg font-bold mt-1 truncate">
              {product.barcode || "---"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-blue-500" />
                Thông tin chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <InfoItem label="Tên đầy đủ" value={product.name} />
                <InfoItem label="Tên viết tắt" value={product.short_name} />
                <InfoItem label="Danh mục" value={product.category} isBadge />
                <InfoItem label="Đơn vị tính" value={product.unit} />
                <InfoItem
                  label="Ngày tạo hệ thống"
                  value={formatDate(product.created_at)}
                />
                <InfoItem
                  label="Cập nhật cuối"
                  value={formatDate(product.updated_at)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Price & Inventory Details */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
                Quản lý Giá & Kho
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Giá nhập (vốn)
                    </p>
                    <p className="text-xl font-semibold">
                      {formatPrice(product.cost_price || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Giá bán niêm yết
                    </p>
                    <p className="text-xl font-semibold text-primary">
                      {formatPrice(product.sale_price)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 border-l pl-0 md:pl-8 border-none md:border-solid">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mức tồn tối thiểu
                    </p>
                    <p className="text-lg font-medium">
                      {product.min_stock} {product.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mức tồn tối đa
                    </p>
                    <p className="text-lg font-medium">
                      {product.max_stock
                        ? `${product.max_stock} ${product.unit}`
                        : "Không giới hạn"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ghi chú */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-gray-500" />
                Ghi chú nội bộ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm whitespace-pre-wrap text-muted-foreground italic">
                {product.notes || "Không có ghi chú cho sản phẩm này."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-sm uppercase tracking-wider font-semibold">
                Cảnh báo tồn kho
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mức độ lấp đầy</span>
                  <span className="font-bold">
                    {product.current_stock} / {product.max_stock || "∞"}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden border">
                  <div
                    className={`h-full transition-all ${
                      stockStatus.variant === "destructive"
                        ? "bg-red-500"
                        : stockStatus.variant === "warning"
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>

              {stockStatus.variant !== "success" && (
                <div
                  className={`p-3 rounded-lg border flex gap-2 items-start ${
                    stockStatus.variant === "destructive"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p className="text-xs font-medium">
                    {stockStatus.variant === "destructive"
                      ? "Sản phẩm đã hết hàng. Vui lòng tạo phiếu nhập kho ngay."
                      : "Số lượng tồn kho đang dưới mức an toàn."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm uppercase tracking-wider font-semibold">
                Kiểm soát bán hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <StatusRow
                icon={
                  <CheckCircle
                    className={
                      product.is_active ? "text-green-500" : "text-gray-300"
                    }
                    size={18}
                  />
                }
                label="Cho phép kinh doanh"
                active={product.is_active}
              />
              <StatusRow
                icon={
                  <DollarSign
                    className={
                      product.can_sell ? "text-blue-500" : "text-gray-300"
                    }
                    size={18}
                  />
                }
                label="Cho phép bán lẻ"
                active={product.can_sell}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Component hỗ trợ hiển thị dòng thông tin
function InfoItem({
  label,
  value,
  isBadge = false,
}: {
  label: string;
  value?: string | null;
  isBadge?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase">
        {label}
      </p>
      {isBadge && value ? (
        <Badge variant="secondary">{value}</Badge>
      ) : (
        <p className="text-sm font-semibold">{value || "---"}</p>
      )}
    </div>
  );
}

// Component hỗ trợ hiển thị trạng thái sidebar
function StatusRow({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={`h-2 w-2 rounded-full ${
          active ? "bg-green-500" : "bg-red-500"
        }`}
      />
    </div>
  );
}
