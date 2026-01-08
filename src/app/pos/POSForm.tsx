"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  ShoppingCart,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Package,
  Search,
  Plus,
  Minus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { createSaleAction, getProductBatchesAction } from "@/app/actions/sales";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function POSForm({ products }: { products: any[] }) {
  const [cart, setCart] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Khai báo Ref và State dành cho in ấn
  const printRef = useRef<HTMLDivElement>(null);
  const [lastSale, setLastSale] = useState<any>(null);

  // 2. Thiết lập hàm kích hoạt in
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setLastSale(null), // Xóa dữ liệu sau khi in xong
  });

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.slice(0, 20); // Limit initial display
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.code?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 20);
  }, [products, searchQuery]);

  // Phím tắt F12 thanh toán
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

  // Cập nhật số lượng
  const updateQuantity = (cartItemId: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartItemId) return item;

        let newQty = qty;
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

  // Thêm sản phẩm vào giỏ
  const addToCart = async (product: any) => {
    if (product.current_stock <= 0) {
      return toast.error("Sản phẩm đã hết hàng!");
    }

    setLoading(true);
    try {
      if (product.manage_by_batch) {
        const res = await getProductBatchesAction(product.id);
        if (!res.success || res.data.length === 0) {
          toast.error("Không tìm thấy lô hàng khả dụng!");
          return;
        }

        const batches = res.data;
        const firstBatch = batches[0];
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

  // Tính toán tiền
  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0),
    [cart]
  );
  const finalAmount = Math.max(0, totalAmount - discount);

  // Xử lý thanh toán
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
      // Gán dữ liệu vào state in trước khi xóa giỏ hàng
      setLastSale({
        saleCode: res.saleCode,
        items: [...cart],
        totalAmount,
        discount,
        finalAmount,
      });
      setCart([]);
      setCustomer({ name: "", phone: "" });
      setDiscount(0);
      // Tự động bật hộp thoại in sau 0.5 giây
      setTimeout(() => {
        handlePrint();
      }, 500);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cột trái: Tìm kiếm sản phẩm */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm sản phẩm</CardTitle>
            <CardDescription>Nhập tên hoặc mã sản phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6 max-h-[400px] overflow-y-auto p-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.current_stock <= 0}
                  className="flex flex-col items-center p-4 rounded-lg border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-3 rounded-full bg-primary/10 mb-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(product.sale_price)}
                    </p>
                    <Badge
                      variant={
                        product.current_stock > 0 ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {product.current_stock} {product.unit}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Giỏ hàng */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Giỏ hàng
                </CardTitle>
                <CardDescription>{cart.length} sản phẩm</CardDescription>
              </div>
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setCart([])}>
                  Xóa tất cả
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Giỏ hàng trống</h3>
                <p className="text-muted-foreground">
                  Thêm sản phẩm để bắt đầu bán hàng
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          {item.manage_by_batch && (
                            <div className="flex items-center gap-2 mt-1">
                              <Select
                                value={item.selected_batch_id}
                                onValueChange={(val) => {
                                  const batch = item.available_batches.find(
                                    (x: any) => x.id === val
                                  );
                                  setCart((prev) =>
                                    prev.map((i) =>
                                      i.cartId === item.cartId
                                        ? {
                                            ...i,
                                            selected_batch_id: val,
                                            selected_batch_number:
                                              batch.batch_number,
                                            selected_batch_qty: batch.quantity,
                                          }
                                        : i
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs w-[180px]">
                                  <SelectValue placeholder="Chọn lô" />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.available_batches?.map((batch: any) => (
                                    <SelectItem key={batch.id} value={batch.id}>
                                      Lô {batch.batch_number} - HSD:{" "}
                                      {new Date(
                                        batch.expiry_date
                                      ).toLocaleDateString("vi-VN")}{" "}
                                      (Còn {batch.quantity})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatPrice(item.sale_price * item.quantity)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.sale_price)} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            className="w-20 text-center"
                            onChange={(e) =>
                              updateQuantity(
                                item.cartId,
                                Number(e.target.value)
                              )
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeFromCart(item.cartId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cột phải: Thanh toán */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Tên khách hàng</Label>
              <Input
                id="customer-name"
                placeholder="Nhập tên khách hàng"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Số điện thoại</Label>
              <Input
                id="customer-phone"
                placeholder="Nhập số điện thoại"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Chiết khấu</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discount"
                    type="number"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="text-right"
                  />
                  <span className="text-muted-foreground">VND</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-primary">{formatPrice(finalAmount)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Phương thức thanh toán</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  className="h-12 flex flex-col gap-1"
                  onClick={() => setPaymentMethod("cash")}
                >
                  <Banknote className="h-5 w-5" />
                  <span className="text-xs">Tiền mặt</span>
                </Button>
                <Button
                  variant={paymentMethod === "transfer" ? "default" : "outline"}
                  className="h-12 flex flex-col gap-1"
                  onClick={() => setPaymentMethod("transfer")}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Chuyển khoản</span>
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold"
              disabled={loading || cart.length === 0}
              onClick={handleCheckout}
            >
              {loading
                ? "Đang xử lý..."
                : `Thanh toán ${formatPrice(finalAmount)}`}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              Nhấn <kbd className="px-2 py-1 bg-muted rounded">F12</kbd> để
              thanh toán nhanh
            </div>
          </CardContent>
        </Card>
      </div>
      {/* 4. CHÈN COMPONENT IN VÀO CUỐI JSX */}
      <PrintInvoice ref={printRef} data={lastSale} />
    </div>
  );
}

const PrintInvoice = React.forwardRef(({ data }: { data: any }, ref: any) => {
  if (!data) return null;

  return (
    <div style={{ display: "none" }}>
      {" "}
      {/* Ẩn template này trên giao diện web */}
      <div ref={ref} className="print-area">
        <div className="text-center font-mono">
          <h2 className="text-[16px] font-bold uppercase">NHÀ THUỐC CỦA BẠN</h2>
          <p className="text-[11px]">Đ/C: 123 Đường Số 1, Quận 10, TP.HCM</p>
          <p className="text-[11px]">SĐT: 0900.000.000</p>
          <div className="border-b border-dashed border-black my-2" />
          <h3 className="text-[14px] font-bold">HÓA ĐƠN BÁN LẺ</h3>
          <p className="text-[11px]">Mã đơn: {data.saleCode}</p>
          <p className="text-[11px]">
            Ngày: {new Date().toLocaleString("vi-VN")}
          </p>
        </div>

        <table className="w-full text-[11px] font-mono mt-4 border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Tên hàng</th>
              <th className="text-center py-1">SL</th>
              <th className="text-right py-1">Tiền</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-dotted border-gray-400">
                <td className="py-1 leading-tight">{item.name}</td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">
                  {(item.sale_price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-[11px] font-mono space-y-1">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{data.totalAmount.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá:</span>
            <span>{data.discount.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between font-bold text-[13px] border-t border-dashed border-black pt-1">
            <span>THANH TOÁN:</span>
            <span>{data.finalAmount.toLocaleString()}đ</span>
          </div>
        </div>

        <div className="text-center mt-6 text-[10px] italic font-mono">
          <p>Cảm ơn quý khách. Hẹn gặp lại!</p>
        </div>

        {/* CSS chuyên dụng cho máy in nhiệt */}
        <style jsx>{`
          .print-area {
            width: 72mm; /* Khổ giấy thực tế sau khi trừ lề máy in */
            padding: 0;
            color: #000;
            background: #fff;
          }
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
});
PrintInvoice.displayName = "PrintInvoice";
