'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client' // SỬ DỤNG BROWSER CLIENT
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { getRevenueStats } from '@/app/actions/dashboard' // Gọi action vừa tạo

export default function RevenueChart() {
  const [data, setData] = useState({
    today: 0, yesterday: 0,
    thisWeek: 0, lastWeek: 0,
    thisMonth: 0, lastMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  // Khởi tạo browser client để dùng nếu cần realtime sau này
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      const result = await getRevenueStats()
      if (result.success && result.data) {
        setData(result.data)
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  // ... Các hàm formatCurrency, calculateGrowth giữ nguyên ...

  if (loading) return <RevenueSkeleton /> // Nên tách skeleton ra cho gọn

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">Tổng quan doanh thu</CardTitle>
        <DollarSign className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Render các item như cũ nhưng dùng dữ liệu từ Action */}
          {[
            { label: 'Hôm nay', val: data.today, prev: data.yesterday, color: 'bg-blue-500' },
            { label: 'Tuần này', val: data.thisWeek, prev: data.lastWeek, color: 'bg-emerald-500' },
            { label: 'Tháng này', val: data.thisMonth, prev: data.lastMonth, color: 'bg-violet-500' },
          ].map((item, i) => {
            const growth = ((item.val - item.prev) / (item.prev || 1)) * 100
            return (
              <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`${item.color} h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-sm`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">So với kỳ trước</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.val)}</div>
                  <div className={`text-xs flex items-center justify-end gap-1 ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{growth.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function RevenueSkeleton() {
    return <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />
}