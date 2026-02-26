export interface Product {
  id: string;
  internal_code: string;
  barcode?: string | null;
  name: string;
  category?: string | null;
  base_unit: string;  // Đổi từ unit thành base_unit
  sale_price: number;
  cost_price?: number | null;
  min_stock: number;
  manage_by_batch: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Các trường tính toán hoặc từ join
  current_stock?: number;  // Tính từ tổng các lô
  units?: ProductUnit[];
  product_batches?: ProductBatch[];
}

export interface ProductFormData {
  internal_code: string;
  barcode?: string | null;
  name: string;
  category?: string | null;
  base_unit: string;  // Đổi từ unit thành base_unit
  sale_price: number;
  cost_price?: number | null;
  min_stock: number;
  manage_by_batch: boolean;
  is_active: boolean;
  // Không bao gồm các trường tự động
}

export interface ProductFilters {
  search?: string;
  category?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  low_stock?: boolean;
}

export interface ProductUnit {
  id?: string;
  product_id?: string;
  unit_name: string;
  conversion_factor: number;
  sale_price: number;
  is_base_unit: boolean;
  created_at?: string;
}

export interface ProductBatch {
  id: string;
  product_id: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface InventorySnapshot {
  product_id: string;
  quantity: number;
  last_updated: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: string;
  quantity_change: number;
  reference_id?: string | null;
  created_at: string;
}

export interface StockEntry {
  id: string;
  entry_code: string;
  entry_date: string;
  supplier_name?: string | null;
  total_amount: number;
  notes?: string | null;
  created_at: string;
}

export interface StockEntryItem {
  id: string;
  stock_entry_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  batch_number?: string | null;
  expiry_date?: string | null;
  created_at?: string;
  // Joined fields
  products?: {
    name: string;
    base_unit: string;
    manage_by_batch?: boolean;
  };
}

export interface StockEntryWithItems extends StockEntry {
  items: StockEntryItem[];
}

export interface Sale {
  id: string;
  sale_code: string;
  sale_date: string;
  customer_name?: string | null;
  total_amount: number;
  final_amount: number;
  payment_method?: string | null;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  batch_id?: string | null;
  product_unit_id?: string | null;
  quantity: number;
  quantity_in_base: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
  // Joined fields
  products?: {
    name: string;
    base_unit: string;
  };
  product_units?: {
    unit_name: string;
    conversion_factor: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  message?: string;
}