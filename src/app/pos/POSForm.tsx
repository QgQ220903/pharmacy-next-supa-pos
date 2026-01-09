"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { 
  ShoppingCart, 
  Trash2, 
  Banknote, 
  CreditCard, 
  Search, 
  Plus, 
  Minus, 
  User,
  Phone,
  Tag,
  CheckCircle2,
  Package,
  X,
  Scan,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";
import { createSaleAction, getProductBatchesAction } from "@/app/actions/sales";
import { toast } from "sonner";

export default function POSForm({ products }: { products: any[] }) {
  const [cart, setCart] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const printRef = useRef<HTMLDivElement>(null);
  const [lastSale, setLastSale] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cấu hình in hóa đơn
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setLastSale(null),
  });

  // Focus vào ô tìm kiếm khi component mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // 1. Tìm kiếm sản phẩm
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return products.slice(0, 8); // Hiển thị 8 sản phẩm mặc định
    return products
      .filter(p => (
        p.name.toLowerCase().includes(q) || 
        p.internal_code?.toLowerCase().includes(q)
      ) && (p.current_stock ?? 0) > 0)
      .slice(0, 12);
  }, [products, searchQuery]);

  // 2. Thêm vào giỏ hàng
  const addToCart = async (product: any) => {
    const cartId = `${product.id}-${Date.now()}`;
    
    const newItem = {
      ...product,
      cartId,
      quantity: 1,
      product_unit_id: null,
      unit_name: product.unit, 
      conversion_factor: 1,
      sale_price: product.sale_price,
    };

    // Nếu thuốc quản lý theo lô, tự động lấy lô gần hết hạn nhất
    if (product.manage_by_batch) {
      const res = await getProductBatchesAction(product.id);
      if (res.success && res.data.length > 0) {
        newItem.selected_batch_id = res.data[0].id;
        newItem.selected_batch_number = res.data[0].batch_number;
        newItem.available_batches = res.data;
      }
    }
    setCart([newItem, ...cart]);
    setSearchQuery("");
    // Focus lại ô tìm kiếm
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const updateCartItem = (cartId: string, updates: any) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, ...updates } : item));
  };

  // 3. Xử lý đổi đơn vị
  const handleUnitChange = (item: any, unitValue: string) => {
    if (unitValue === "base") {
      updateCartItem(item.cartId, {
        product_unit_id: null,
        unit_name: item.unit,
        conversion_factor: 1,
        sale_price: item.sale_price
      });
    } else {
      const unit = item.units?.find((u: any) => u.id === unitValue);
      if (unit) {
        updateCartItem(item.cartId, {
          product_unit_id: unit.id,
          unit_name: unit.unit_name,
          conversion_factor: unit.conversion_factor,
          sale_price: unit.sale_price
        });
      }
    }
  };

  const totalAmount = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.sale_price * item.quantity), 0), 
    [cart]
  );
  const finalAmount = Math.max(0, totalAmount - discount);

  // 4. Thanh toán
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Giỏ hàng trống!");
    setLoading(true);
    const res = await createSaleAction({
      items: cart,
      customerName: customer.name,
      customerPhone: customer.phone,
      totalAmount,
      discount,
      finalAmount,
      paymentMethod,
    });

    if (res.success) {
      toast.success("Hóa đơn đã được lưu thành công!");
      setLastSale({ 
        saleCode: res.saleCode, 
        items: [...cart], 
        totalAmount, 
        discount, 
        finalAmount,
        customerName: customer.name 
      });
      // Reset form
      setCart([]); 
      setCustomer({ name: "", phone: "" }); 
      setDiscount(0);
      // Gọi lệnh in
      setTimeout(() => handlePrint(), 500);
    } else {
      toast.error(res.message || "Có lỗi xảy ra!");
    }
    setLoading(false);
  };

  // Xử lý phím tắt
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "F12" || (e.ctrlKey && e.key === "Enter")) {
        e.preventDefault();
        if (cart.length > 0 && !loading) {
          handleCheckout();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [cart, loading]);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái - Danh sách sản phẩm */}
        <div className="lg:col-span-2 space-y-4">
          {/* Thanh tìm kiếm */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
                  className="pl-10 pr-20 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {filteredProducts.length}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Scan className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danh sách sản phẩm */}
          <Card className="flex-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Sản phẩm có sẵn</CardTitle>
                <Badge variant="outline">
                  {products.length} sản phẩm
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <Search className="h-12 w-12 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium">Không tìm thấy sản phẩm</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Chưa có sản phẩm nào"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="group cursor-pointer hover:border-primary hover:shadow-sm transition-all duration-200 overflow-hidden hover:scale-[1.02]"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {product.current_stock} {product.unit}
                          </Badge>
                          {product.manage_by_batch && (
                            <Badge variant="outline" className="text-[10px]">
                              Lô
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-2 min-h-[40px] group-hover:text-primary">
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                          {product.internal_code || "—"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-primary">
                            {formatPrice(product.sale_price)}
                          </span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột phải - Giỏ hàng & Thanh toán */}
        <div className="space-y-4">
          {/* Giỏ hàng */}
          <Card className="h-[420px] flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <CardTitle>Giỏ hàng</CardTitle>
                </div>
                <Badge variant={cart.length > 0 ? "default" : "outline"}>
                  {cart.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">Giỏ hàng trống</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Chọn sản phẩm để thêm vào giỏ</p>
                </div>
              ) : (
                <ScrollArea className="h-full px-4">
                  <div className="space-y-3 py-2">
                    {cart.map((item) => (
                      <div key={item.cartId} className="space-y-2 border-b pb-3 last:border-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-start gap-2">
                              <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                              {item.manage_by_batch && (
                                <Badge variant="outline" className="text-[10px] h-5">
                                  Lô {item.selected_batch_number}
                                </Badge>
                              )}
                            </div>
                            <Select 
                              value={item.product_unit_id || "base"} 
                              onValueChange={(v) => handleUnitChange(item, v)}
                            >
                              <SelectTrigger className="h-7 text-xs w-auto">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="base">{item.unit} (Gốc)</SelectItem>
                                {(item.units || []).map((u: any) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.unit_name} (x{u.conversion_factor})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() => setCart(cart.filter(i => i.cartId !== item.cartId))}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateCartItem(item.cartId, { quantity: Math.max(1, item.quantity - 1) })}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              className="h-7 w-16 text-center"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(item.cartId, { quantity: Math.max(1, Number(e.target.value)) })}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateCartItem(item.cartId, { quantity: item.quantity + 1 })}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                className="h-7 w-24 text-right text-sm"
                                value={item.sale_price}
                                onChange={(e) => updateCartItem(item.cartId, { sale_price: Number(e.target.value) })}
                              />
                              <span className="font-bold text-primary">
                                {formatPrice(item.sale_price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Thanh toán */}
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Thông tin khách hàng */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông tin khách hàng
                  </Label>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Tên khách hàng (tùy chọn)"
                      value={customer.name}
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                    />
                    <Input
                      placeholder="Số điện thoại (tùy chọn)"
                      value={customer.phone}
                      onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                {/* Tổng tiền */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tổng tiền hàng:</span>
                    <span className="font-medium">{formatPrice(totalAmount)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Giảm giá
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Số tiền giảm"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setDiscount(Math.floor(totalAmount * 0.1))}
                        className="shrink-0"
                      >
                        -10%
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Thành tiền:</span>
                    <span className="text-primary text-xl">{formatPrice(finalAmount)}</span>
                  </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="space-y-2">
                  <Label className="text-sm">Phương thức thanh toán</Label>
                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="cash" className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Tiền mặt
                      </TabsTrigger>
                      <TabsTrigger value="transfer" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Chuyển khoản
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col space-y-3 border-t p-6">
              <Alert className="text-xs">
                <AlertDescription className="flex items-center justify-center gap-2">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">F12</kbd>
                  <span>hoặc</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + Enter</kbd>
                  <span>để thanh toán nhanh</span>
                </AlertDescription>
              </Alert>
              
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold"
                onClick={handleCheckout}
                disabled={loading || cart.length === 0 || finalAmount <= 0}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Thanh toán {finalAmount > 0 && formatPrice(finalAmount)}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Component ẩn để in hóa đơn */}
      <PrintInvoice ref={printRef} data={lastSale} />
    </TooltipProvider>
  );
}

// --- COMPONENT IN HÓA ĐƠN ---
const PrintInvoice = React.forwardRef(({ data }: { data: any }, ref: any) => {
  if (!data) return null;
  return (
    <div style={{ display: "none" }}>
      <div ref={ref} className="p-4 text-black font-mono text-[13px] w-[80mm] leading-tight bg-white dark:bg-white dark:text-black">
        <div className="text-center mb-4 space-y-1">
          <h2 className="text-[18px] font-bold uppercase border-b pb-2">NHÀ THUỐC CỦA CHÚ M</h2>
          <p className="text-[11px]">123 Đường Thuốc, Quận 1, TP.HCM</p>
          <p className="text-[11px]">SĐT: 0900.000.000</p>
          <div className="border-b border-dashed border-black w-full my-2"></div>
          <h3 className="text-[15px] font-bold">HÓA ĐƠN BÁN LẺ</h3>
          <p className="text-[10px]">Mã: {data.saleCode}</p>
          <p className="text-[10px]">Ngày: {new Date().toLocaleString("vi-VN")}</p>
        </div>

        <div className="mb-3">
          <p className="text-sm">
            <span className="font-bold">Khách hàng:</span> {data.customerName || "Khách lẻ"}
          </p>
        </div>

        <table className="w-full mb-3 text-[12px]">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left pb-1">Sản phẩm</th>
              <th className="text-right pb-1">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any, i: number) => (
              <tr key={i} className="border-b border-dashed border-black/20">
                <td className="py-2">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-[10px] text-gray-600">
                    {item.quantity} {item.unit_name} × {formatPrice(item.sale_price)}
                  </div>
                </td>
                <td className="text-right py-2 font-bold align-top">
                  {formatPrice(item.quantity * item.sale_price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span className="font-medium">{formatPrice(data.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá:</span>
            <span className="text-red-600">-{formatPrice(data.discount)}</span>
          </div>
          <div className="flex justify-between text-[16px] font-bold border-t border-black pt-2 mt-2">
            <span>TỔNG CỘNG:</span>
            <span>{formatPrice(data.finalAmount)}</span>
          </div>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-black">
          <p className="font-bold text-sm italic mb-2">Cảm ơn quý khách!</p>
          <p className="text-[10px] text-gray-600">Hóa đơn có giá trị trong ngày</p>
          <p className="text-[10px] text-gray-600 mt-1">Hotline: 0900.000.000</p>
        </div>
      </div>
    </div>
  );
});
PrintInvoice.displayName = "PrintInvoice";