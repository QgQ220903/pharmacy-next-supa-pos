'use client'

import { Plus, ShoppingCart, Package, BarChart3, FileText, Settings } from 'lucide-react'

export default function QuickActions() {
  const actions = [
    { 
      label: 'Bán hàng', 
      icon: ShoppingCart, 
      href: '/pos',
      description: 'Tạo hóa đơn mới'
    },
    { 
      label: 'Nhập kho', 
      icon: Package, 
      href: '/entries',
      description: 'Thêm sản phẩm'
    },
    { 
      label: 'Thêm thuốc', 
      icon: Plus, 
      href: '/products/new',
      description: 'Thêm sản phẩm mới'
    },
    { 
      label: 'Báo cáo', 
      icon: BarChart3, 
      href: '/reports',
      description: 'Xem báo cáo'
    },
    { 
      label: 'Hóa đơn', 
      icon: FileText, 
      href: '/invoices',
      description: 'Quản lý hóa đơn'
    },
    { 
      label: 'Cài đặt', 
      icon: Settings, 
      href: '/settings',
      description: 'Cấu hình hệ thống'
    },
  ]

  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="font-semibold mb-3 text-foreground">Thao tác nhanh</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <a
              key={index}
              href={action.href}
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors text-center group"
            >
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mb-2 group-hover:bg-secondary/80 transition-colors">
                <Icon className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
              <span className="text-xs text-muted-foreground mt-1">{action.description}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}