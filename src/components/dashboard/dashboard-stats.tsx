'use client'

import { Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react'

export default function DashboardStats() {
  const stats = [
    {
      title: 'Tổng thuốc',
      value: '128',
      icon: Package,
      unit: 'sản phẩm',
      change: '+5',
    },
    {
      title: 'Hóa đơn hôm nay',
      value: '24',
      icon: ShoppingCart,
      unit: 'hóa đơn',
      change: '+3',
    },
    {
      title: 'Doanh thu hôm nay',
      value: '12.45M',
      icon: DollarSign,
      unit: 'VNĐ',
      change: '+12%',
    },
    {
      title: 'Sắp hết hàng',
      value: '8',
      icon: AlertTriangle,
      unit: 'sản phẩm',
      change: 'Cần nhập',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isWarning = stat.title.includes('hết hàng')
        
        return (
          <div 
            key={index} 
            className="border rounded-lg p-6 bg-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">{stat.title}</div>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.unit}</div>
              </div>
              <div className={`p-3 rounded-lg ${isWarning ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <Icon className={`h-5 w-5 ${isWarning ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-600 dark:text-gray-400'}`} />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className={`text-sm ${isWarning ? 'text-yellow-700 dark:text-yellow-500' : stat.change.startsWith('+') ? 'text-green-700 dark:text-green-500' : 'text-muted-foreground'}`}>
                {stat.change}
                {!isWarning && stat.change.startsWith('+') && ' so với hôm qua'}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}