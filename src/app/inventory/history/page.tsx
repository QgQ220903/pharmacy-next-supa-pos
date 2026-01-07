// app/inventory/history/page.tsx
import { getInventoryHistoryAction } from "@/app/actions/inventory";
import HistoryTable from "./HistoryTable";
import HistoryFilter from "./HistoryFilter";

// Định nghĩa kiểu dữ liệu cho props của Server Component
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InventoryHistoryPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const fromDate = (searchParams.fromDate as string) || undefined;
  const toDate = (searchParams.toDate as string) || undefined;

  // Lấy từ khóa tìm kiếm từ URL
  const productQuery = (searchParams.productQuery as string) || undefined;

  const result = await getInventoryHistoryAction({
    page,
    limit: 15,
    productQuery, // Truyền vào đây
    fromDate,
    toDate,
  });

  // Đảm bảo dữ liệu truyền xuống luôn là mảng để tránh lỗi .filter() ở Client
  const historyData = result?.data || [];
  const totalPages = result?.totalPages || 1;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Lịch sử thẻ kho
          </h1>
          <p className="text-sm text-slate-500 italic">
            Theo dõi biến động xuất, nhập và điều chỉnh tồn kho
          </p>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Bộ lọc & Phân trang (Client Component) */}
      <HistoryFilter totalPages={totalPages} />

      {/* Bảng dữ liệu (Client Component) */}
      <HistoryTable initialData={historyData} />

      {/* Thông tin bổ sung dưới chân bảng */}
      <div className="text-[11px] text-slate-400 text-right italic">
        * Dữ liệu được cập nhật theo thời gian thực từ hệ thống
      </div>
    </div>
  );
}
