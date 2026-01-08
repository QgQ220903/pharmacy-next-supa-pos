import { getProductInventoryCard } from "@/app/actions/inventory";
import { getProductById } from "@/app/actions/products";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ProductInventoryCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, historyRes] = await Promise.all([
    getProductById(id),
    getProductInventoryCard(id),
  ]);

  if (!product) notFound();

  const history = historyRes.data;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-lg">
          <Link href={`/products/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Thẻ kho
          </h1>
          <p className="text-sm text-muted-foreground">
            {product.name} • {product.internal_code}
          </p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Thời gian</TableHead>
                <TableHead className="font-semibold">Loại giao dịch</TableHead>
                <TableHead className="font-semibold text-right">
                  Thay đổi
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Tồn sau
                </TableHead>
                <TableHead className="font-semibold">Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm">
                      {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>
                      <TransactionTypeBadge type={item.transaction_type} />
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        item.quantity_change > 0
                          ? "text-emerald-600"
                          : "text-destructive"
                      }`}
                    >
                      {item.quantity_change > 0
                        ? `+${item.quantity_change}`
                        : item.quantity_change}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.balance_after}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <p>Chưa có lịch sử giao dịch</p>
                      <p className="text-sm">
                        Sản phẩm chưa có biến động tồn kho
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Component phụ trợ hiển thị Badge
function TransactionTypeBadge({ type }: { type: string }) {
  const configs: any = {
    purchase: { label: "Nhập hàng", variant: "default" as const },
    sale: { label: "Bán hàng", variant: "secondary" as const },
    adjustment: { label: "Kiểm kê", variant: "outline" as const },
    return: { label: "Trả hàng", variant: "outline" as const },
  };

  const config = configs[type] || {
    label: type,
    variant: "secondary" as const,
  };

  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}
