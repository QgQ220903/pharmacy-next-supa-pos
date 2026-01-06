"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductFilters as ProductFiltersType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  AlertTriangle,
  EyeOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

interface ProductFiltersProps {
  categories: string[];
  initialFilters: ProductFiltersType;
  productCount: number;
}

export function ProductFilters({
  categories,
  initialFilters,
  productCount,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, any>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");

      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const query = createQueryString({ search: term });
    router.push(`${pathname}?${query}`);
  }, 400);

  const handleFilterChange = (key: string, value: any) => {
    const query = createQueryString({ [key]: value });
    router.push(`${pathname}?${query}`);
  };

  const resetFilters = () => router.push(pathname);

  const activeFilterCount = Array.from(searchParams.keys()).filter(
    (k) => k !== "search" && k !== "page"
  ).length;

  return (
    <Card className="border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-tight">
                Bộ lọc tìm kiếm
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">
                Tìm thấy {productCount} sản phẩm
              </p>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-primary/10 dark:bg-primary/20 text-primary border-none px-2 py-0"
            >
              {activeFilterCount}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-2 space-y-6">
        {/* Section: Tìm kiếm chính */}
        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Tên thuốc, mã nội bộ..."
              defaultValue={initialFilters.search}
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-9 bg-muted/50 dark:bg-muted/20 border-input focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
            />
          </div>
        </div>

        {/* Section: Trạng thái nhanh */}
        <div className="space-y-3">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            Trạng thái nhanh
          </Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={initialFilters.low_stock ? "default" : "outline"}
              size="sm"
              className={`justify-start h-10 px-3 transition-all ${
                initialFilters.low_stock
                  ? "shadow-md"
                  : "hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800"
              }`}
              onClick={() =>
                handleFilterChange(
                  "low_stock",
                  !initialFilters.low_stock ? "true" : ""
                )
              }
            >
              <AlertTriangle
                className={`mr-2 h-4 w-4 ${
                  initialFilters.low_stock ? "" : "text-red-500"
                }`}
              />
              Sắp hết hàng
            </Button>

            <Button
              variant={
                initialFilters.is_active === false ? "default" : "outline"
              }
              size="sm"
              className={`justify-start h-10 px-3 transition-all ${
                initialFilters.is_active === false
                  ? "shadow-md"
                  : "hover:bg-muted/50"
              }`}
              onClick={() =>
                handleFilterChange(
                  "is_active",
                  initialFilters.is_active === false ? "" : "false"
                )
              }
            >
              <EyeOff className="mr-2 h-4 w-4 text-muted-foreground" />
              Ngừng kinh doanh
            </Button>
          </div>
        </div>

        <Separator />

        {/* Section: Lọc nâng cao */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between hover:bg-muted/50 px-2 group"
          >
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Thông tin chi tiết
            </span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showAdvanced && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-2">
                <Label className="text-xs font-medium px-1">
                  Danh mục sản phẩm
                </Label>
                <div className="relative">
                  <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-muted/50 dark:bg-muted/20 border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
                    value={initialFilters.category || ""}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium px-1">
                  Khoảng giá bán (VNĐ)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Từ"
                      className="h-9 text-xs bg-muted/50 dark:bg-muted/20 pl-2"
                      defaultValue={initialFilters.min_price}
                      onBlur={(e) =>
                        handleFilterChange("min_price", e.target.value)
                      }
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Đến"
                      className="h-9 text-xs bg-muted/50 dark:bg-muted/20 pl-2"
                      defaultValue={initialFilters.max_price}
                      onBlur={(e) =>
                        handleFilterChange("max_price", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {(activeFilterCount > 0 || initialFilters.search) && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="w-full text-[11px] font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg py-5 transition-all"
            >
              <X className="h-3.5 w-3.5 mr-2" />
              XÓA TẤT CẢ BỘ LỌC
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
