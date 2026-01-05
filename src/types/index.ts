export interface Product {
  id: string
  internal_code: string
  barcode?: string | null
  name: string
  short_name?: string | null
  category?: string | null
  unit: string
  sale_price: number
  cost_price?: number | null
  min_stock: number
  max_stock?: number | null
  is_active: boolean
  can_sell: boolean
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface InventorySnapshot {
  product_id: string
  quantity: number
  last_updated: string
}

export interface StockEntry {
  id: string
  entry_code: string
  entry_date: string
  supplier?: string | null
  total_amount: number
  notes?: string | null
  status: string
  created_at: string
  created_by?: string | null
}

export interface Sale {
  id: string
  sale_code: string
  sale_date: string
  customer_name?: string | null
  customer_phone?: string | null
  total_amount: number
  discount: number
  final_amount: number
  payment_method?: string | null
  notes?: string | null
  created_at: string
}