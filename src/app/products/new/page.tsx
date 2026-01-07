import { getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewProductPage() {
  // Lấy danh mục (đã bao gồm mặc định + từ DB trong Server Action)
  const categories = await getProductCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Nút quay lại và Tiêu đề */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Thêm sản phẩm mới
          </h1>
          <p className="text-sm text-muted-foreground">
            Thiết lập thông tin thuốc và chế độ quản lý kho cho nhà thuốc
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BÊN TRÁI: FORM CHÍNH */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            {/* Truyền mảng categories xuống cho ProductForm */}
            <ProductForm categories={categories} />
          </div>
        </div>

        {/* BÊN PHẢI: HƯỚNG DẪN & LƯU Ý */}
        <div className="space-y-6">
          <Card className="border-purple-100 bg-purple-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                <Layers className="h-5 w-5" /> Chế độ quản lý
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[13px] text-purple-900/80 space-y-3 leading-relaxed">
              <div className="bg-white/50 p-3 rounded-lg border border-purple-100">
                <p className="font-bold text-purple-800 mb-1">
                  📌 Quản lý theo lô:
                </p>
                <p>
                  Dành cho thuốc có hạn dùng cụ thể. Giúp theo dõi lô hết hạn
                  trước (FEFO) để xuất bán trước.
                </p>
              </div>
              <div className="bg-white/50 p-3 rounded-lg border border-purple-100">
                <p className="font-bold text-purple-800 mb-1">
                  📌 Quản lý tổng hợp:
                </p>
                <p>
                  Dành cho bông, băng, gạc, xi lanh... không cần theo dõi hạn
                  dùng từng đợt nhập.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                <Info className="h-5 w-5" /> Mẹo nhập liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[13px] text-blue-900/80 space-y-2 italic">
              <p>
                • Sử dụng Barcode có sẵn trên hộp thuốc để quét bán hàng nhanh.
              </p>
              <p>• Danh mục sẽ tự động ghi nhớ nếu bạn nhập một nhóm mới.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
