// app/actions/sales.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

interface SaleItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CreateSaleInput {
  customer_name?: string | null;
  customer_phone?: string | null;
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_method?: string | null;
  notes?: string | null;
  items: SaleItemInput[];
}

export async function createSale(saleData: CreateSaleInput) {
  try {
    const saleId = uuidv4();
    const saleCode = `HD-${Date.now().toString().slice(-6)}`;

    // Tạo sale record
    const { error: saleError } = await supabaseAdmin.from("sales").insert([
      {
        id: saleId,
        sale_code: saleCode,
        sale_date: new Date().toISOString(),
        ...saleData,
      },
    ]);

    if (saleError) throw saleError;

    // Tạo sale items
    const saleItems = saleData.items.map((item) => ({
      id: uuidv4(),
      sale_id: saleId,
      ...item,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("sale_items")
      .insert(saleItems);

    if (itemsError) throw itemsError;

    // Cập nhật inventory cho từng sản phẩm
    for (const item of saleData.items) {
      // 1. Tạo inventory transaction
      await supabaseAdmin.from("inventory_transactions").insert([
        {
          product_id: item.product_id,
          transaction_type: "sale",
          quantity_change: -item.quantity,
          reference_id: saleId,
          notes: `Bán hàng - ${saleCode}`,
        },
      ]);

      // 2. Cập nhật inventory snapshot thông qua RPC
      const { error: updateError } = await supabaseAdmin.rpc(
        "update_inventory_on_sale",
        {
          p_product_id: item.product_id,
          p_quantity_change: -item.quantity,
          p_reference_id: saleId,
        }
      );

      if (updateError) throw updateError;
    }

    revalidatePath("/pos");
    revalidatePath("/sales");

    return {
      success: true,
      data: {
        sale_id: saleId,
        sale_code: saleCode,
      },
    };
  } catch (error) {
    console.error("Error creating sale:", error);
    return { success: false, error: "Failed to create sale" };
  }
}

export async function getSales(dateFrom?: string, dateTo?: string) {
  try {
    let query = supabaseAdmin
      .from("sales")
      .select(
        `
        *,
        sale_items (*)
      `
      )
      .order("created_at", { ascending: false });

    if (dateFrom && dateTo) {
      query = query.gte("sale_date", dateFrom).lte("sale_date", dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching sales:", error);
    return { success: false, error: "Failed to fetch sales" };
  }
}

export async function getSaleById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("sales")
      .select(
        `
        *,
        sale_items (
          *,
          products (*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching sale:", error);
    return { success: false, error: "Failed to fetch sale" };
  }
}
