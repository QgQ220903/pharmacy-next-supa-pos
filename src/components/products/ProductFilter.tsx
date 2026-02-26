"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductFilters as ProductFiltersType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  X,
  AlertTriangle,
  Filter,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useCallback, useEffect, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  // Sync state with URL
  useEffect(() => {
    setSearchValue(initialFilters.search || "");
  }, [initialFilters.search]);

  const createQueryString = useCallback(
    (updates: Record<string, any>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      return params.toString();
    },
    [searchParams],
  );

  const navigate = useCallback(
    (updates: Record<string, any>) => {
      startTransition(() => {
        router.push(`${pathname}?${createQueryString(updates)}`);
      });
    },
    [pathname, router, createQueryString, startTransition],
  );

  // Debounced search
  const debouncedSearch = useDebouncedCallback((term: string) => {
    navigate({ search: term });
  }, 800);

  // Filter handlers
  const setFilter = useCallback(
    (key: string, value: any) => {
      navigate({ [key]: value });
    },
    [navigate],
  );

  const removeFilter = useCallback(
    (key: string) => {
      navigate({ [key]: "" });
    },
    [navigate],
  );

  const resetAllFilters = useCallback(() => {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  // Get active filters
  const getActiveFilters = () => {
    const filters: { key: string; label: string }[] = [];

    if (initialFilters.search) {
      filters.push({ key: "search", label: `"${initialFilters.search}"` });
    }

    if (initialFilters.category) {
      filters.push({ key: "category", label: initialFilters.category });
    }

    if (initialFilters.is_active !== undefined) {
      filters.push({
        key: "is_active",
        label: initialFilters.is_active ? "Đang bán" : "Ngừng bán",
      });
    }

    if (initialFilters.low_stock) {
      filters.push({ key: "low_stock", label: "Sắp hết" });
    }

    return filters;
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <>
      {/* Simple loading indicator */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-primary/20 z-50">
          <div className="h-full bg-primary animate-progress" />
        </div>
      )}

      <Card className={cn("border", isPending && "opacity-60 pointer-events-none")}>
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Lọc sản phẩm</h3>
              {hasActiveFilters && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="h-7 px-2 text-xs text-muted-foreground"
                disabled={isPending}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Xóa lọc
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, mã sản phẩm..."
              value={searchValue}
              onChange={(e) => {
                const val = e.target.value;
                setSearchValue(val);
                debouncedSearch(val);
              }}
              className="pl-8 h-9 text-sm"
              disabled={isPending}
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  navigate({ search: "" });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isPending}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Buttons Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter group */}
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md">
              <Button
                variant={!initialFilters.is_active ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setFilter("is_active", "")}
                disabled={isPending}
              >
                Tất cả
              </Button>
              <Button
                variant={initialFilters.is_active === true ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setFilter("is_active", "true")}
                disabled={isPending}
              >
                Đang bán
              </Button>
              <Button
                variant={initialFilters.is_active === false ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setFilter("is_active", "false")}
                disabled={isPending}
              >
                Ngừng bán
              </Button>
            </div>

            {/* Low stock filter */}
            <Button
              variant={initialFilters.low_stock ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setFilter("low_stock", !initialFilters.low_stock ? "true" : "")}
              disabled={isPending}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Sắp hết
            </Button>

            {/* Category Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Tag className="h-3.5 w-3.5" />
                  {initialFilters.category || "Danh mục"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="start">
                <div className="space-y-1">
                  <Button
                    variant={!initialFilters.category ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter("category", "")}
                    className="w-full justify-start h-8 text-xs"
                  >
                    Tất cả danh mục
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={initialFilters.category === cat ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("category", cat)}
                      className="w-full justify-start h-8 text-xs"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <>
              <Separator />
              <div className="flex flex-wrap items-center gap-1.5">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="pl-2 pr-1 py-0.5 gap-1 text-xs font-normal"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter.key)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                      disabled={isPending}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </>
          )}

          {/* Result count */}
          <div className="flex items-center justify-between text-sm pt-1">
            <span className="text-muted-foreground">
              {isPending ? "Đang tìm..." : "Kết quả"}
            </span>
            <span className="font-medium">
              {productCount.toLocaleString()} sản phẩm
            </span>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}