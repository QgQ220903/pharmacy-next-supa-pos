'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function RevenueOverview() {
  const revenueData = [
    { day: 'T2', amount: 8500000 },
    { day: 'T3', amount: 9200000 },
    { day: 'T4', amount: 7800000 },
    { day: 'T5', amount: 12450000 },
    { day: 'T6', amount: 11500000 },
    { day: 'T7', amount: 9800000 },
    { day: 'CN', amount: 6500000 },
  ]

  const total = revenueData.reduce((sum, day) => sum + day.amount, 0)
  const average = total / revenueData.length
  const highest = Math.max(...revenueData.map(d => d.amount))
  const growth = ((revenueData[revenueData.length - 1].amount - revenueData[revenueData.length - 2].amount) / revenueData[revenueData.length - 2].amount) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Doanh thu tuần này</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Tổng tuần</div>
              <div className="text-lg font-semibold">{formatCurrency(total)}</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Trung bình/ngày</div>
              <div className="text-lg font-semibold">{formatCurrency(average)}</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Tăng trưởng</div>
              <div className="text-lg font-semibold flex items-center justify-center gap-1">
                {growth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={growth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div>
            <div className="flex items-end justify-between h-32">
              {revenueData.map((day, index) => {
                const maxHeight = 80
                const height = (day.amount / highest) * maxHeight
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-1">
                      {formatCurrency(day.amount)}
                    </div>
                    <div
                      className={`w-8 rounded-t ${day.amount === highest ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ height: `${height}px` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-1">{day.day}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Cao nhất</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-gray-600">Khác</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}