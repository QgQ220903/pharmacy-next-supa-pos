import { getProducts } from "@/app/actions/products"; // Sử dụng lại action đã sửa
import NewStockEntryForm from "@/components/entries/NewStockEntryForm";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewEntryPage() {
  // 1. Gọi action lấy danh sách sản phẩm đang kinh doanh
  // pageSize lớn (ví dụ 1000) để đảm bảo load đủ danh sách cho form chọn
  const { products, totalCount } = await getProducts(
    { is_active: true }, 
    1, 
    1000 
  );

  // 2. Kiểm tra nếu không có sản phẩm nào
  if (products.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <div className="max-w-md mx-auto p-8 border rounded-xl bg-muted/30">
          <AlertCircle className="h-10 w-10 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold">Chưa có sản phẩm</h2>
          <p className="text-muted-foreground mt-2">
            Bạn cần tạo sản phẩm trước khi có thể thực hiện nhập kho.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products/new">Tạo sản phẩm ngay</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-in fade-in duration-500">

      <NewStockEntryForm products={products} />
    </div>
  );
}