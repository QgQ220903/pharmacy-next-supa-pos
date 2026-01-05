import QuickActions from '@/components/dashboard/quick-actions'
import DashboardStats from '@/components/dashboard/dashboard-stats'
import RevenueOverview from '@/components/dashboard/revenue-overview'
import RecentSales from '@/components/dashboard/recent-sales'
import LowStockProducts from '@/components/dashboard/low-stock-products'
import TopSellingProducts from '@/components/dashboard/top-selling-products'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-muted-foreground mt-1">
          Thống kê và báo cáo hệ thống - {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Quick Actions ở đầu */}
      <QuickActions />

      {/* Stats Cards */}
      <DashboardStats />

      {/* Revenue Overview */}
      <RevenueOverview />

      {/* Data Grids */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <RecentSales />
          <LowStockProducts />
        </div>
        <div className="space-y-6">
          <TopSellingProducts />
          <ActivityLog />
        </div>
      </div>
    </div>
  )
}

function ActivityLog() {
  const activities = [
    { time: '09:30', action: 'Nguyễn Văn A đã tạo hóa đơn HD001', type: 'sale' },
    { time: '10:15', action: 'Đã nhập kho 50 Paracetamol 500mg', type: 'stock' },
    { time: '11:45', action: 'Cập nhật thông tin thuốc Amoxicillin', type: 'update' },
    { time: '14:20', action: 'Xuất báo cáo doanh thu tháng 12', type: 'report' },
    { time: '16:30', action: 'Thêm thuốc mới Vitamin C 1000mg', type: 'product' },
  ]

  return (
    <div className="border rounded-lg p-6">
      <h3 className="font-semibold mb-4">Hoạt động gần đây</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
            <div className="text-xs text-muted-foreground min-w-[45px]">{activity.time}</div>
            <div className="flex-1">
              <div className="text-sm">{activity.action}</div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">
                {activity.type === 'sale' && 'Bán hàng'}
                {activity.type === 'stock' && 'Nhập kho'}
                {activity.type === 'update' && 'Cập nhật'}
                {activity.type === 'report' && 'Báo cáo'}
                {activity.type === 'product' && 'Sản phẩm'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}