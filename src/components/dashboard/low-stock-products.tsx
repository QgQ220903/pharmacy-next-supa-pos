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
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Cảnh báo hết hàng
            </CardTitle>
            <CardDescription>Sản phẩm sắp hết tồn kho</CardDescription>
          </div>
          <Badge variant="outline" className="font-normal">
            {data.length} sản phẩm
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Tồn kho hiện tại đang ở mức an toàn
              </p>
            </div>
          ) : (
            data.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {item.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    {item.current_stock}
                  </p>
                  <p className="text-xs text-muted-foreground">Tồn kho</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
