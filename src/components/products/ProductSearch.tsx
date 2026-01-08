// "use client";
// import * as React from "react";
// import { Check, ChevronsUpDown, Search } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Product } from "@/types";

// export function ProductSearch({
//   products,
//   onSelect,
// }: {
//   products: Product[];
//   onSelect: (p: Product) => void;
// }) {
//   const [open, setOpen] = React.useState(false);

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className="w-full justify-between h-12 text-base"
//         >
//           <div className="flex items-center gap-2">
//             <Search className="h-4 w-4 shrink-0 opacity-50" />
//             Tìm tên thuốc hoặc mã nội bộ...
//           </div>
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
//         <Command>
//           <CommandInput placeholder="Nhập tên thuốc..." />
//           <CommandList>
//             <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
//             <CommandGroup>
//               {products.map((product) => (
//                 <CommandItem
//                   key={product.id}
//                   value={product.name + product.internal_code}
//                   onSelect={() => {
//                     onSelect(product);
//                     setOpen(false);
//                   }}
//                 >
//                   <div className="flex flex-col">
//                     <span className="font-bold">{product.name}</span>
//                     <span className="text-xs text-muted-foreground">
//                       Mã: {product.internal_code} - Tồn: {product.current_stock}
//                     </span>
//                   </div>
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ProductSearchProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function ProductSearch({ products = [], onSelect }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const safeProducts = Array.isArray(products) ? products : [];

  const filtered =
    searchTerm === ""
      ? []
      : safeProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.internal_code.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-card border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
              onClick={() => {
                onSelect(product);
                setSearchTerm("");
              }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {product.internal_code}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Tồn: {product.current_stock} {product.unit}
                    </span>
                  </div>
                </div>
                {product.manage_by_batch ? (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-violet-100 text-violet-800"
                  >
                    Theo lô
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800"
                  >
                    Tổng hợp
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm !== "" && filtered.length === 0 && (
        <div className="absolute z-50 w-full bg-card border rounded-lg mt-1 p-4 text-center">
          <div className="text-sm text-muted-foreground">
            Không tìm thấy sản phẩm
          </div>
        </div>
      )}
    </div>
  );
}
