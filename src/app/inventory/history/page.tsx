// app/inventory/history/page.tsx
import { getInventoryHistoryAction } from "@/app/actions/inventory";
import HistoryTable from "./HistoryTable";
import HistoryFilter from "./HistoryFilter";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InventoryHistoryPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const fromDate = (searchParams.fromDate as string) || undefined;
  const toDate = (searchParams.toDate as string) || undefined;
  const productQuery = (searchParams.productQuery as string) || undefined;

  const result = await getInventoryHistoryAction({
    page,
    limit: 10,
    productQuery,
    fromDate,
    toDate,
  });

  const historyData = result?.data || [];
  const totalPages = result?.totalPages || 1;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Lịch sử thẻ kho
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi biến động tồn kho
        </p>
      </div>

      <HistoryFilter totalPages={totalPages} />
      <HistoryTable initialData={historyData} />
    </div>
  );
}
