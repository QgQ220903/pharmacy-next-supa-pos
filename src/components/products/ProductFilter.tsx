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
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback, useEffect, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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

  // 1. Sử dụng useTransition để xử lý không chặn UI
  const [isPending, startTransition] = useTransition();

  // 2. State local để quản lý ô search (giúp đồng bộ khi reset)
  const [searchValue, setSearchValue] = useState(initialFilters.search || "");
  const [minPriceValue, setMinPriceValue] = useState(
    initialFilters.min_price?.toString() || "",
  );
  const [maxPriceValue, setMaxPriceValue] = useState(
    initialFilters.max_price?.toString() || "",
  );
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // 3. Progress animation
  const [progress, setProgress] = useState(0);

  // Đồng bộ state với URL khi thay đổi từ bên ngoài
  useEffect(() => {
    setSearchValue(initialFilters.search || "");
    setMinPriceValue(initialFilters.min_price?.toString() || "");
    setMaxPriceValue(initialFilters.max_price?.toString() || "");
  }, [
    initialFilters.search,
    initialFilters.min_price,
    initialFilters.max_price,
  ]);

  // Hiệu ứng progress khi đang loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPending]);

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
    [searchParams],
  );

  // Hàm wrapper cho router.push với transition
  const pushWithTransition = useCallback(
    (url: string) => {
      startTransition(() => {
        router.push(url);
      });
    },
    [router, startTransition],
  );

  // Debounce cho tìm kiếm
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const query = createQueryString({ search: term });
    pushWithTransition(`${pathname}?${query}`);
  }, 400);

  // Debounce cho lọc giá
  const debouncedPriceFilter = useDebouncedCallback(
    (min: string, max: string) => {
      const minNum = parseFloat(min);
      const maxNum = parseFloat(max);

      const params: Record<string, any> = {};

      // Xử lý min price
      if (!isNaN(minNum) && minNum >= 0) {
        params.min_price = minNum;
      } else if (min === "") {
        params.min_price = "";
      }

      // Xử lý max price
      if (!isNaN(maxNum) && maxNum >= 0) {
        params.max_price = maxNum;
      } else if (max === "") {
        params.max_price = "";
      }

      // Chỉ cập nhật nếu có thay đổi
      if (Object.keys(params).length > 0) {
        const query = createQueryString(params);
        pushWithTransition(`${pathname}?${query}`);
      }
    },
    600,
  );

  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      const query = createQueryString({ [key]: value });
      pushWithTransition(`${pathname}?${query}`);
    },
    [createQueryString, pathname, pushWithTransition],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      if (value === "all") {
        handleFilterChange("is_active", "");
      } else if (value === "active") {
        handleFilterChange("is_active", "true");
      } else if (value === "inactive") {
        handleFilterChange("is_active", "false");
      }
    },
    [handleFilterChange],
  );

  const resetFilters = useCallback(() => {
    // Reset tất cả state local
    setSearchValue("");
    setMinPriceValue("");
    setMaxPriceValue("");
    setShowCategoryFilter(false);

    // Reset URL
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  // Tính toán số filter đang active (không tính search và page)
  const activeFilterCount = Array.from(searchParams.entries()).filter(
    ([key, value]) => key !== "page" && value !== "" && key !== "search",
  ).length;

  // Thêm filter search vào count nếu có
  const totalActiveFilters =
    activeFilterCount + (initialFilters.search ? 1 : 0);

  // Xử lý thay đổi giá min
  const handleMinPriceChange = (value: string) => {
    setMinPriceValue(value);
    debouncedPriceFilter(value, maxPriceValue);
  };

  // Xử lý thay đổi giá max
  const handleMaxPriceChange = (value: string) => {
    setMaxPriceValue(value);
    debouncedPriceFilter(minPriceValue, value);
  };

  return (
    <>
      {/* Loading Progress Bar */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50 transition-opacity duration-300",
          progress > 0 ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className="h-full bg-primary transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card
        className={cn(
          "border-none shadow-none bg-transparent transition-opacity duration-200",
          isPending && "opacity-70 pointer-events-none",
        )}
      >
        <CardContent className="p-4 space-y-2">
          {/* First Row: Search and Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                  {isPending && searchValue ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  )}
                </div>
                <Input
                  placeholder="Tìm kiếm tên thuốc, mã nội bộ, barcode..."
                  value={searchValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    debouncedSearch(value);
                  }}
                  className="pl-9 h-10 bg-background border-input"
                  disabled={isPending}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchValue("");
                      const query = createQueryString({ search: "" });
                      pushWithTransition(`${pathname}?${query}`);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={initialFilters.low_stock ? "default" : "outline"}
                size="sm"
                className="h-10 gap-2"
                onClick={() =>
                  handleFilterChange(
                    "low_stock",
                    !initialFilters.low_stock ? "true" : "",
                  )
                }
                disabled={isPending}
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Sắp hết</span>
              </Button>

              {/* Bộ chuyển trạng thái */}
              <Tabs
                defaultValue={
                  initialFilters.is_active === true
                    ? "active"
                    : initialFilters.is_active === false
                      ? "inactive"
                      : "all"
                }
                onValueChange={handleStatusChange}
                className="w-auto"
              >
                <TabsList className="grid grid-cols-3 h-10">
                  <TabsTrigger
                    value="all"
                    className="px-3 py-2"
                    disabled={isPending}
                  >
                    Tất cả
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="px-3 py-2"
                    disabled={isPending}
                  >
                    Đang bán
                  </TabsTrigger>
                  <TabsTrigger
                    value="inactive"
                    className="px-3 py-2"
                    disabled={isPending}
                  >
                    Ngừng bán
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant={showCategoryFilter ? "default" : "outline"}
                size="sm"
                className="h-10 gap-2"
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                disabled={isPending}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Danh mục</span>
              </Button>

              {totalActiveFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-10 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Xóa lọc</span>
                  <Badge variant="destructive" className="ml-1">
                    {totalActiveFilters}
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
                    disabled={isPending}
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
                      disabled={isPending}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Khoảng giá bán (VNĐ)
                </Label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      placeholder="Từ"
                      className="h-9 pr-8"
                      min="0"
                      step="1000"
                      value={minPriceValue}
                      onChange={(e) => handleMinPriceChange(e.target.value)}
                      disabled={isPending}
                    />
                    {minPriceValue && (
                      <button
                        type="button"
                        onClick={() => handleMinPriceChange("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isPending}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      placeholder="Đến"
                      className="h-9 pr-8"
                      min="0"
                      step="1000"
                      value={maxPriceValue}
                      onChange={(e) => handleMaxPriceChange(e.target.value)}
                      disabled={isPending}
                    />
                    {maxPriceValue && (
                      <button
                        type="button"
                        onClick={() => handleMaxPriceChange("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isPending}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Count và Loading Indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Đang tìm kiếm...
                </span>
              ) : (
                <>
                  Tìm thấy{" "}
                  <span className="font-semibold text-foreground">
                    {productCount}
                  </span>{" "}
                  sản phẩm
                </>
              )}
            </span>

            {/* Hiển thị filters đang active (chỉ khi có) */}
            {totalActiveFilters > 0 && !isPending && (
              <div className="flex flex-wrap gap-1">
                {initialFilters.search && (
                  <Badge variant="secondary" className="text-xs">
                    Tìm: "{initialFilters.search}"
                  </Badge>
                )}
                {initialFilters.category && (
                  <Badge variant="secondary" className="text-xs">
                    Danh mục: {initialFilters.category}
                  </Badge>
                )}
                {initialFilters.low_stock && (
                  <Badge variant="secondary" className="text-xs">
                    Sắp hết hàng
                  </Badge>
                )}
                {initialFilters.is_active === true && (
                  <Badge variant="secondary" className="text-xs">
                    Đang bán
                  </Badge>
                )}
                {initialFilters.is_active === false && (
                  <Badge variant="secondary" className="text-xs">
                    Ngừng bán
                  </Badge>
                )}
                {initialFilters.min_price && (
                  <Badge variant="secondary" className="text-xs">
                    Giá từ: {initialFilters.min_price.toLocaleString()}₫
                  </Badge>
                )}
                {initialFilters.max_price && (
                  <Badge variant="secondary" className="text-xs">
                    Giá đến: {initialFilters.max_price.toLocaleString()}₫
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
