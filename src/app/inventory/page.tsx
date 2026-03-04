import { Suspense } from "react";
import InventoryClient from "./InventoryClient";
import Loading from "./loading";
import { 
  getInventoryTransactionsAction, 
  getProductsWithStockAction 
} from "@/app/actions/inventory";

export const metadata = {
  title: "Kiểm kê kho | MedPOS",
  description: "Quản lý biến động và kiểm kê kho dược",
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page) || 1;
  const search = (searchParams.search as string) || "";
  const type = (searchParams.type as string) || "all";
  const fromDate = (searchParams.fromDate as string) || "";
  const toDate = (searchParams.toDate as string) || "";
  const tab = (searchParams.tab as string) || "history";

  // Pre-fetch initial data on server to trigger loading.tsx skeleton
  let initialData = null;
  if (tab === "history") {
    initialData = await getInventoryTransactionsAction({
      page,
      search,
      type,
      fromDate,
      toDate
    });
  } else {
    initialData = await getProductsWithStockAction({
      search,
      page,
      limit: 20
    });
  }
  
  return (
    <div className="container mx-auto py-6">
      <InventoryClient 
        initialTab={tab}
        initialSearch={search}
        initialParams={{
          page,
          type,
          fromDate,
          toDate
        }}
        initialData={initialData}
      />
    </div>
  );
}
