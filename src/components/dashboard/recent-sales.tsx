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
import { AlertCircle } from "lucide-react";

export default async function RecentSales() {
  const result = await getSalesAction();

  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm font-medium">
              Không thể tải dữ liệu giao dịch
            </p>
            <p className="text-xs">
              {result.message || "Lỗi kết nối database"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sales = result.data.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Giao dịch gần đây
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              5 hóa đơn bán lẻ mới nhất
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1"
            asChild
          >
            <Link href="/sales">
              Xem tất cả
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
            <p className="text-sm">Chưa có giao dịch nào hôm nay</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {sale.customer_name?.substring(0, 2).toUpperCase() ||
                        "KL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {sale.customer_name || "Khách lẻ"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {sale.sale_code}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                  <p className="text-sm font-semibold">
                    {formatPrice(sale.final_amount)}
                  </p>
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-normal"
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