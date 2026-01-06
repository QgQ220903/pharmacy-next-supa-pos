"use client";
import { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart,
  Trash2,
  User,
  CreditCard,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductSearch } from "@/components/products/ProductSearch";
import { formatPrice, cn } from "@/lib/utils";
import { createSaleAction } from "@/app/actions/sales";
import { toast } from "sonner";

export default function POSForm({ products }: { products: any[] }) {
  const [cart, setCart] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);

  // 1. Thêm phím tắt F12 để thanh toán
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        handleCheckout();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, customer, discount, paymentMethod]);

  // 2. Logic cập nhật số lượng có kiểm tra tồn kho
  const updateQuantity = (id: string, qty: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    let newQty = qty;

    // Chặn nếu bán quá số lượng tồn
    if (newQty > item.current_stock) {
      toast.warning(
        `Sản phẩm ${item.name} chỉ còn ${item.current_stock} trong kho`,
        {
          icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
        }
      );
      newQty = item.current_stock;
    }

    if (newQty < 1) newQty = 1;

    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
    );
  };

  // 3. Thêm thuốc vào giỏ
  const addToCart = (product: any) => {
    if (product.current_stock <= 0) {
      return toast.error("Sản phẩm đã hết hàng!");
    }

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      toast.success(`Đã thêm ${product.name}`);
    }
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  // 4. Tính toán tiền
  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0),
    [cart]
  );
  const finalAmount = Math.max(0, totalAmount - discount);

  // 5. Xử lý thanh toán
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Giỏ hàng đang trống");

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
      toast.success(`Hóa đơn ${res.saleCode} hoàn tất!`);
      setCart([]);
      setCustomer({ name: "", phone: "" });
      setDiscount(0);
    } else {
      toast.error(res.message || "Lỗi khi xử lý thanh toán");
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* CỘT TRÁI: Tìm kiếm & Giỏ hàng */}
      <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
        <Card className="shadow-sm border-none bg-background p-2">
          <ProductSearch products={products} onSelect={addToCart} />
        </Card>

        <Card className="flex-1 overflow-hidden flex flex-col shadow-sm">
          <CardHeader className="py-3 border-b bg-muted/30">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              DANH SÁCH THUỐC ĐANG CHỌN ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead>Tên thuốc</TableHead>
                  <TableHead className="w-24 text-center">Đơn vị</TableHead>
                  <TableHead className="w-32 text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                  <TableHead className="w-12 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-muted-foreground italic"
                    >
                      Chưa có sản phẩm nào trong giỏ hàng
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/10">
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {item.internal_code}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground italic text-sm">
                        {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={item.quantity}
                            className={cn(
                              "h-8 text-center font-bold",
                              item.quantity >= item.current_stock &&
                                "border-orange-500 bg-orange-50"
                            )}
                            onChange={(e) =>
                              updateQuantity(item.id, Number(e.target.value))
                            }
                          />
                          <div className="text-[10px] text-center text-muted-foreground">
                            Tồn:{" "}
                            <span className="font-bold">
                              {item.current_stock}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(item.sale_price)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatPrice(item.sale_price * item.quantity)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* CỘT PHẢI: Thanh toán */}
      <div className="lg:col-span-1 flex flex-col">
        <Card className="shadow-lg border-2 border-primary/10 flex flex-col h-full bg-card">
          <CardContent className="p-4 flex flex-col flex-1">
            {/* Thông tin khách hàng */}
            <div className="space-y-3 mb-6">
              <h3 className="text-[11px] font-black text-muted-foreground uppercase flex items-center gap-2">
                <User className="h-3 w-3" /> Thông tin khách hàng
              </h3>
              <Input
                placeholder="Tên khách hàng"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
              <Input
                placeholder="Số điện thoại"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
            </div>

            {/* Chi tiết tiền */}
            <div className="space-y-3 border-t pt-4 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Chiết khấu:</span>
                <div className="flex items-center gap-1 border rounded px-2 bg-background">
                  <span className="text-red-500 font-bold">-</span>
                  <input
                    type="number"
                    className="w-20 h-8 text-right font-bold text-red-500 bg-transparent outline-none border-none"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 border-t pt-3 mt-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase">
                  Tổng tiền thanh toán
                </span>
                <div className="text-3xl font-black text-primary text-right tracking-tighter">
                  {formatPrice(finalAmount)}
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="grid grid-cols-2 gap-2 my-6">
              <Button
                variant={paymentMethod === "Cash" ? "default" : "outline"}
                className={cn(
                  "flex flex-col h-16 gap-1 border-2",
                  paymentMethod === "Cash" && "border-primary"
                )}
                onClick={() => setPaymentMethod("Cash")}
              >
                <Banknote className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase">
                  Tiền mặt
                </span>
              </Button>
              <Button
                variant={paymentMethod === "Transfer" ? "default" : "outline"}
                className={cn(
                  "flex flex-col h-16 gap-1 border-2",
                  paymentMethod === "Transfer" && "border-primary"
                )}
                onClick={() => setPaymentMethod("Transfer")}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase">
                  Chuyển khoản
                </span>
              </Button>
            </div>

            <Button
              className="w-full h-20 text-xl font-black shadow-xl uppercase tracking-widest transition-all active:scale-95"
              size="lg"
              disabled={loading || cart.length === 0}
              onClick={handleCheckout}
            >
              {loading ? "Đang xử lý..." : "Thanh toán (F12)"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
