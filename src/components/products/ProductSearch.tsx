// components/products/ProductSearch.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Package, Loader2 } from "lucide-react";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { searchProductsForEntry } from "@/app/actions/inventory";
import { useDebouncedCallback } from "use-debounce";
import { formatPrice } from "@/lib/utils";

interface ProductSearchProps {
  products?: Product[];
  onSelect: (product: Product) => void;
  placeholder?: string;
}

export function ProductSearch({ 
  products: initialProducts = [], 
  onSelect,
  placeholder = "Tìm kiếm sản phẩm theo tên, mã, barcode..."
}: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Đóng kết quả khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchProductsForEntry(term);
      if (result.success) {
        setResults(result.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setShowResults(true);
    debouncedSearch(term);
  };

  const handleSelect = (product: Product) => {
    onSelect(product);
    setSearchTerm("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9 pr-10"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showResults && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full bg-card border rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Đang tìm kiếm...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
                onClick={() => handleSelect(product)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {product.internal_code}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ĐVT: {product.base_unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        Giá vốn: {formatPrice(product.cost_price || 0)}
                      </span>
                      <span>•</span>
                      <span className="text-muted-foreground">
                        Giá bán: {formatPrice(product.sale_price || 0)}
                      </span>
                    </div>
                  </div>
                  {product.manage_by_batch && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Theo lô
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center">
              <div className="text-sm text-muted-foreground">
                Không tìm thấy sản phẩm "{searchTerm}"
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hiển thị gợi ý khi chưa nhập */}
      {!searchTerm && initialProducts.length > 0 && showResults && (
        <div className="absolute z-50 w-full bg-card border rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto">
          <div className="p-2 bg-muted/30 text-xs font-medium text-muted-foreground">
            Gợi ý nhanh
          </div>
          {initialProducts.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="p-2 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
              onClick={() => handleSelect(product)}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.internal_code} • {product.base_unit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}