// components/pos/ProductSearchPOS.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Package, Loader2, X, Barcode } from "lucide-react";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { searchProductsForPOS } from "@/app/actions/sales";
import { useDebouncedCallback } from "use-debounce";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProductSearchPOSProps {
  onSelect: (product: Product) => void;
  initialProducts?: Product[];
  onSearchChange?: (query: string) => void;
}

export function ProductSearchPOS({ 
  onSelect, 
  initialProducts = [],
  onSearchChange 
}: ProductSearchPOSProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!hasMore || isSearching || !showResults) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isSearching) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isSearching, showResults]);

  useEffect(() => {
    if (page > 1 && searchTerm.length >= 2 && showResults) {
      loadMoreResults();
    }
  }, [page]);

  const loadMoreResults = async () => {
    if (!searchTerm || searchTerm.length < 2) return;
    
    setIsSearching(true);
    try {
      const result = await searchProductsForPOS(searchTerm, page, 20);
      if (result.success) {
        setResults(prev => [...prev, ...result.data]);
        setHasMore(result.currentPage < result.totalPages);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setHasMore(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setPage(1);
    try {
      const result = await searchProductsForPOS(term, 1, 20);
      if (result.success) {
        setResults(result.data);
        setTotalCount(result.totalCount || 0);
        setHasMore(result.currentPage < result.totalPages);
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
    onSearchChange?.(term);
    debouncedSearch(term);
  };

  const handleSelect = (product: Product) => {
    onSelect(product);
    setSearchTerm("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Tìm theo tên, mã SP, quét mã vạch..."
          className="pl-9 pr-20 h-11 text-sm"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Badge variant="outline" className="h-6 gap-1 text-xs">
            <Barcode className="h-3 w-3" />
            F2
          </Badge>
        </div>
      </div>

      {showResults && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-full bg-card border rounded-lg shadow-xl mt-1 overflow-hidden">
          <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Kết quả tìm kiếm
            </span>
            {totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalCount} sản phẩm
              </Badge>
            )}
          </div>
          
          <ScrollArea className="max-h-96">
            <div className="py-1">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors group"
                  onClick={() => handleSelect(product)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 group-hover:border-primary">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {product.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate group-hover:text-primary">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>Mã: {product.internal_code}</span>
                        <span>•</span>
                        <span>Tồn: {product.current_stock} {product.base_unit}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-primary">
                        {formatPrice(product.sale_price)}
                      </div>
                      {product.manage_by_batch && (
                        <Badge variant="outline" className="text-[10px] mt-1">
                          Quản lý lô
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div ref={loadMoreRef} className="p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </div>
              )}
              
              {results.length === 0 && !isSearching && (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Không tìm thấy sản phẩm</p>
                  <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}