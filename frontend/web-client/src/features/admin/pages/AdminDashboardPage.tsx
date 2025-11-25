// src/features/admin/pages/AdminDashboardPage.tsx
import React, { type ComponentType } from 'react'
import { MousePointerClick, Clock, Home, Share2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts'

import { fetchDailyMetrics } from '../../../shared/api/analytics'
import type { DailyMetric } from '../../../shared/api/analytics'

export default function AdminDashboardPage() {
  const { data: metrics = [], isLoading } = useQuery<DailyMetric[]>({
    queryKey: ['admin-daily-metrics'],
    queryFn: fetchDailyMetrics,
  })

  const totalClicks = metrics.reduce((sum, m) => sum + m.postClicks, 0)
  const totalShares = metrics.reduce((sum, m) => sum + m.shareCount, 0)

  const avgPostStay =
    metrics.length === 0
      ? 0
      : Math.round(
          (metrics.reduce((sum, m) => sum + m.postStayAvgSec, 0) /
            metrics.length) *
            10,
        ) / 10

  const avgHomeStay =
    metrics.length === 0
      ? 0
      : Math.round(
          (metrics.reduce((sum, m) => sum + m.homeStayAvgSec, 0) /
            metrics.length) *
            10,
        ) / 10

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">성과 지표를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        성과 지표 대시보드
      </h1>

      {/* 상단 카드 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="최근 7일 게시물 클릭 수"
          value={totalClicks.toLocaleString()}
          icon={MousePointerClick}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          label="최근 7일 평균 게시물 체류 시간(초)"
          value={avgPostStay.toString()}
          icon={Clock}
          bgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          label="최근 7일 평균 홈 체류 시간(초)"
          value={avgHomeStay.toString()}
          icon={Home}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          label="최근 7일 공유 수"
          value={totalShares.toLocaleString()}
          icon={Share2}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      {/* 일별 게시물 클릭 수 & 공유 수 차트 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          일별 게시물 클릭 수 / 공유 수
        </h2>
        <div className="overflow-x-auto">
          <LineChart
            width={800}
            height={260}
            data={metrics}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="postClicks"
              name="게시물 클릭 수"
            />
            <Line
              type="monotone"
              dataKey="shareCount"
              name="공유 수"
            />
          </LineChart>
        </div>
      </div>

      {/* 일별 평균 체류 시간 비교 차트 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          일별 평균 체류 시간(초) 비교
        </h2>
        <div className="overflow-x-auto">
          <BarChart
            width={800}
            height={260}
            data={metrics}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="postStayAvgSec"
              name="게시물 체류 시간(평균, 초)"
            />
            <Bar
              dataKey="homeStayAvgSec"
              name="홈 체류 시간(평균, 초)"
            />
          </BarChart>
        </div>
      </div>
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string
  icon: ComponentType<{ className?: string; size?: number }>
  bgColor: string
  iconColor: string
}

function StatCard({
  label,
  value,
  icon: Icon,
  bgColor,
  iconColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={iconColor} size={24} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
