import { supabaseAdmin } from "@/lib/supabase-server";
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

export default async function RecentSales() {
  const supabase = await supabaseAdmin;
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Giao dịch gần đây</CardTitle>
          <CardDescription>5 giao dịch mới nhất</CardDescription>
        </div>
        <Button variant="ghost" size="sm">
          Xem tất cả
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales?.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted">
                    {sale.customer_name?.substring(0, 2).toUpperCase() || "KL"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {sale.customer_name || "Khách lẻ"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.sale_code}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-sm font-bold">
                  {formatPrice(sale.final_amount)}
                </p>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  Thành công
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
