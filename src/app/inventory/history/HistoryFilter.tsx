"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";

export default function HistoryFilter({ totalPages }: { totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState(
    searchParams.get("productQuery") || ""
  );
  const currentPage = Number(searchParams.get("page")) || 1;

  // Hàm cập nhật URL tập trung
  const updateParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, String(value));
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Kỹ thuật DEBOUNCE: Tự động lọc sau 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== (searchParams.get("productQuery") || "")) {
        updateParams({ productQuery: inputValue, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Tìm kiếm Debounce */}
        <div className="flex-1 min-w-[300px] space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
            Tìm sản phẩm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Gõ tên thuốc để lọc ngay..."
              className="pl-9 h-10 border-slate-200 focus:border-blue-400 transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Lọc ngày trực tiếp */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
            <Calendar size={10} /> Từ ngày
          </label>
          <Input
            type="date"
            className="h-10 cursor-pointer"
            defaultValue={searchParams.get("fromDate") || ""}
            onChange={(e) =>
              updateParams({ fromDate: e.target.value, page: 1 })
            }
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1">
            <Calendar size={10} /> Đến ngày
          </label>
          <Input
            type="date"
            className="h-10 cursor-pointer"
            defaultValue={searchParams.get("toDate") || ""}
            onChange={(e) => updateParams({ toDate: e.target.value, page: 1 })}
          />
        </div>
      </div>

      {/* Phân trang tinh gọn */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
        <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
          Trang <span className="text-blue-600">{currentPage}</span> /{" "}
          {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-md"
            disabled={currentPage <= 1}
            onClick={() => updateParams({ page: currentPage - 1 })}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 rounded-md"
            disabled={currentPage >= totalPages}
            onClick={() => updateParams({ page: currentPage + 1 })}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
