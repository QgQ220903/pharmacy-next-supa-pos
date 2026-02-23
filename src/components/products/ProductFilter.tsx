"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductFilters as ProductFiltersType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  X,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback, useEffect, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

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

  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(initialFilters.search || "");
  const [minPriceValue, setMinPriceValue] = useState(
    initialFilters.min_price?.toString() || "",
  );
  const [maxPriceValue, setMaxPriceValue] = useState(
    initialFilters.max_price?.toString() || "",
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Đồng bộ state với URL
  useEffect(() => {
    setSearchValue(initialFilters.search || "");
    setMinPriceValue(initialFilters.min_price?.toString() || "");
    setMaxPriceValue(initialFilters.max_price?.toString() || "");
  }, [
    initialFilters.search,
    initialFilters.min_price,
    initialFilters.max_price,
  ]);

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

  const pushWithTransition = useCallback(
    (url: string) => {
      startTransition(() => {
        router.push(url);
      });
    },
    [router, startTransition],
  );

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const query = createQueryString({ search: term });
    pushWithTransition(`${pathname}?${query}`);
  }, 400);

  const debouncedPriceFilter = useDebouncedCallback(
    (min: string, max: string) => {
      const minNum = parseFloat(min);
      const maxNum = parseFloat(max);

      const params: Record<string, any> = {};

      if (!isNaN(minNum) && minNum >= 0) {
        params.min_price = minNum;
      } else if (min === "") {
        params.min_price = "";
      }

      if (!isNaN(maxNum) && maxNum >= 0) {
        params.max_price = maxNum;
      } else if (max === "") {
        params.max_price = "";
      }

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
    setSearchValue("");
    setMinPriceValue("");
    setMaxPriceValue("");
    setShowAdvancedFilters(false);

    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const removeFilter = useCallback(
    (key: string) => {
      const query = createQueryString({ [key]: "" });
      pushWithTransition(`${pathname}?${query}`);
    },
    [createQueryString, pathname, pushWithTransition],
  );

  const activeFilterCount = Array.from(searchParams.entries()).filter(
    ([key, value]) => key !== "page" && value !== "" && key !== "search",
  ).length;

  const totalActiveFilters =
    activeFilterCount + (initialFilters.search ? 1 : 0);

  const handleMinPriceChange = (value: string) => {
    setMinPriceValue(value);
    debouncedPriceFilter(value, maxPriceValue);
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPriceValue(value);
    debouncedPriceFilter(minPriceValue, value);
  };

  // Format giá trị filter để hiển thị
  const getFilterDisplayValue = (key: string, value: any) => {
    switch (key) {
      case "search":
        return `Tìm: "${value}"`;
      case "category":
        return `Danh mục: ${value}`;
      case "is_active":
        return value === "true" ? "Đang bán" : "Ngừng bán";
      case "low_stock":
        return "Sắp hết";
      case "min_price":
        return `Giá từ: ${Number(value).toLocaleString()}₫`;
      case "max_price":
        return `Giá đến: ${Number(value).toLocaleString()}₫`;
      default:
        return String(value);
    }
  };

  // Lấy tất cả filters đang active
  const getActiveFilters = () => {
    const filters: { key: string; value: string; label: string }[] = [];

    if (initialFilters.search) {
      filters.push({
        key: "search",
        value: initialFilters.search,
        label: getFilterDisplayValue("search", initialFilters.search),
      });
    }

    if (initialFilters.category) {
      filters.push({
        key: "category",
        value: initialFilters.category,
        label: getFilterDisplayValue("category", initialFilters.category),
      });
    }

    if (initialFilters.is_active !== undefined) {
      filters.push({
        key: "is_active",
        value: String(initialFilters.is_active),
        label: getFilterDisplayValue(
          "is_active",
          String(initialFilters.is_active),
        ),
      });
    }

    if (initialFilters.low_stock) {
      filters.push({
        key: "low_stock",
        value: "true",
        label: getFilterDisplayValue("low_stock", "true"),
      });
    }

    if (initialFilters.min_price) {
      filters.push({
        key: "min_price",
        value: String(initialFilters.min_price),
        label: getFilterDisplayValue("min_price", initialFilters.min_price),
      });
    }

    if (initialFilters.max_price) {
      filters.push({
        key: "max_price",
        value: String(initialFilters.max_price),
        label: getFilterDisplayValue("max_price", initialFilters.max_price),
      });
    }

    return filters;
  };

  const activeFilters = getActiveFilters();

  return (
    <>
      {/* Simple loading indicator */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-primary/20 z-50">
          <div className="h-full bg-primary animate-progress" />
        </div>
      )}

      <Card className={cn("border shadow-sm", isPending && "opacity-60")}>
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Bộ lọc</h3>
              {totalActiveFilters > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {totalActiveFilters}
                </Badge>
              )}
            </div>

            {totalActiveFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                disabled={isPending}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Xóa tất cả
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;
                setSearchValue(value);
                debouncedSearch(value);
              }}
              className="pl-8 h-9 text-sm"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isPending}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={initialFilters.low_stock ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() =>
                handleFilterChange(
                  "low_stock",
                  !initialFilters.low_stock ? "true" : "",
                )
              }
              disabled={isPending}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Sắp hết
            </Button>

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
              <TabsList className="h-8">
                <TabsTrigger value="all" className="px-3 text-xs">
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value="active" className="px-3 text-xs">
                  Đang bán
                </TabsTrigger>
                <TabsTrigger value="inactive" className="px-3 text-xs">
                  Ngừng bán
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Collapsible
              open={showAdvancedFilters}
              onOpenChange={setShowAdvancedFilters}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant={showAdvancedFilters ? "default" : "outline"}
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  disabled={isPending}
                >
                  <span>Lọc nâng cao</span>
                  {showAdvancedFilters ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3">
                <div className="space-y-3 p-3 bg-muted/30 rounded-md border">
                  {/* Categories */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Danh mục
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        variant={
                          !initialFilters.category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleFilterChange("category", "")}
                        disabled={isPending}
                        className="h-7 px-2 text-xs"
                      >
                        Tất cả
                      </Button>
                      {categories.map((cat) => (
                        <Button
                          key={cat}
                          variant={
                            initialFilters.category === cat
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleFilterChange("category", cat)}
                          disabled={isPending}
                          className="h-7 px-2 text-xs"
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Khoảng giá
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Từ"
                        className="h-8 text-sm"
                        min="0"
                        step="1000"
                        value={minPriceValue}
                        onChange={(e) => handleMinPriceChange(e.target.value)}
                        disabled={isPending}
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        placeholder="Đến"
                        className="h-8 text-sm"
                        min="0"
                        step="1000"
                        value={maxPriceValue}
                        onChange={(e) => handleMaxPriceChange(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Active Filters Section - Hiển thị riêng biệt */}
          {activeFilters.length > 0 && (
            <>
              <Separator className="my-1" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Điều kiện lọc hiện tại:
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {productCount} sản phẩm
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeFilters.map((filter) => (
                    <Badge
                      key={filter.key}
                      variant="secondary"
                      className="pl-2 pr-1 py-0.5 gap-1 text-xs font-normal group"
                    >
                      <span>{filter.label}</span>
                      <button
                        onClick={() => removeFilter(filter.key)}
                        className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                        disabled={isPending}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Chỉ hiện separator và result count khi không có filters */}
          {activeFilters.length === 0 && (
            <>
              <Separator className="my-1" />
              <div className="flex items-center justify-end text-sm">
                <span className="text-muted-foreground">
                  {isPending ? (
                    "Đang tìm..."
                  ) : (
                    <>
                      <span className="font-medium text-foreground">
                        {productCount}
                      </span>{" "}
                      sản phẩm
                    </>
                  )}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
