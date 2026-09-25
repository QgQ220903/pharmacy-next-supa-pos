import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LowStockProducts({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Cảnh báo hết hàng
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Sản phẩm sắp hết tồn kho
            </CardDescription>
          </div>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
            {data.length} sản phẩm
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
            <p className="text-sm">Tồn kho hiện tại đang ở mức an toàn</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="secondary"
                        className="h-4 px-1.5 text-[10px] font-normal"
                      >
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold">
                    {item.current_stock}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tồn kho
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}