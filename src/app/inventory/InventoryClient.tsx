"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  getInventoryTransactionsAction, 
  getProductsWithStockAction,
  adjustInventoryAction
} from "@/app/actions/inventory";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Settings2, 
  Calendar as CalendarIcon,
  RefreshCcw,
  Plus,
  Minus,
  AlertTriangle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getProductBatches } from "@/app/actions/products";
import { Package } from "lucide-react";

interface InventoryClientProps {
  initialTab: string;
  initialSearch: string;
  initialParams: {
    page: number;
    type: string;
    fromDate: string;
    toDate: string;
  };
  initialData?: any;
}

export default function InventoryClient({ 
  initialTab, 
  initialSearch, 
  initialParams,
  initialData
}: InventoryClientProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [transactions, setTransactions] = useState<any[]>(
    initialTab === "history" && initialData?.success ? initialData.data : []
  );
  const [products, setProducts] = useState<any[]>(
    initialTab !== "history" && initialData?.success ? initialData.data : []
  );
  const [loading, setLoading] = useState(!initialData);
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialParams.type);
  const [fromDate, setFromDate] = useState(initialParams.fromDate);
  const [toDate, setToDate] = useState(initialParams.toDate);
  const [page, setPage] = useState(initialParams.page);
  const [totalCount, setTotalCount] = useState(initialData?.totalCount || 0);
  // const { toast } = useToast(); - sonner doesn't need this hook call

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const result = await getInventoryTransactionsAction({
      page,
      search,
      type,
      fromDate,
      toDate
    });
    if (result.success) {
      setTransactions(result.data || []);
      setTotalCount(result.totalCount || 0);
    } else {
      toast.error("Lỗi", { description: result.message || "Không thể tải lịch sử biến động" });
      setTransactions([]);
    }
    setLoading(false);
  }, [page, search, type, fromDate, toDate]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const result = await getProductsWithStockAction({
      search,
      page,
      limit: 20
    });
    if (result.success) {
      setProducts(result.data || []);
      setTotalCount(result.totalCount || 0);
    } else {
      toast.error("Lỗi", { description: result.message || "Không thể tải danh sách sản phẩm" });
      setProducts([]);
    }
    setLoading(false);
  }, [page, search]);

  const hasInitialized = useRef(!!initialData);

  useEffect(() => {
    if (hasInitialized.current) {
      hasInitialized.current = false;
      return;
    }

    if (activeTab === "history") {
      fetchTransactions();
    } else {
      fetchProducts();
    }
  }, [activeTab, fetchTransactions, fetchProducts]);

  const [isAdjOpen, setIsAdjOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productBatches, setProductBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all");
  const [adjType, setAdjType] = useState<"delta" | "absolute">("delta");
  const [adjValue, setAdjValue] = useState<string>("0");
  const [adjReason, setAdjReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdjustClick = async (product: any) => {
    setSelectedProduct(product);
    setAdjValue("0");
    setAdjType("delta");
    setAdjReason("Kiểm kê định kỳ");
    setSelectedBatchId("all");
    
    if (product.manage_by_batch) {
      setLoading(true);
      const batches = await getProductBatches(product.id);
      setProductBatches(batches || []);
      if (batches && batches.length > 0) {
        setSelectedBatchId(batches[0].id);
      }
      setLoading(false);
    }
    
    setIsAdjOpen(true);
  };

  const submitAdjustment = async () => {
    if (!selectedProduct) return;
    
    const value = parseInt(adjValue);
    if (isNaN(value)) {
      toast.error("Lỗi", { description: "Giá trị không hợp lệ" });
      return;
    }

    if (adjType === "delta" && value === 0) {
      toast.error("Lỗi", { description: "Số lượng thay đổi phải khác 0" });
      return;
    }

    setIsSubmitting(true);
    const result = await adjustInventoryAction({
      productId: selectedProduct.id,
      quantityChange: value,
      reason: adjReason,
      batchId: selectedProduct.manage_by_batch && selectedBatchId !== "all" ? selectedBatchId : undefined,
      isAbsolute: adjType === "absolute"
    });

    if (result.success) {
      toast.success("Thành công", { description: result.message });
      setIsAdjOpen(false);
      fetchProducts();
    } else {
      toast.error("Thất bại", { description: result.message });
    }
    setIsSubmitting(false);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'purchase': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"><ArrowDownLeft className="w-3 h-3 mr-1" /> Nhập kho</Badge>;
      case 'sale': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><ArrowUpRight className="w-3 h-3 mr-1" /> Bán hàng</Badge>;
      case 'adjustment': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none"><Settings2 className="w-3 h-3 mr-1" /> Điều chỉnh</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quản lý Kho</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi biến động và kiểm kê định kỳ
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger value="history" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Lịch sử biến động
          </TabsTrigger>
          <TabsTrigger value="counting" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Kiểm kê kho
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm sản phẩm..."
                className="pl-9 bg-background border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[150px] bg-background border-border/50">
                <SelectValue placeholder="Loại biến động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="purchase">Nhập kho</SelectItem>
                <SelectItem value="sale">Bán hàng</SelectItem>
                <SelectItem value="adjustment">Điều chỉnh</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="w-[140px] bg-background border-border/50"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <span className="text-muted-foreground">→</span>
              <Input
                type="date"
                className="w-[140px] bg-background border-border/50"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchTransactions} disabled={loading} className="border-border/50">
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>

          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[180px]">Thời gian</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="w-[150px]">Loại</TableHead>
                    <TableHead className="text-right w-[120px]">Thay đổi</TableHead>
                    <TableHead className="text-right w-[120px]">Đơn vị</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Đang tải...</TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Không có dữ liệu biến động</TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((t) => (
                      <TableRow key={t.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="text-sm font-medium">
                          {format(new Date(t.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{t.product?.name || "N/A"}</div>
                          <div className="text-xs text-muted-foreground italic">{t.product?.internal_code}</div>
                        </TableCell>
                        <TableCell>{getTypeBadge(t.transaction_type)}</TableCell>
                        <TableCell className={cn(
                          "text-right font-bold",
                          t.quantity_change > 0 ? "text-blue-600" : "text-rose-600"
                        )}>
                          {t.quantity_change > 0 ? `+${t.quantity_change}` : t.quantity_change}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {t.product?.base_unit}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counting" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm sản phẩm cần kiểm kê..."
                className="pl-9 bg-background border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading} className="border-border/50">
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <Card key={p.id} className={cn(
                "border-border/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm group",
                p.is_low_stock && "border-amber-200/50 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20"
              )}>
                <CardHeader className="p-4 pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                      {p.name}
                    </CardTitle>
                    {p.is_low_stock && (
                      <Badge variant="outline" className="text-[10px] bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-none h-5 px-2">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Thấp
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-[10px] font-mono opacity-60 uppercase tracking-tighter">
                    {p.internal_code}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-0 py-3 border-y border-border/20 bg-muted/20 rounded-lg">
                      <div className="text-center px-2">
                        <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">Tổng Nhập</div>
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                          +{p.total_in || 0}
                        </div>
                      </div>
                      <div className="text-center px-2 border-l border-border/20">
                        <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">Tổng Xuất</div>
                        <div className="text-lg font-bold text-rose-500 dark:text-rose-400 tracking-tight">
                          -{p.total_out || 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">Tồn hệ thống</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={cn(
                            "text-2xl font-bold tracking-tight",
                            p.current_stock > p.min_stock ? "text-foreground" : "text-amber-600/90 dark:text-amber-500/90"
                          )}>
                            {p.current_stock}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium">{p.base_unit}</span>
                        </div>
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleAdjustClick(p)}
                        className="h-9 px-4 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground font-medium text-xs shadow-none border-none transition-all active:scale-95"
                      >
                        <RefreshCcw className="w-3.5 h-3.5 mr-2 opacity-70" />
                        Đối chiếu
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {products.length === 0 && !loading && (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl border-border/30">
              <Package className="w-12 h-12 mb-3 opacity-20" />
              <p>Không tìm thấy sản phẩm</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isAdjOpen} onOpenChange={setIsAdjOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Kiểm kê: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Điều chỉnh tồn kho thực tế cho sản phẩm này.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <RadioGroup value={adjType} onValueChange={(v: any) => setAdjType(v)} className="flex gap-4 mb-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delta" id="delta" />
                <Label htmlFor="delta">Thay đổi (+/-)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="absolute" id="absolute" />
                <Label htmlFor="absolute">Tổng tồn mới</Label>
              </div>
            </RadioGroup>

            {selectedProduct?.manage_by_batch && productBatches.length > 0 && (
              <div className="grid gap-2">
                <Label>Chọn lô hàng</Label>
                <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lô" />
                  </SelectTrigger>
                  <SelectContent>
                    {productBatches.map(b => (
                      <SelectItem key={b.id} value={b.id}>
                        Lô: {b.batch_number} - Hạn: {format(new Date(b.expiry_date), "dd/MM/yyyy")} (Tồn: {b.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="value">
                {adjType === "delta" ? "Số lượng thay đổi" : "Tổng số lượng thực tế"}
              </Label>
              <Input
                id="value"
                type="number"
                value={adjValue}
                onChange={(e) => setAdjValue(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground italic">
                {adjType === "delta" 
                  ? "VD: -5 để trừ 5 sản phẩm, +10 để thêm 10 sản phẩm." 
                  : `Tồn kho hiện tại là ${selectedProduct?.current_stock}. Nhập con số thực tế bạn đếm được.`}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Lý do điều chỉnh</Label>
              <Input
                id="reason"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                placeholder="VD: Kiểm kho định kỳ, hàng hư hỏng..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjOpen(false)}>Hủy</Button>
            <Button onClick={submitAdjustment} disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

