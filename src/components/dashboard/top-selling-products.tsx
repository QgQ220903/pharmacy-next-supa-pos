'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function TopSellingProducts() {
  const products = [
    { name: 'Paracetamol 500mg', code: 'TH0001', sold: 245, growth: 12.5 },
    { name: 'Amoxicillin 500mg', code: 'TH0002', sold: 189, growth: 8.3 },
    { name: 'Vitamin C 1000mg', code: 'TH0003', sold: 156, growth: -2.1 },
    { name: 'Panadol Extra', code: 'TH0004', sold: 134, growth: 15.7 },
    { name: 'Cefixime 200mg', code: 'TH0005', sold: 112, growth: 5.4 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sản phẩm bán chạy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div 
              key={product.code} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.code}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold">{product.sold} sản phẩm</div>
                <div className={`text-sm flex items-center gap-1 ${product.growth > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {product.growth > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{product.growth > 0 ? '+' : ''}{product.growth.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <a 
            href="/reports/products" 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
          >
            Xem báo cáo chi tiết →
          </a>
        </div>
      </CardContent>
    </Card>
  )
}