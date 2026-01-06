//"@types/index.ts"
export interface Product {
  id: string;
  internal_code: string;
  barcode?: string | null;
  name: string;
  short_name?: string | null;
  category?: string | null;
  unit: string;
  sale_price: number;
  cost_price?: number | null;
  min_stock: number;
  max_stock?: number | null;
  is_active: boolean;
  can_sell: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  current_stock: number;
}

// @/types/index.ts
export interface ProductFormData {
  internal_code: string;
  barcode?: string | null; // Thêm | null
  name: string;
  short_name?: string | null; // Thêm | null
  category?: string | null; // Thêm | null
  unit: string;
  sale_price: number;
  cost_price?: number | null; // Thêm | null
  min_stock: number;
  max_stock?: number | null; // Thêm | null
  is_active: boolean;
  can_sell: boolean;
  notes?: string | null; // Thêm | null
  current_stock?: number; // Không bắt buộc trong form
}

export interface ProductFilters {
  search?: string;
  category?: string;
  is_active?: boolean;
  can_sell?: boolean;
  min_price?: number;
  max_price?: number;
  low_stock?: boolean;
}

export interface InventorySnapshot {
  product_id: string;
  quantity: number;
  last_updated: string;
}

export interface StockEntry {
  id: string;
  entry_code: string;
  entry_date: string;
  supplier?: string | null;
  total_amount: number;
  notes?: string | null;
  status: string;
  created_at: string;
  created_by?: string | null;
}

export interface Sale {
  id: string;
  sale_code: string;
  sale_date: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: "purchase" | "sale" | "adjustment" | "return";
  quantity_change: number;
  reference_id?: string | null;
  notes?: string | null;
  created_at: string;
}

// Types cho form inputs
export type SaleFormData = Omit<Sale, "id" | "sale_code" | "created_at">;
