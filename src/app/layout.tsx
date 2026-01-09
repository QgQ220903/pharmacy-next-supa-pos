import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { ThemeProvider } from "@/providers/theme-provider";
import { createClient } from "@/utils/supabase/server";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedPOS - Hệ thống POS Nhà thuốc",
  description: "Hệ thống quản lý bán hàng cho nhà thuốc Tây",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen bg-background">
            {user && <Sidebar />}
            <div className="flex-1 flex flex-col">
              {user && <Header />}
              <main className="flex-1 p-4 md:p-6 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
