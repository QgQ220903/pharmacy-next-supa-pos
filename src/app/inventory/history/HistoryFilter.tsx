"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function HistoryFilter({ totalPages }: { totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState(
    searchParams.get("productQuery") || "",
  );
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");

  const currentPage = Number(searchParams.get("page")) || 1;

  // Đếm số filter đang active
  const activeFilterCount = [
    searchParams.get("productQuery"),
    searchParams.get("fromDate"),
    searchParams.get("toDate"),
  ].filter(Boolean).length;

  const updateParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, String(value));
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== (searchParams.get("productQuery") || "")) {
        updateParams({ productQuery: inputValue, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Xử lý date changes
  const handleDateChange = (type: "from" | "to", value: string) => {
    if (type === "from") {
      setFromDate(value);
      updateParams({ fromDate: value, page: 1 });
    } else {
      setToDate(value);
      updateParams({ toDate: value, page: 1 });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setInputValue("");
    setFromDate("");
    setToDate("");
    router.push(pathname);
  };

  return (
    <Card className="border">
      <CardContent className="p-6">
        {/* Header with title and filter count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Bộ lọc lịch sử</h3>
              <p className="text-sm text-muted-foreground">
                Lọc theo sản phẩm và khoảng thời gian
              </p>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                {activeFilterCount} bộ lọc
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 gap-1 text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3" />
                Xóa lọc
              </Button>
            </div>
          )}
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Product search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tìm kiếm sản phẩm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nhập tên sản phẩm..."
                className="pl-9"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              {inputValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => {
                    setInputValue("");
                    updateParams({ productQuery: null, page: 1 });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* From date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Từ ngày</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9"
                value={fromDate}
                onChange={(e) => handleDateChange("from", e.target.value)}
              />
              {fromDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => handleDateChange("from", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* To date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Đến ngày</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9"
                value={toDate}
                onChange={(e) => handleDateChange("to", e.target.value)}
              />
              {toDate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => handleDateChange("to", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {(inputValue || fromDate || toDate) && (
          <div className="mb-6 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium mb-2">Bộ lọc đang áp dụng:</p>
            <div className="flex flex-wrap gap-2">
              {inputValue && (
                <Badge variant="secondary" className="gap-1">
                  Sản phẩm: {inputValue}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1 hover:bg-transparent"
                    onClick={() => {
                      setInputValue("");
                      updateParams({ productQuery: null, page: 1 });
                    }}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {fromDate && (
                <Badge variant="secondary" className="gap-1">
                  Từ: {fromDate}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1 hover:bg-transparent"
                    onClick={() => handleDateChange("from", "")}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {toDate && (
                <Badge variant="secondary" className="gap-1">
                  Đến: {toDate}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1 hover:bg-transparent"
                    onClick={() => handleDateChange("to", "")}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Trang{" "}
            <span className="font-semibold text-foreground">{currentPage}</span>{" "}
            / {totalPages}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Điều hướng trang
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage <= 1}
                onClick={() => updateParams({ page: currentPage - 1 })}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage >= totalPages}
                onClick={() => updateParams({ page: currentPage + 1 })}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
