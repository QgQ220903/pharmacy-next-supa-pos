'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase-client'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function RevenueChart() {
  const [data, setData] = useState({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      // Fetch today's revenue
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
      
      const { data: todaySales } = await supabase
        .from('sales')
        .select('final_amount')
        .gte('created_at', todayStart)

      // Fetch yesterday's revenue
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString()
      const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1).toISOString()

      const { data: yesterdaySales } = await supabase
        .from('sales')
        .select('final_amount')
        .gte('created_at', yesterdayStart)
        .lt('created_at', yesterdayEnd)

      // Calculate revenue
      const todayRevenue = todaySales?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0
      const yesterdayRevenue = yesterdaySales?.reduce((sum, sale) => sum + (sale.final_amount || 0), 0) || 0

      setData({
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        thisWeek: todayRevenue * 3, // Giả lập
        lastWeek: yesterdayRevenue * 3,
        thisMonth: todayRevenue * 20,
        lastMonth: yesterdayRevenue * 20,
      })
    } catch (error) {
      console.error('Error fetching revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  const revenueItems = [
    {
      period: 'Hôm nay',
      amount: data.today,
      previous: data.yesterday,
      color: 'bg-blue-500',
    },
    {
      period: 'Tuần này',
      amount: data.thisWeek,
      previous: data.lastWeek,
      color: 'bg-green-500',
    },
    {
      period: 'Tháng này',
      amount: data.thisMonth,
      previous: data.lastMonth,
      color: 'bg-purple-500',
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng quan doanh thu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {revenueItems.map((item, index) => {
            const growth = calculateGrowth(item.amount, item.previous)
            const isPositive = growth > 0
            
            return (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`${item.color} h-10 w-10 rounded-lg flex items-center justify-center`}>
                    <span className="text-white font-bold">${index + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{item.period}</div>
                    <div className="text-sm text-muted-foreground">
                      So với {index === 0 ? 'hôm qua' : index === 1 ? 'tuần trước' : 'tháng trước'}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold">{formatCurrency(item.amount)}</div>
                  <div className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{isPositive ? '+' : ''}{growth.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.today)}
              </div>
              <div className="text-sm text-gray-600">Hôm nay</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.thisWeek)}
              </div>
              <div className="text-sm text-gray-600">Tuần này</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(data.thisMonth)}
              </div>
              <div className="text-sm text-gray-600">Tháng này</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}