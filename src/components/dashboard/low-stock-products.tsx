'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function LowStockProducts() {
  const products = [
    { code: 'TH0001', name: 'Paracetamol 500mg', current: 5, min: 20, unit: 'Viên' },
    { code: 'TH0002', name: 'Amoxicillin 500mg', current: 8, min: 15, unit: 'Viên' },
    { code: 'TH0003', name: 'Vitamin C 1000mg', current: 3, min: 10, unit: 'Viên' },
    { code: 'TH0004', name: 'Panadol Extra', current: 12, min: 25, unit: 'Vỉ' },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sản phẩm sắp hết hàng</CardTitle>
        <div className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{products.length} sản phẩm</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => {
            const percentage = Math.round((product.current / product.min) * 100)
            const status = percentage <= 25 ? 'critical' : percentage <= 50 ? 'warning' : 'low'
            
            return (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{product.code}</div>
                      <div className="text-sm text-gray-600">{product.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{product.current} {product.unit}</div>
                      <div className="text-sm text-gray-600">Tối thiểu: {product.min}</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'critical' ? 'bg-red-600' :
                        status === 'warning' ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex justify-between mt-1">
                    <span>0 {product.unit}</span>
                    <span>{product.min} {product.unit} (tối thiểu)</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <a 
            href="/inventory/low-stock" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
          >
            Quản lý tồn kho →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}