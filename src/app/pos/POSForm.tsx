"use client";

import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import {
  ShoppingCart, Trash2, Receipt, CreditCard,
  Banknote, CheckCircle2, Loader2, X,
  Plus, Minus, Package, Search,
  Percent, Phone, UserCircle, ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

import { ProductSearchPOS } from "@/components/pos/ProductSearchPOS";
import { BatchSelector } from "@/components/pos/BatchSelector";
import { PrintInvoice } from "@/components/pos/PrintInvoice";
import { createSaleAction } from "@/app/actions/sales";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface CartItem {
  id: string;
  cartId: string;
  product_id: string;
  name: string;
  quantity: number;
  sale_price: number;
  base_unit: string;
  unit_name: string;
  conversion_factor: number;
  product_unit_id: string | null;
  manage_by_batch: boolean;
  units?: any[];
  selected_batches: any[];
}

interface Props {
  initialProducts: any[];
  totalCount: number;
}

export default function POSForm({ initialProducts, totalCount }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);

  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCartId, setSelectedCartId] = useState<string>("");

  const printRef = useRef<HTMLDivElement>(null);
  const [lastSale, setLastSale] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setLastSale(null),
  });

  const addToCart = (product: any) => {
    const cartId = `${product.id}-${Date.now()}-${Math.random()}`;
    const newItem: CartItem = {
      id: product.id,
      cartId,
      product_id: product.id,
      name: product.name,
      quantity: 1,
      sale_price: product.sale_price,
      base_unit: product.base_unit,
      unit_name: product.base_unit,
      conversion_factor: 1,
      product_unit_id: null,
      manage_by_batch: product.manage_by_batch,
      units: product.units,
      selected_batches: [],
    };
    setCart(prev => [newItem, ...prev]);
    if (product.manage_by_batch) {
      setSelectedProduct(product);
      setSelectedCartId(cartId);
      setBatchDialogOpen(true);
    } else {
      toast.success(`Đã thêm ${product.name} vào giỏ`);
    }
  };

  const handleBatchSelected = (batch: any) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === selectedCartId) {
        const totalQty = item.quantity * item.conversion_factor;
        return {
          ...item,
          selected_batches: [{
            batch_id: batch.id,
            batch_number: batch.batch_number,
            expiry_date: batch.expiry_date,
            quantity_to_deduct: totalQty
          }]
        };
      }
      return item;
    }));
  };

  const updateCartItem = (cartId: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newItem = { ...item, ...updates };
        if (newItem.selected_batches?.length > 0) {
          const totalQty = newItem.quantity * newItem.conversion_factor;
          newItem.selected_batches[0].quantity_to_deduct = totalQty;
        }
        return newItem;
      }
      return item;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount(0);
    toast.info("Đã xóa giỏ hàng");
  };

  const handleUnitChange = (item: CartItem, unitId: string) => {
    if (unitId === "base") {
      updateCartItem(item.cartId, {
        product_unit_id: null,
        unit_name: item.base_unit,
        conversion_factor: 1,
        sale_price: item.sale_price
      });
    } else {
      const unit = item.units?.find(u => u.id === unitId);
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

  const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.sale_price), 0);
  const finalAmount = Math.max(0, totalAmount - discount);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error("Giỏ hàng trống!"); return; }
    const missingBatch = cart.find(item => item.manage_by_batch && item.selected_batches.length === 0);
    if (missingBatch) { toast.error(`Sản phẩm "${missingBatch.name}" chưa chọn lô!`); return; }

    setLoading(true);
    try {
      const result = await createSaleAction({
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        totalAmount, discount, finalAmount, paymentMethod,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.sale_price,
          unit_name: item.unit_name,
          conversion_factor: item.conversion_factor,
          product_unit_id: item.product_unit_id,
          selected_batches: item.selected_batches.map(b => ({
            batch_id: b.batch_id,
            batch_number: b.batch_number,
            quantity_to_deduct: b.quantity_to_deduct
          }))
        }))
      });

      if (result.success) {
        toast.success("Thanh toán thành công!");
        setLastSale({
          saleCode: result.saleCode,
          items: cart,
          customerName, customerPhone,
          totalAmount, discount, finalAmount, paymentMethod,
          date: new Date()
        });
        clearCart();
        setTimeout(() => handlePrint(), 500);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Container chính */}
      <div className="h-[calc(100vh-130px)] flex flex-col bg-background rounded-xl border shadow-lg overflow-hidden">

        {/* Top search bar */}
        <div className="shrink-0 px-4 py-2 border-b bg-card/30 flex items-center gap-3">
          <div className="flex-1 max-w-xl">
            <ProductSearchPOS
              onSelect={addToCart}
              initialProducts={initialProducts}
              onSearchChange={setSearchQuery}
            />
          </div>
          <p className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
            Nhập tên, mã SP hoặc quét mã vạch
          </p>
        </div>

        {/* 2 columns: Cart + Checkout */}
        <div className="flex flex-1 min-h-0 divide-x">

          {/* Column 2: Cart */}
          <div className="flex-1 flex flex-col bg-background min-w-[500px]">
            {/* Cart header */}
            <div className="shrink-0 px-6 py-3 border-b bg-muted/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Giỏ hàng</h3>
                  <p className="text-xs text-muted-foreground">
                    {cart.length} sản phẩm · {totalItems} đơn vị
                  </p>
                </div>
              </div>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Xóa tất cả
                </Button>
              )}
            </div>

            {/* Cart items - scrollable with native CSS */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                    <ShoppingCart className="h-8 w-8 opacity-30" />
                  </div>
                  <p className="text-sm font-medium">Giỏ hàng đang trống</p>
                  <p className="text-xs opacity-70 mt-0.5">Tìm kiếm sản phẩm ở thanh tìm kiếm phía trên</p>
                </div>
              ) : (
                cart.map((item) => {
                  const needsBatch = item.manage_by_batch && item.selected_batches.length === 0;

                  return (
                    <Card
                      key={item.cartId}
                      className={`overflow-hidden border-l-2 ${needsBatch
                          ? 'border-l-destructive shadow-sm'
                          : 'border-l-primary hover:shadow-sm'
                        }`}
                    >
                      <div className="p-3">
                        {/* Dòng 1: Thông tin cơ bản và nút xóa */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${needsBatch ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                              <Package className={`h-4 w-4 ${needsBatch ? 'text-destructive' : 'text-primary'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                  {item.unit_name}
                                </Badge>
                                {item.manage_by_batch && (
                                  <Badge
                                    variant={needsBatch ? "destructive" : "outline"}
                                    className="text-[10px] px-1 py-0 h-4 cursor-pointer"
                                    onClick={() => {
                                      setSelectedProduct({
                                        id: item.product_id,
                                        name: item.name,
                                        base_unit: item.base_unit
                                      });
                                      setSelectedCartId(item.cartId);
                                      setBatchDialogOpen(true);
                                    }}
                                  >
                                    {needsBatch ? '⚠ Chọn lô' : `Lô: ${item.selected_batches[0]?.batch_number}`}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeFromCart(item.cartId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Dòng 2: Điều chỉnh số lượng và đơn giá */}
                        <div className="flex items-center gap-3">
                          {/* Chọn đơn vị tính */}
                          {item.units && item.units.length > 0 && (
                            <select
                              className="h-8 text-xs border rounded-md px-2 bg-background focus:ring-1 focus:ring-primary w-24"
                              value={item.product_unit_id || "base"}
                              onChange={(e) => handleUnitChange(item, e.target.value)}
                            >
                              <option value="base">{item.base_unit}</option>
                              {item.units?.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.unit_name}
                                </option>
                              ))}
                            </select>
                          )}

                          {/* Điều chỉnh số lượng */}
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-muted"
                              onClick={() => updateCartItem(item.cartId, { quantity: Math.max(1, item.quantity - 1) })}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1) updateCartItem(item.cartId, { quantity: val });
                              }}
                              className="h-8 w-16 text-center rounded-none border-0 [appearance:textfield] text-sm px-0"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none hover:bg-muted"
                              onClick={() => updateCartItem(item.cartId, { quantity: item.quantity + 1 })}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {/* Điều chỉnh đơn giá */}
                          <div className="relative flex-1 max-w-[140px]">
                            <Input
                              type="text"
                              inputMode="numeric"
                              value={item.sale_price.toLocaleString('vi-VN')}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, '');
                                const val = parseInt(raw);
                                if (!isNaN(val) && val >= 0) updateCartItem(item.cartId, { sale_price: val });
                              }}
                              className="h-8 text-sm pl-6 pr-2 text-right"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₫</span>
                          </div>

                          {/* Thành tiền */}
                          <div className="text-right min-w-[100px]">
                            <div className="text-sm font-semibold text-primary">
                              {formatPrice(item.quantity * item.sale_price)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {formatPrice(item.sale_price)}/{item.unit_name}
                            </div>
                          </div>
                        </div>

                        {/* Hiển thị lô đã chọn (nếu có) */}
                        {item.manage_by_batch && item.selected_batches.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-1.5 rounded flex items-center gap-2">
                            <Package className="h-3 w-3" />
                            <span>Lô: {item.selected_batches[0].batch_number}</span>
                            <span>•</span>
                            <span>HSD: {formatDate(item.selected_batches[0].expiry_date, "DD/MM/YYYY")}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 3: Checkout */}
          <div className="w-96 flex flex-col border-l bg-card/30">
            {/* Checkout header */}
            <div className="shrink-0 px-4 py-3 border-b bg-muted/10">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Thanh toán</h3>
                  <p className="text-xs text-muted-foreground">
                    Hoàn tất đơn hàng
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout content - scrollable with native CSS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Thông tin khách hàng</span>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Tên khách hàng"
                      className="h-9 text-sm"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Số điện thoại"
                        className="h-9 text-sm pl-9"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Chiết khấu</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={discount.toLocaleString('vi-VN')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '');
                        const val = parseInt(raw);
                        setDiscount(!isNaN(val) && val >= 0 ? val : 0);
                      }}
                      className="h-9 pl-8 pr-3 text-right text-sm"
                      placeholder="0"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₫</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm font-medium mb-3 block">
                    Phương thức thanh toán
                  </Label>
                  <Tabs defaultValue="cash" onValueChange={setPaymentMethod} className="w-full">
                    <TabsList className="grid grid-cols-2 h-10">
                      <TabsTrigger value="cash" className="text-sm gap-2">
                        <Banknote className="h-4 w-4" />
                        Tiền mặt
                      </TabsTrigger>
                      <TabsTrigger value="transfer" className="text-sm gap-2">
                        <CreditCard className="h-4 w-4" />
                        Chuyển khoản
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium">{formatPrice(totalAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>Giảm giá:</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số lượng:</span>
                    <span className="font-medium">{totalItems} đơn vị</span>
                  </div>
                  <Separator className="bg-primary/10" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(finalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checkout button */}
            <div className="shrink-0 p-4 border-t bg-card">
              <Button
                className="w-full h-12 text-base font-semibold gap-2"
                disabled={loading || cart.length === 0}
                onClick={handleCheckout}
              >
                {loading ? (
                  <><Loader2 className="h-5 w-5 animate-spin" />Đang xử lý...</>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Thanh toán
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-2 border-t bg-muted/5 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">F2</kbd>
            <span>Tìm kiếm</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">F8</kbd>
            <span>Thanh toán</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">F4</kbd>
            <span>Thêm khách hàng</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="text-[10px]">
              <Package className="h-3 w-3 mr-1" />
              {cart.length} SP trong giỏ
            </Badge>
          </div>
        </div>
      </div>

      <BatchSelector
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        product={selectedProduct}
        quantity={cart.find(i => i.cartId === selectedCartId)?.quantity || 1}
        conversionFactor={cart.find(i => i.cartId === selectedCartId)?.conversion_factor || 1}
        onSelect={handleBatchSelected}
      />
      <PrintInvoice ref={printRef} data={lastSale} />
    </>
  );
}