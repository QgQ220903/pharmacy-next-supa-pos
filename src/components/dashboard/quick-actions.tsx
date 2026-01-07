"use client";

import { Plus, ShoppingCart, Package, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: "Bán hàng",
      icon: ShoppingCart,
      href: "/pos",
      description: "Tạo hóa đơn mới",
    },
    {
      label: "Nhập kho",
      icon: Package,
      href: "/entries",
      description: "Nhập sản phẩm mới",
    },
    {
      label: "Thêm thuốc",
      icon: Plus,
      href: "/products/new",
      description: "Thêm sản phẩm mới",
    },
    {
      label: "Hóa đơn",
      icon: FileText,
      href: "/sales",
      description: "Quản lý hóa đơn",
    },
  ];

  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Thao tác nhanh</CardTitle>
        <CardDescription>
          Truy cập nhanh các tính năng quan trọng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleClick(action.href)}
                className="group flex flex-col items-center p-5 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="mb-4 p-4 rounded-full bg-muted">
                  <Icon className="h-9 w-9 text-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <span className="text-base font-semibold text-foreground">
                    {action.label}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
