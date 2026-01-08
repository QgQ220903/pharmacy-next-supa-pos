"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductFilters as ProductFiltersType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Filter,
  X,
  AlertTriangle,
  EyeOff,
  LayoutGrid,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

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

  // Debounce cho tìm kiếm
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const query = createQueryString({ search: term });
    router.push(`${pathname}?${query}`);
  }, 400);

  // Debounce cho lọc giá
  const debouncedPriceFilter = useDebouncedCallback((key: string, value: string) => {
    const numValue = parseFloat(value);
    // Chỉ áp dụng filter nếu giá trị hợp lệ
    if (!isNaN(numValue) && numValue >= 0) {
      const query = createQueryString({ [key]: numValue });
      router.push(`${pathname}?${query}`);
    } else if (value === "") {
      // Nếu người dùng xóa input, xóa filter
      const query = createQueryString({ [key]: "" });
      router.push(`${pathname}?${query}`);
    }
  }, 600);

  const handleFilterChange = (key: string, value: any) => {
    const query = createQueryString({ [key]: value });
    router.push(`${pathname}?${query}`);
  };

  const handleStatusChange = (value: string) => {
    // Quy ước: "all" = tất cả, "active" = đang bán, "inactive" = ngừng bán
    if (value === "all") {
      handleFilterChange("is_active", ""); // Xóa filter
    } else if (value === "active") {
      handleFilterChange("is_active", "true");
    } else if (value === "inactive") {
      handleFilterChange("is_active", "false");
    }
  };
  const resetFilters = () => router.push(pathname);

  const activeFilterCount = Array.from(searchParams.keys()).filter(
    (k) => k !== "search" && k !== "page"
  ).length;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-4 space-y-2">
        {/* First Row: Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Tìm kiếm tên thuốc, mã nội bộ, barcode..."
                defaultValue={initialFilters.search}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-9 h-10 bg-background border-input"
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={initialFilters.low_stock ? "default" : "outline"}
              size="sm"
              className="h-10 gap-2"
              onClick={() =>
                handleFilterChange(
                  "low_stock",
                  !initialFilters.low_stock ? "true" : ""
                )
              }
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Sắp hết</span>
            </Button>

            {/* <Button
              variant={
                initialFilters.is_active === false ? "default" : "outline"
              }
              size="sm"
              className="h-10 gap-2"
              onClick={() =>
                handleFilterChange(
                  "is_active",
                  initialFilters.is_active === false ? "" : "false"
                )
              }
            >
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Ngừng bán</span>
            </Button> */}
            {/* Bộ chuyển trạng thái mới */}
            <Tabs
              // Sửa logic so sánh: kiểm tra true/false thay vì "true"/"false"
              defaultValue={
                initialFilters.is_active === true
                  ? "active"
                  : initialFilters.is_active === false
                    ? "inactive"
                    : "all"
              }
              onValueChange={handleStatusChange}
              className="w-[400px]"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="active">Đang kinh doanh</TabsTrigger>
                <TabsTrigger value="inactive">Ngừng bán</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2"
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Danh mục</span>
            </Button>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-10 gap-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Xóa lọc</span>
                <Badge variant="destructive" className="ml-1">
                  {activeFilterCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>

        {/* Second Row: Category and Price Filters (when expanded) */}
        {showCategoryFilter && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Danh mục sản phẩm
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!initialFilters.category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("category", "")}
                >
                  Tất cả
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={
                      initialFilters.category === cat ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleFilterChange("category", cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Khoảng giá bán (VNĐ)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Từ"
                  className="h-9"
                  min="0"
                  step="1000"
                  defaultValue={initialFilters.min_price}
                  onChange={(e) => debouncedPriceFilter("min_price", e.target.value)}
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Đến"
                  className="h-9"
                  min="0"
                  step="1000"
                  defaultValue={initialFilters.max_price}
                  onChange={(e) => debouncedPriceFilter("max_price", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Result Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Tìm thấy{" "}
            <span className="font-semibold text-foreground">
              {productCount}
            </span>{" "}
            sản phẩm
          </span>
        </div>
      </CardContent>
    </Card>
  );
}