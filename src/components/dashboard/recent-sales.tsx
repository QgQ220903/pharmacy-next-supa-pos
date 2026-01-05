'use client'

import { Calendar, User } from 'lucide-react'

export default function RecentSales() {
  const sales = [
    { id: 'HD001', customer: 'Nguyễn Văn A', amount: 1250000, time: '09:30', items: 3 },
    { id: 'HD002', customer: 'Trần Thị B', amount: 2850000, time: '10:15', items: 5 },
    { id: 'HD003', customer: 'Khách lẻ', amount: 450000, time: '11:45', items: 2 },
    { id: 'HD004', customer: 'Phạm Văn C', amount: 1890000, time: '14:20', items: 4 },
  ]

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="font-semibold text-lg mb-4">Hóa đơn gần đây</h3>
      <div className="space-y-4">
        {sales.map((sale) => (
          <div 
            key={sale.id} 
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg border flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">{sale.id}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{sale.customer}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sale.amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {sale.items} sản phẩm • {sale.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium w-full text-center">
          Xem tất cả hóa đơn →
        </button>
      </div>
    </div>
  )
}