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

interface ProductSearchProps {
  products: Product[]; // Interface yêu cầu mảng
  onSelect: (product: Product) => void;
}

export function ProductSearch({ products = [], onSelect }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Kiểm tra an toàn: nếu products rỗng hoặc không phải mảng, gán mảng rỗng
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
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm tên thuốc hoặc mã nội bộ..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border rounded-md mt-1 shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition-colors"
              onClick={() => {
                onSelect(product);
                setSearchTerm("");
              }}
            >
              <div className="font-bold text-sm text-blue-700">
                {product.name}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mã: {product.internal_code}</span>
                <span>
                  Tồn: <b className="text-gray-700">{product.current_stock}</b>{" "}
                  {product.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm !== "" && filtered.length === 0 && (
        <div className="absolute z-50 w-full bg-white border rounded-md mt-1 p-4 text-center text-sm text-gray-500 shadow-lg">
          Không tìm thấy sản phẩm nào khớp với từ khóa
        </div>
      )}
    </div>
  );
}
