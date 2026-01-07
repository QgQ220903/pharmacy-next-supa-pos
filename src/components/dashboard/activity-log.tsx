import {
  Package,
  ShoppingCart,
  ArrowDownCircle,
  RefreshCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ActivityLog({ data }: { data: any[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4" />;
      case "purchase":
        return <ArrowDownCircle className="h-4 w-4" />;
      default:
        return <RefreshCcw className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "sale":
        return "destructive";
      case "purchase":
        return "default";
      default:
        return "secondary";
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case "sale":
        return "Bán hàng";
      case "purchase":
        return "Nhập kho";
      default:
        return "Điều chỉnh";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động kho mới nhất</CardTitle>
        <CardDescription>Nhật ký hoạt động gần đây</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
            >
              <div className="mt-1 rounded-full bg-muted p-2">
                {getIcon(item.transaction_type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.products?.name}</p>
                  <Badge variant={getBadgeVariant(item.transaction_type)}>
                    {getBadgeText(item.transaction_type)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {item.transaction_type === "sale"
                      ? "Xuất bán hàng"
                      : "Nhập hàng vào kho"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        item.quantity_change > 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.quantity_change > 0
                        ? `+${item.quantity_change}`
                        : item.quantity_change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
