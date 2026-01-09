import { getSalesAction } from "@/app/actions/sales"; 
import { formatPrice } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReceiptText, AlertCircle } from "lucide-react";

export default async function RecentSales() {
  const result = await getSalesAction();

  if (!result.success || !result.data) {
    return (
      <Card className="shadow-sm border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm font-medium">Không thể tải dữ liệu giao dịch</p>
            <p className="text-xs opacity-70">{result.message || "Lỗi kết nối database"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 3. Lúc này TypeScript đã hiểu result.data chắc chắn là một mảng (any[] hoặc Sale[])
  const sales = result.data.slice(0, 5);

  return (
    <Card className="shadow-sm border-border/50 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-primary" />
            Giao dịch gần đây
          </CardTitle>
          <CardDescription>5 hóa đơn bán lẻ mới nhất</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/10">
          <Link href="/sales">Xem tất cả</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic border-2 border-dashed rounded-lg">
            <p className="text-sm">Chưa có giao dịch nào hôm nay</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sales.map((sale) => (
              <div 
                key={sale.id} 
                className="flex items-center justify-between group p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {sale.customer_name?.substring(0, 2).toUpperCase() || "KL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">
                      {sale.customer_name || "Khách lẻ"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {sale.sale_code}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <p className="text-sm font-black tracking-tight">
                    {formatPrice(sale.final_amount)}
                  </p>
                  <Badge
                    variant="outline"
                    className="h-5 px-1.5 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                  >
                    Thành công
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}