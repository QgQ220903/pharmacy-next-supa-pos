'use client'

import { supabase } from '@/lib/supabase-client' // Hoặc path tới client của bạn
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'

export async function login(formData: any) {
  
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function logoutAction() {
   (await createClient()).auth.signOut()
  redirect('/login')
}