"use client";

import React, { useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { 
  ShoppingCart, Search, Plus, Minus, X, Calendar, 
  Package, Trash2, Receipt, UserCircle, CreditCard, 
  Banknote, CheckCircle2, Moon, Sun, AlertCircle
} from "lucide-react";
import { useTheme } from "next-themes";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { formatPrice } from "@/lib/utils";
import { createSaleAction, getProductBatchesAction } from "@/app/actions/sales";
import { toast } from "sonner";

export default function POSForm({ products }: { products: any[] }) {
  const { theme, setTheme } = useTheme();
  const [cart, setCart] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  const [lastSale, setLastSale] = useState<any>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setLastSale(null),
  });

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      (p.name.toLowerCase().includes(q) || p.internal_code?.toLowerCase().includes(q)) 
    ).slice(0, 20);
  }, [products, searchQuery]);

  const addToCart = async (product: any) => {
    const cartId = `${product.id}-${Date.now()}`;
    let selected_batches: any[] = []; 
    let available_batches: any[] = [];

    if (product.manage_by_batch) {
      const res = await getProductBatchesAction(product.id);
      if (res.success && res.data.length > 0) {
        available_batches = res.data;
        selected_batches = [{
          batch_id: res.data[0].id,
          batch_number: res.data[0].batch_number,
          expiry_date: res.data[0].expiry_date,
          quantity_to_deduct: 1 
        }];
      }
    }

    const newItem = { ...product, cartId, quantity: 1, product_unit_id: null, unit_name: product.unit, conversion_factor: 1, sale_price: product.sale_price, selected_batches, available_batches };
    setCart([newItem, ...cart]);
  };

  const updateCartItem = (cartId: string, updates: any) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newItem = { ...item, ...updates };
        if (newItem.selected_batches?.length > 0) {
          const totalSmallQty = Number(newItem.quantity) * (Number(newItem.conversion_factor) || 1);
          newItem.selected_batches[0].quantity_to_deduct = totalSmallQty;
        }
        return newItem;
      }
      return item;
    }));
  };

  const handleUnitChange = (item: any, unitValue: string) => {
    if (unitValue === "base") {
      updateCartItem(item.cartId, { product_unit_id: null, unit_name: item.unit, conversion_factor: 1, sale_price: item.sale_price });
    } else {
      const unit = item.units?.find((u: any) => u.id === unitValue);
      if (unit) updateCartItem(item.cartId, { product_unit_id: unit.id, unit_name: unit.unit_name, conversion_factor: unit.conversion_factor, sale_price: unit.sale_price });
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.sale_price) * Number(item.quantity)), 0);
  const finalAmount = Math.max(0, totalAmount - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Giỏ hàng trống!");
    setLoading(true);
    const res = await createSaleAction({ items: cart, customerName: customer.name, customerPhone: customer.phone, totalAmount, discount, finalAmount, paymentMethod });
    if (res.success) {
      toast.success("Thanh toán thành công!");
      setLastSale({ saleCode: res.saleCode, items: [...cart], totalAmount, discount, finalAmount, customerName: customer.name });
      setCart([]); setCustomer({ name: "", phone: "" }); setDiscount(0);
      setTimeout(() => handlePrint(), 500);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-2 border-b bg-card shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" /> PHARMA POS
        </h1>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="h-4 w-4 hidden dark:block" />
        </Button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* VÙNG TÌM KIẾM & SẢN PHẨM */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden border-r">
          <div className="relative mb-4 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm thuốc hoặc mã vạch..."
              className="pl-10 h-10 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
              {filteredProducts.map(p => (
                <Card key={p.id} className="cursor-pointer hover:border-primary transition-all bg-card active:scale-95" onClick={() => addToCart(p)}>
                  <CardContent className="p-3">
                    <div className="flex justify-between text-[10px] mb-1 opacity-70 italic font-medium">
                      <span>{p.unit}</span>
                      <span>Tồn: {p.current_stock}</span>
                    </div>
                    <h4 className="font-bold text-xs line-clamp-2 h-8 uppercase leading-tight mb-2">{p.name}</h4>
                    <div className="text-primary font-bold text-sm">{formatPrice(p.sale_price)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* VÙNG GIỎ HÀNG: CỐ ĐỊNH CHIỀU CAO VÀ CUỘN RIÊNG */}
        <aside className="w-[420px] flex flex-col h-full bg-card overflow-hidden">
          {/* HEADER GIỎ HÀNG */}
          <div className="p-4 border-b bg-muted/20 flex justify-between items-center shrink-0">
            <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight">
              <ShoppingCart className="h-4 w-4 text-primary" /> Đơn hàng ({cart.length})
            </h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-destructive hover:bg-destructive/10" onClick={() => setCart([])}>
                XÓA TẤT CẢ
              </Button>
            )}
          </div>
          
          {/* PHẦN DANH SÁCH SẢN PHẨM: TỰ ĐỘNG CUỘN KHI QUÁ DÀI */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 space-y-4">
              {cart.map(item => (
                <div key={item.cartId} className="border-b pb-4 last:border-0 relative">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1">
                      <h5 className="font-bold text-[11px] uppercase leading-tight pr-4">{item.name}</h5>
                      {item.manage_by_batch && (
                        <button 
                          onClick={() => { setEditingItem(item); setIsBatchDialogOpen(true); }}
                          className={`mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold transition-all ${
                            item.selected_batches[0] 
                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-700 dark:text-amber-400" 
                            : "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-600 animate-pulse"
                          }`}
                        >
                          <Package className="h-3 w-3" />
                          {item.selected_batches[0] ? `Lô: ${item.selected_batches[0].batch_number}` : "BẤM CHỌN LÔ!"}
                        </button>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5 absolute -right-1 top-0" onClick={() => setCart(cart.filter(i => i.cartId !== item.cartId))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-12 gap-1.5">
                    <div className="col-span-4">
                      <Select value={item.product_unit_id || "base"} onValueChange={(v) => handleUnitChange(item, v)}>
                        <SelectTrigger className="h-7 text-[10px] font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="base">{item.unit}</SelectItem>{item.units?.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.unit_name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input type="number" className="h-7 text-center font-bold text-xs" value={item.quantity} onChange={(e) => updateCartItem(item.cartId, { quantity: e.target.value })} />
                    </div>
                    <div className="col-span-5">
                      <Input type="number" className="h-7 text-right font-bold text-xs text-primary bg-muted/30 border-none" value={item.sale_price} onChange={(e) => updateCartItem(item.cartId, { sale_price: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 opacity-30 italic text-xs">
                  <ShoppingCart className="h-8 w-8 mb-2" /> Giỏ hàng trống
                </div>
              )}
            </div>
          </div>

          {/* PHẦN THANH TOÁN: LUÔN CỐ ĐỊNH Ở DƯỚI */}
          <div className="shrink-0 p-4 border-t bg-muted/10 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold opacity-70 uppercase">Tên khách hàng</Label>
                <Input placeholder="..." className="h-8 text-xs" value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold opacity-70 uppercase">Số điện thoại</Label>
                <Input placeholder="..." className="h-8 text-xs" value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-between items-center bg-card p-2 rounded border border-dashed">
              <span className="text-xs font-bold opacity-70">Giảm giá trực tiếp:</span>
              <Input type="number" className="h-7 w-28 text-right font-bold text-destructive border-none bg-transparent" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>

            <Tabs defaultValue="cash" onValueChange={setPaymentMethod} className="w-full">
              <TabsList className="grid grid-cols-2 h-9 bg-muted">
                <TabsTrigger value="cash" className="text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-white">TIỀN MẶT</TabsTrigger>
                <TabsTrigger value="transfer" className="text-[10px] font-bold uppercase data-[state=active]:bg-primary data-[state=active]:text-white">CHUYỂN KHOẢN</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex justify-between items-end py-1">
              <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Tổng thanh toán</span>
                <span className="text-xs font-medium line-through opacity-30">{formatPrice(totalAmount)}</span>
              </div>
              <span className="text-2xl font-black text-primary tracking-tighter leading-none">{formatPrice(finalAmount)}</span>
            </div>

            <Button className="w-full h-12 text-sm font-bold uppercase shadow-lg shadow-primary/20" disabled={loading || cart.length === 0} onClick={handleCheckout}>
              {loading ? "Đang lưu..." : "XÁC NHẬN THANH TOÁN (F12)"}
            </Button>
          </div>
        </aside>
      </main>

      {/* DIALOG CHỌN LÔ HÀNG */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogOverlay className="bg-black/70 backdrop-blur-md" /> 
        <DialogContent className="sm:max-w-[420px] bg-card border shadow-2xl p-0">
          <DialogHeader className="p-4 border-b bg-primary text-primary-foreground">
            <DialogTitle className="text-sm font-bold uppercase flex items-center gap-2">
              <Package className="h-4 w-4" /> CHỌN LÔ CHO: {editingItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 max-h-[400px] overflow-auto">
            {editingItem?.available_batches?.length > 0 ? (
              <div className="grid gap-2">
                {editingItem.available_batches.map((b: any) => (
                  <div 
                    key={b.id} 
                    className={`p-3 border-2 rounded-xl cursor-pointer flex justify-between items-center transition-all ${editingItem.selected_batches[0]?.batch_id === b.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                    onClick={() => {
                      const totalSmallQty = Number(editingItem.quantity) * Number(editingItem.conversion_factor);
                      const newBatch = [{ batch_id: b.id, batch_number: b.batch_number, expiry_date: b.expiry_date, quantity_to_deduct: totalSmallQty }];
                      setCart(cart.map(i => i.cartId === editingItem.cartId ? { ...i, selected_batches: newBatch } : i));
                      setIsBatchDialogOpen(false);
                    }}
                  >
                    <div>
                      <div className="font-bold text-sm uppercase">Lô: {b.batch_number}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3" /> Hạn dùng: {new Date(b.expiry_date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase opacity-50 font-bold">Còn tồn</div>
                      <div className="text-sm font-black text-primary">{b.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-destructive text-sm font-bold flex flex-col items-center gap-2 uppercase">
                <AlertCircle className="h-8 w-8" /> Thuốc đã hết sạch lô trong kho!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PrintInvoice ref={printRef} data={lastSale} />
    </div>
  );
}

// COMPONENT IN HÓA ĐƠN
const PrintInvoice = React.forwardRef(({ data }: { data: any }, ref: any) => {
  if (!data) return null;
  return (
    <div style={{ display: "none" }}>
      <div ref={ref} className="p-4 text-black font-mono text-[12px] w-[80mm] leading-tight bg-white">
        <div className="text-center mb-4 border-b pb-2">
          <h2 className="text-[16px] font-bold uppercase italic">NHÀ THUỐC PHÁT TÀI</h2>
          <p className="text-[10px]">Ngày: {new Date().toLocaleString("vi-VN")}</p>
        </div>
        <table className="w-full mb-3 text-[11px]">
          <thead><tr className="border-b"><th className="text-left py-1">Tên thuốc</th><th className="text-right py-1">T.Tiền</th></tr></thead>
          <tbody>
            {data.items.map((item: any, i: number) => (
              <tr key={i} className="border-b border-dashed">
                <td className="py-2 pr-2 leading-tight">
                  <span className="font-bold uppercase text-[10px]">{item.name}</span><br/>
                  {item.quantity} {item.unit_name} x {formatPrice(item.sale_price)}
                </td>
                <td className="text-right font-bold align-bottom">{formatPrice(Number(item.quantity) * Number(item.sale_price))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right space-y-1 pt-2 border-t">
          <p className="flex justify-between italic"><span>Cộng:</span> <span>{formatPrice(data.totalAmount)}</span></p>
          <p className="flex justify-between italic text-destructive font-bold"><span>Giảm:</span> <span>-{formatPrice(data.discount)}</span></p>
          <div className="flex justify-between text-base font-bold pt-1 border-t-2 border-black">
            <span>TỔNG CỘNG:</span> <span>{formatPrice(data.finalAmount)}</span>
          </div>
        </div>
        <div className="text-center mt-6 text-[10px] italic">Chúc quý khách sức khỏe!</div>
      </div>
    </div>
  );
});
PrintInvoice.displayName = "PrintInvoice";