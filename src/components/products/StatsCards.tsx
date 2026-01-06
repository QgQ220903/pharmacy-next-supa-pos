import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, BadgeDollarSign } from "lucide-react";

export function StatsCards({ stats }: { stats: any }) {
  const data = [
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Sắp hết hàng",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Giá trị kho hàng",
      value: `${stats.totalInventoryValue?.toLocaleString()}đ`,
      icon: BadgeDollarSign,
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((item, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
