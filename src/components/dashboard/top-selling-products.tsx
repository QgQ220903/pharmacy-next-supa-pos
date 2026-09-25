import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function TopSellingProducts({ data }: { data: any[] }) {
  const maxSales = Math.max(...data.map((item) => item.total), 1);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Sản phẩm bán chạy
        </CardTitle>
        <CardDescription className="text-xs mt-1">
          Top sản phẩm bán chạy nhất
        </CardDescription>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg">
            <p className="text-sm">Chưa có dữ liệu bán hàng</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item, i) => {
              const percentage = (item.total / maxSales) * 100;
              return (
                <div key={i} className="space-y-2">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.category}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold shrink-0 ml-3">
                      {item.total} đơn vị
                    </span>
                  </div>

                  {/* Progress bar */}
                  <Progress value={percentage} className="h-1.5" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}