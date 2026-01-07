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
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm bán chạy</CardTitle>
        <CardDescription>Top sản phẩm bán chạy nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((item, i) => {
            const percentage = (item.total / maxSales) * 100;
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-medium">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{item.total} đơn vị</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
