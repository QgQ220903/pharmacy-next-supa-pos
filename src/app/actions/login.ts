"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  const { error } = await supabase.auth.signInWithPassword({
    email: email || "",
    password: password || "",
  });

  if (error) {
    return { error: "Sai tài khoản hoặc mật khẩu" };
  }

  // Ép buộc Next.js làm mới cache của toàn bộ ứng dụng
  revalidatePath("/", "layout");
  
  // Sau đó mới chuyển hướng
  redirect("/products");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Xóa cache toàn bộ ứng dụng để các component Server cập nhật trạng thái mới
  revalidatePath("/", "layout");
  redirect("/login");
}