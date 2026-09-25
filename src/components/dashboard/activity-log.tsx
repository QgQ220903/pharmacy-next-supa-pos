import {
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
import { cn } from "@/lib/utils";

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
        return "default"; // primary — bán hàng là hoạt động chính
      case "purchase":
        return "secondary"; // xám — nhập kho là hoạt động phụ
      default:
        return "outline"; // viền — điều chỉnh
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
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Hoạt động kho mới nhất
        </CardTitle>
        <CardDescription className="text-xs mt-1">
          Nhật ký hoạt động gần đây
        </CardDescription>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
            <p className="text-sm">Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {/* Icon */}
                <div className="h-9 w-9 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  {getIcon(item.transaction_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">
                      {item.products?.name}
                    </p>
                    <Badge
                      variant={getBadgeVariant(item.transaction_type)}
                      className="h-5 px-1.5 text-[10px] font-normal shrink-0"
                    >
                      {getBadgeText(item.transaction_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {item.transaction_type === "sale"
                        ? "Xuất bán hàng"
                        : "Nhập hàng vào kho"}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          item.quantity_change > 0
                            ? "text-primary"
                            : "text-destructive"
                        )}
                      >
                        {item.quantity_change > 0
                          ? `+${item.quantity_change}`
                          : item.quantity_change}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleTimeString(
                          "vi-VN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}