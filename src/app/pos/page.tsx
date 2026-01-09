import { getProducts } from "@/app/actions/products"; // Tái sử dụng action đã bảo mật
import POSForm from "./POSForm";
import { AlertCircle, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function POSPage() {
  /**
   * 1. Lấy danh sách sản phẩm thông qua Action đã có RLS.
   * Lọc: is_active = true và chỉ lấy sản phẩm có tồn kho (current_stock > 0).
   * pageSize đặt lớn (ví dụ 2000) để nhân viên bán hàng có thể tìm kiếm nhanh tại máy POS.
   */
  const { products } = await getProducts(
    { is_active: true }, 
    1, 
    2000
  );

  // Lọc thêm ở tầng Server để chỉ lấy sản phẩm còn hàng
  // (Nếu hàm getProducts chưa hỗ trợ lọc current_stock trong filters)
  const availableProducts = products.filter(p => (p.current_stock ?? 0) > 0);

  // 2. Xử lý trường hợp không có hàng để bán
  if (availableProducts.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="max-w-md mx-auto p-10 border-2 border-dashed rounded-2xl bg-muted/20">
          <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold">Kho hàng trống</h2>
          <p className="text-muted-foreground mt-2">
            Không tìm thấy sản phẩm nào còn tồn kho để bán. 
            Vui lòng nhập hàng hoặc kiểm tra lại trạng thái sản phẩm.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" asChild>
              <Link href="/entries/new">Nhập hàng</Link>
            </Button>
            <Button asChild>
              <Link href="/products">Quản lý sản phẩm</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Bán hàng (POS)</h1>
        <p className="text-muted-foreground">
          Tìm kiếm sản phẩm bằng tên hoặc mã vạch để tạo hóa đơn
        </p>
      </div>

      {/* Truyền danh sách sản phẩm đã được lọc qua RLS vào Form POS */}
      <POSForm products={availableProducts} />
    </div>
  );
}