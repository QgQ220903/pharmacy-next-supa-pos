"use client";
import { useEffect, useState } from "react";
import { getSalesAction, getSaleDetailAction } from "@/app/actions/sales";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  FileText,
  Download,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Receipt,
  User,
  Package,
  Layers,
  Calendar,
  DollarSign,
  Phone,
  CreditCard,
  Tag,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Định nghĩa interface cho mặt hàng
interface SaleItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit?: string;
  batch_number?: string;
  expiry_date?: string;
  products?: {
    name: string;
    unit: string;
  };
}

// Định nghĩa interface cho hóa đơn
interface Sale {
  id: string;
  sale_code: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_method: string;
  created_at: string;
  items: SaleItem[];
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    const res = await getSalesAction();
    if (res.success && res.data) {
      console.log("Sales data:", res.data);
      setSales(res.data);
    }
    setIsLoading(false);
  };

  const handleViewDetail = async (sale: Sale) => {
    setIsDetailLoading(true);
    setIsDialogOpen(true);

    const res = await getSaleDetailAction(sale.id);
    console.log("Sale detail response:", res);

    if (res.success && res.data) {
      const formattedSale: Sale = {
        ...sale,
        items: res.data.items || [],
      };
      setSelectedSale(formattedSale);
    }

    setIsDetailLoading(false);
  };

  const filteredSales = sales.filter(
    (s) =>
      s.sale_code.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer_phone?.includes(search)
  );

  // Tính toán thống kê
  const totalRevenue = filteredSales.reduce(
    (sum, s) => sum + s.final_amount,
    0
  );
  const totalOrders = filteredSales.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      full: date.toLocaleString("vi-VN"),
    };
  };

  // Get payment method badge variant
  const getPaymentMethodVariant = (method: string) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return "default";
      case "transfer":
        return "secondary";
      case "card":
        return "outline";
      default:
        return "default";
    }
  };

  // Hàm helper để lấy tên sản phẩm
  const getProductName = (item: SaleItem) => {
    return item.products?.name || item.name || `Sản phẩm #${item.product_id}`;
  };

  // Hàm helper để lấy đơn vị
  const getProductUnit = (item: SaleItem) => {
    return item.products?.unit || item.unit || "cái";
  };

  return (
    <div className="space-y-6">
      {/* Header và Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý hóa đơn</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các giao dịch bán hàng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm mã đơn, tên khách..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatPrice(totalRevenue)}
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalOrders}</div>
              <div className="p-2 rounded-full bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Giá trị đơn trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatPrice(averageOrderValue)}
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn</CardTitle>
          <CardDescription>
            {filteredSales.length} hóa đơn được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Không tìm thấy hóa đơn</h3>
              <p className="text-muted-foreground">
                {search
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Chưa có hóa đơn nào được tạo"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Mã hóa đơn</TableHead>
                    <TableHead className="w-[200px]">Khách hàng</TableHead>
                    <TableHead className="w-[150px]">Thời gian</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Tổng tiền
                    </TableHead>
                    <TableHead className="w-[120px]">Thanh toán</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const { date, time } = formatDateTime(sale.created_at);
                    return (
                      <TableRow
                        key={sale.id}
                        className="cursor-pointer hover:bg-accent/50"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-md bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-mono text-sm font-semibold">
                              {sale.sale_code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="font-medium text-sm">
                              {sale.customer_name || "Khách lẻ"}
                            </div>
                            {sale.customer_phone && (
                              <div className="text-xs text-muted-foreground">
                                {sale.customer_phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="text-sm">{date}</div>
                            <div className="text-xs text-muted-foreground">
                              {time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-sm">
                            {formatPrice(sale.final_amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPaymentMethodVariant(
                              sale.payment_method
                            )}
                            className="text-xs"
                          >
                            {sale.payment_method || "Tiền mặt"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewDetail(sale)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => handleViewDetail(sale)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Tải hóa đơn
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sale Detail Dialog - ĐÃ SỬA: Thêm overflow-hidden và cấu trúc flex đúng */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl h-[90vh] p-0 gap-0 flex flex-col">
          {selectedSale ? (
            isDetailLoading ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">
                  Đang tải chi tiết hóa đơn...
                </p>
              </div>
            ) : (
              <>
                {/* Header - Fixed không scroll */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                  <div className="flex items-start justify-between gap-4 pr-8">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <DialogTitle className="text-lg font-semibold">
                          Hóa đơn bán hàng
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm truncate">
                            {formatDateTime(selectedSale.created_at).full}
                          </span>
                        </DialogDescription>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold text-primary font-mono">
                        {selectedSale.sale_code}
                      </div>
                      <Badge variant="default" className="mt-1">
                        Hoàn thành
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                {/* Scrollable Content - Phần này sẽ scroll */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    {/* Customer & Payment Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Khách hàng
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Họ tên:
                            </span>
                            <span className="text-sm font-medium">
                              {selectedSale.customer_name || "Khách lẻ"}
                            </span>
                          </div>
                          {selectedSale.customer_phone && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Số điện thoại:
                              </span>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                <span className="text-sm font-medium">
                                  {selectedSale.customer_phone}
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Thanh toán
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Phương thức:
                            </span>
                            <Badge
                              variant={getPaymentMethodVariant(
                                selectedSale.payment_method
                              )}
                            >
                              {selectedSale.payment_method || "Tiền mặt"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Mã hóa đơn:
                            </span>
                            <span className="text-sm font-mono font-medium">
                              {selectedSale.sale_code}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Order Items - Table với spacing hợp lý */}
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Danh sách sản phẩm
                          <Badge variant="outline" className="ml-2">
                            {selectedSale.items?.length || 0} sản phẩm
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-muted/50 px-4 py-2.5 border-b">
                            <div className="grid grid-cols-[minmax(200px,1fr)_80px_100px_110px] gap-3 text-xs font-semibold">
                              <div>Sản phẩm</div>
                              <div className="text-center">SL</div>
                              <div className="text-right">Đơn giá</div>
                              <div className="text-right">Thành tiền</div>
                            </div>
                          </div>

                          <div className="divide-y">
                            {selectedSale.items &&
                            selectedSale.items.length > 0 ? (
                              selectedSale.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="px-4 py-2.5 hover:bg-muted/30"
                                >
                                  <div className="grid grid-cols-[minmax(200px,1fr)_80px_100px_110px] gap-3 items-center">
                                    <div className="min-w-0">
                                      <div className="font-medium text-sm truncate">
                                        {getProductName(item)}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-xs text-muted-foreground">
                                          {getProductUnit(item)}
                                        </span>
                                        {item.batch_number && (
                                          <>
                                            <Layers className="h-3 w-3 text-blue-500" />
                                            <span className="text-xs text-muted-foreground">
                                              Lô: {item.batch_number}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium text-sm">
                                        {item.quantity}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium text-xs whitespace-nowrap">
                                        {formatPrice(item.unit_price)}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold text-xs whitespace-nowrap">
                                        {formatPrice(item.total_price)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6 text-muted-foreground">
                                <Package className="mx-auto h-8 w-8 mb-2" />
                                <p className="text-sm">
                                  Không có thông tin mặt hàng
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-muted-foreground">
                              Tạm tính:
                            </span>
                            <span className="text-sm font-medium">
                              {formatPrice(selectedSale.total_amount)}
                            </span>
                          </div>

                          {selectedSale.discount > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Tag className="h-3.5 w-3.5" />
                                Chiết khấu:
                              </span>
                              <span className="text-sm font-medium text-destructive">
                                -{formatPrice(selectedSale.discount)}
                              </span>
                            </div>
                          )}

                          <Separator />

                          <div className="flex justify-between items-center pt-2">
                            <span className="text-base font-bold">
                              Tổng cộng:
                            </span>
                            <div className="text-right">
                              <div className="text-xl font-bold text-primary">
                                {formatPrice(selectedSale.final_amount)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Đã bao gồm tất cả thuế và phí
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Footer - Fixed không scroll */}
                <div className="px-6 py-4 border-t bg-muted/30 shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Hóa đơn được tạo vào{" "}
                      {formatDateTime(selectedSale.created_at).full}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Tải PDF
                      </Button>
                      <Button size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        In hóa đơn
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )
          ) : (
            <div className="flex flex-col items-center justify-center flex-1">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Không tìm thấy thông tin hóa đơn
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
