"use client";
import { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart,
  Trash2,
  User,
  CreditCard,
  Banknote,
  AlertCircle,
  Layers,
  Package,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductSearch } from "@/components/products/ProductSearch";
import { formatPrice, cn } from "@/lib/utils";
import { createSaleAction, getProductBatchesAction } from "@/app/actions/sales";
import { toast } from "sonner";

export default function POSForm({ products }: { products: any[] }) {
  const [cart, setCart] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [loading, setLoading] = useState(false);

  // 1. Phím tắt F12 thanh toán
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

  // 2. Logic cập nhật số lượng (Kiểm tra tồn theo Lô hoặc theo Tổng)
  const updateQuantity = (cartItemId: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartItemId) return item;

        let newQty = qty;
        // Kiểm tra tồn kho khả dụng
        const maxAvailable = item.manage_by_batch
          ? item.selected_batch_qty
          : item.current_stock;

        if (newQty > maxAvailable) {
          toast.warning(`Chỉ còn ${maxAvailable} sản phẩm khả dụng`);
          newQty = maxAvailable;
        }
        if (newQty < 1) newQty = 1;

        return { ...item, quantity: newQty };
      })
    );
  };

  // 3. Thêm sản phẩm vào giỏ hàng (Xử lý Batch)
  const addToCart = async (product: any) => {
    if (product.current_stock <= 0) {
      return toast.error("Sản phẩm đã hết hàng!");
    }

    setLoading(true);
    try {
      if (product.manage_by_batch) {
        // Lấy danh sách lô còn hạn và còn hàng
        const res = await getProductBatchesAction(product.id);
        if (!res.success || res.data.length === 0) {
          toast.error(
            "Sản phẩm theo lô nhưng không tìm thấy lô hàng khả dụng!"
          );
          return;
        }

        const batches = res.data;
        const firstBatch = batches[0]; // Lô ưu tiên (HSD gần nhất)

        // CartId kết hợp Product + Batch để phân biệt nếu cùng 1 thuốc nhưng chọn 2 lô khác nhau
        const cartId = `${product.id}-${firstBatch.id}`;
        const existing = cart.find((i) => i.cartId === cartId);

        if (existing) {
          updateQuantity(cartId, existing.quantity + 1);
        } else {
          setCart([
            ...cart,
            {
              ...product,
              cartId,
              quantity: 1,
              selected_batch_id: firstBatch.id,
              selected_batch_number: firstBatch.batch_number,
              selected_batch_qty: firstBatch.quantity,
              available_batches: batches,
            },
          ]);
        }
      } else {
        // Hàng thường không theo lô
        const cartId = product.id;
        const existing = cart.find((i) => i.cartId === cartId);
        if (existing) {
          updateQuantity(cartId, existing.quantity + 1);
        } else {
          setCart([...cart, { ...product, cartId, quantity: 1 }]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (cartId: string) =>
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));

  // 4. Tính toán tiền
  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0),
    [cart]
  );
  const finalAmount = Math.max(0, totalAmount - discount);

  // 5. Xử lý thanh toán
  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Giỏ hàng đang trống");
    if (loading) return;

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
      toast.error(res.message);
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

        <Card className="flex-1 overflow-hidden flex flex-col shadow-sm border-slate-200">
          <CardHeader className="py-3 border-b bg-slate-50/50">
            <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              Giỏ hàng ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow className="bg-slate-50/30">
                  <TableHead className="text-xs uppercase font-bold">
                    Sản phẩm / Thông tin lô
                  </TableHead>
                  <TableHead className="w-24 text-center text-xs uppercase font-bold">
                    ĐVT
                  </TableHead>
                  <TableHead className="w-32 text-center text-xs uppercase font-bold">
                    Số lượng
                  </TableHead>
                  <TableHead className="text-right text-xs uppercase font-bold">
                    Đơn giá
                  </TableHead>
                  <TableHead className="text-right text-xs uppercase font-bold">
                    Thành tiền
                  </TableHead>
                  <TableHead className="w-10 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-slate-400 italic"
                    >
                      Chưa có thuốc nào trong giỏ hàng. Quét mã hoặc tìm kiếm để
                      thêm.
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow
                      key={item.cartId}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800">
                            {item.name}
                          </div>
                          {item.manage_by_batch ? (
                            <div className="flex items-center gap-2">
                              <Layers size={12} className="text-blue-500" />
                              <Select
                                value={item.selected_batch_id}
                                onValueChange={(val) => {
                                  const b = item.available_batches.find(
                                    (x: any) => x.id === val
                                  );
                                  setCart((prev) =>
                                    prev.map((i) =>
                                      i.cartId === item.cartId
                                        ? {
                                            ...i,
                                            selected_batch_id: val,
                                            selected_batch_number:
                                              b.batch_number,
                                            selected_batch_qty: b.quantity,
                                          }
                                        : i
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className="h-7 text-[10px] w-[200px] border-blue-100 bg-blue-50/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.available_batches?.map((b: any) => (
                                    <SelectItem
                                      key={b.id}
                                      value={b.id}
                                      className="text-[11px]"
                                    >
                                      Lô: {b.batch_number} - HSD:{" "}
                                      {new Date(
                                        b.expiry_date
                                      ).toLocaleDateString("vi-VN")}{" "}
                                      (Còn {b.quantity})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                              <Package size={12} /> Hàng không quản lý lô
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-slate-500 font-medium text-sm">
                        {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <Input
                            type="number"
                            value={item.quantity}
                            className="h-8 text-center font-black border-slate-300 focus:ring-blue-500 w-20"
                            onChange={(e) =>
                              updateQuantity(
                                item.cartId,
                                Number(e.target.value)
                              )
                            }
                          />
                          <span className="text-[9px] text-slate-400">
                            Tối đa:{" "}
                            {item.manage_by_batch
                              ? item.selected_batch_qty
                              : item.current_stock}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-600">
                        {formatPrice(item.sale_price)}
                      </TableCell>
                      <TableCell className="text-right font-black text-blue-700">
                        {formatPrice(item.sale_price * item.quantity)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-300 hover:text-red-500"
                          onClick={() => removeFromCart(item.cartId)}
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
      <div className="lg:col-span-1 flex flex-col gap-4">
        <Card className="shadow-lg border-t-4 border-t-blue-600 flex flex-col h-full">
          <CardContent className="p-5 flex flex-col flex-1">
            <div className="space-y-4 mb-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-2">
                <User className="h-4 w-4" /> Khách hàng
              </h3>
              <Input
                placeholder="Tên khách hàng"
                className="bg-slate-50 focus:bg-white"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
              <Input
                placeholder="Số điện thoại"
                className="bg-slate-50 focus:bg-white"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-3 border-t border-dashed pt-4 flex-1 text-sm font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Chiết khấu:</span>
                <div className="flex items-center gap-1 border rounded bg-white px-2 py-1">
                  <span className="text-red-500 font-bold">-</span>
                  <input
                    type="number"
                    className="w-20 text-right font-bold text-red-500 outline-none"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="pt-4 mt-4 border-t-2 border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Tổng cộng thanh toán
                </span>
                <div className="text-3xl font-black text-blue-600 text-right tracking-tight">
                  {formatPrice(finalAmount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-6">
              <Button
                variant={paymentMethod === "Cash" ? "default" : "outline"}
                className={cn(
                  "h-16 flex flex-col gap-1 border-2 transition-all",
                  paymentMethod === "Cash"
                    ? "bg-blue-600 border-blue-700"
                    : "border-slate-100"
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
                  "h-16 flex flex-col gap-1 border-2 transition-all",
                  paymentMethod === "Transfer"
                    ? "bg-blue-600 border-blue-700"
                    : "border-slate-100"
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
              className="w-full h-16 text-lg font-black bg-green-600 hover:bg-green-700 shadow-xl transition-all active:scale-95"
              disabled={loading || cart.length === 0}
              onClick={handleCheckout}
            >
              {loading ? "ĐANG XỬ LÝ..." : "THANH TOÁN (F12)"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
