import { getProductCategories } from "@/app/actions/products";
import { ProductForm } from "@/components/products/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Layers,
  Info,
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  AlertCircle,
  FileText,
  Scale,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Gauge,
  BadgePercent,
  Boxes,
  Barcode,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default async function NewProductPage() {
  const categories = await getProductCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header với breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/products" className="hover:text-primary transition-colors">
                Sản phẩm
              </Link>
              <span>/</span>
              <span className="text-foreground">Thêm mới</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">
              Thêm sản phẩm mới
            </h1>
          </div>
        </div>
        
        {/* Badge trạng thái */}
        <Badge variant="outline" className="w-fit gap-1 bg-primary/5 border-primary/20">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Form nhập liệu thông minh</span>
        </Badge>
      </div>

      {/* Progress Steps - Thiết kế lại đẹp hơn */}
      <Card className="border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 via-transparent to-transparent p-6 pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            Quy trình nhập liệu
          </CardTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { icon: Package, label: "Thông tin cơ bản", desc: "Tên, mã SP, đơn vị" },
              { icon: Tag, label: "Danh mục", desc: "Phân loại & barcode" },
              { icon: DollarSign, label: "Giá bán", desc: "Định giá & quy đổi" },
              { icon: Scale, label: "Tồn kho", desc: "Định mức tối thiểu" },
              { icon: Layers, label: "Cấu hình", desc: "Quản lý lô/hạn" },
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="relative">
                  <div className={cn(
                    "p-1.5 rounded-md transition-colors",
                    "bg-muted/50 text-muted-foreground",
                    "group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <step.icon className="h-3.5 w-3.5" />
                  </div>
                  {index < 4 && (
                    <div className="hidden md:block absolute top-3 left-6 w-full h-[1px] bg-border" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Important Notes - Thiết kế gọn hơn */}
        <div className="p-4 bg-amber-500/5 border-t border-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-amber-500/10 shrink-0">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2">
                Những điều cần lưu ý:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Mã SP không thể thay đổi sau khi tạo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Tồn kho ban đầu = 0 (cần nhập kho)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Chọn quản lý theo lô cho thuốc có hạn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Form Section */}
      <Card>
        <CardContent className="p-6">
          <ProductForm categories={categories} />
        </CardContent>
      </Card>

      {/* Info Cards - Thiết kế lại gọn và đẹp hơn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pricing Card */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BadgePercent className="h-3.5 w-3.5" />
              </div>
              Giá bán & Quy đổi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Giá gốc:</span>
                <Badge variant="outline" className="font-mono">5.000đ/viên</Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Quy đổi:</span>
                <Badge variant="outline" className="font-mono">1 vỉ = 10 viên</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Giá bán lẻ:</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono">
                  50.000đ/vỉ
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Card */}
        <Card className="border-violet-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Boxes className="h-3.5 w-3.5" />
              </div>
              Chế độ quản lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="w-full justify-start gap-1.5 text-xs">
                <Layers className="h-3 w-3 text-violet-500" />
                Theo lô hàng (FEFO)
              </Badge>
              <Badge variant="outline" className="w-full justify-start gap-1.5 text-xs">
                <Package className="h-3 w-3 text-sky-500" />
                Tổng hợp (không hạn)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Lightbulb className="h-3.5 w-3.5" />
              </div>
              Mẹo hữu ích
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Barcode className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Quét barcode để bán nhanh</span>
              </div>
              <div className="flex items-center gap-2">
                <ScrollText className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Hệ thống tự động lưu danh mục mới</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Cảnh báo khi tồn dưới định mức</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating shortcut (optional) */}
      <div className="fixed bottom-6 right-6">
        <Button size="sm" className="shadow-lg gap-2" asChild>
          <Link href="/products">
            <Package className="h-4 w-4" />
            Xem danh sách
          </Link>
        </Button>
      </div>
    </div>
  );
}

