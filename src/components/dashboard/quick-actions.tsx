"use client";

import {
  ShoppingCart,
  Package,
  Plus,
  FileText,
  Truck,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  title?: string;
  description?: string;
}

interface Action {
  label: string;
  icon: React.ElementType;
  href: string;
  description: string;
}

export default function QuickActions({
  title = "Truy cập nhanh",
  description = "Các thao tác thường dùng trong ca làm việc",
}: QuickActionsProps) {
  const router = useRouter();

  const actions: Action[] = [
    {
      label: "Mở POS",
      icon: ShoppingCart,
      href: "/pos",
      description: "Bán hàng tại quầy",
    },
    {
      label: "Hóa đơn",
      icon: FileText,
      href: "/sales",
      description: "Lịch sử bán hàng",
    },
    {
      label: "Nhập kho",
      icon: Package,
      href: "/entries",
      description: "Tạo phiếu nhập",
    },
    {
      label: "Kiểm kê",
      icon: ClipboardList,
      href: "/inventory",
      description: "Kiểm tra tồn kho",
    },
    {
      label: "Sản phẩm",
      icon: Plus,
      href: "/products/new",
      description: "Thêm sản phẩm mới",
    },
    {
      label: "Nhà cung cấp",
      icon: Truck,
      href: "/suppliers",
      description: "Quản lý đối tác",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {title}
        </CardTitle>
        <CardDescription className="text-xs mt-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-lg text-left",
                  "hover:bg-accent transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {/* Icon */}
                <div className="h-9 w-9 shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {action.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {action.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}