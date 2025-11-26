// src/features/admin/pages/AdminDashboardPage.tsx
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  MousePointerClick,
  Clock,
  Home,
  Share2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts'

import type {
  DailyMetric,
  RecommendationMetric,
} from '@/shared/api/analytics'
import {
  fetchDailyMetrics,
  fetchRecommendationMetrics,
} from '@/shared/api/analytics'

/* =========================
   유틸 / 공통 컴포넌트
   ========================= */

type StatCardProps = {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  gradient: string
  iconGradient: string
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  gradient,
  iconGradient,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-xl hover:ring-gray-200">
      {/* 그라데이션 배경 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03]`}
      />
      
      <div className="relative">
        {/* 헤더 */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon size={22} className="text-white" />
          </div>
        </div>

        {/* 값 */}
        <div className="mb-2">
          <p className="text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        {/* 서브타이틀 및 트렌드 */}
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              <span>{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
  className = '',
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-shadow duration-300 hover:shadow-md ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* 헤더 스켈레톤 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-64 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-5 w-96 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* 카드 스켈레톤 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>

      {/* 차트 스켈레톤 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>
    </div>
  )
}

function formatDateLabel(isoDate: string) {
  const d = isoDate.split('-')
  if (d.length !== 3) return isoDate
  const month = parseInt(d[1], 10)
  const day = parseInt(d[2], 10)
  return `${month}/${day}`
}

/* =========================
   페이지 컴포넌트
   ========================= */

export default function AdminDashboardPage() {
  const [daily, setDaily] = useState<DailyMetric[]>([])
  const [reco, setReco] = useState<RecommendationMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setError(null)
        const [dailyData, recoData] = await Promise.all([
          fetchDailyMetrics(),
          fetchRecommendationMetrics(),
        ])
        setDaily(dailyData)
        setReco(recoData)
      } catch (err) {
        console.error('[AdminDashboard] Failed to load data:', err)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  /* ---- 카드용 집계 ---- */
  const totalClicks7d = useMemo(
    () => daily.reduce((sum, d) => sum + (d.postClicks ?? 0), 0),
    [daily],
  )

  const totalShare7d = useMemo(
    () => daily.reduce((sum, d) => sum + (d.shareCount ?? 0), 0),
    [daily],
  )

  const avgPostStay7d = useMemo(() => {
    const num = daily.reduce(
      (sum, d) => sum + (d.postStayAvgSec ?? 0) * (d.postStayCount ?? 0),
      0,
    )
    const den = daily.reduce((sum, d) => sum + (d.postStayCount ?? 0), 0)
    if (!den) return 0
    return num / den
  }, [daily])

  const avgHomeStay7d = useMemo(() => {
    const num = daily.reduce(
      (sum, d) => sum + (d.homeStayAvgSec ?? 0) * (d.homeStayCount ?? 0),
      0,
    )
    const den = daily.reduce((sum, d) => sum + (d.homeStayCount ?? 0), 0)
    if (!den) return 0
    return num / den
  }, [daily])

  // 추천 CTR 관련 총합 (데이터 적을 때 참고용)
  const totalRecoClicks7d = useMemo(
    () => reco.reduce((sum, r) => sum + (r.clicks ?? 0), 0),
    [reco],
  )
  const totalRecoImpressions7d = useMemo(
    () => reco.reduce((sum, r) => sum + (r.impressions ?? 0), 0),
    [reco],
  )

  // 전체 CTR 계산: 총 클릭 / 총 노출 * 100
  const avgCtr7d = useMemo(() => {
    if (totalRecoImpressions7d === 0) return 0
    return (totalRecoClicks7d / totalRecoImpressions7d) * 100
  }, [totalRecoClicks7d, totalRecoImpressions7d])

  /* ---- 차트용 데이터 ---- */
  const clickShareChartData = useMemo(
    () =>
      daily.map((d) => ({
        date: formatDateLabel(d.date),
        clicks: d.postClicks ?? 0,
        shares: d.shareCount ?? 0,
      })),
    [daily],
  )

  const stayChartData = useMemo(
    () =>
      daily.map((d) => ({
        date: formatDateLabel(d.date),
        postStay: Number((d.postStayAvgSec ?? 0).toFixed(2)),
        homeStay: Number((d.homeStayAvgSec ?? 0).toFixed(2)),
      })),
    [daily],
  )

  const ctrChartData = useMemo(
    () =>
      reco.map((r) => ({
        date: formatDateLabel(r.date),
        ctr: r.ctr ?? 0,
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
      })),
    [reco],
  )

  // 체류 시간 포맷팅 헬퍼
  const formatStayTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}초`
    const minutes = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${minutes}분 ${secs}초`
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Activity className="h-8 w-8 text-red-600" />
        </div>
        <p className="mb-1 text-lg font-semibold text-gray-900">{error}</p>
        <p className="text-sm text-gray-500">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* 헤더 섹션 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            성과지표
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            최근 7일간의 사용자 행동 데이터와 성과 지표를 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-gray-700">
              실시간 업데이트
            </span>
          </div>
        </div>
      </div>

      {/* 요약 카드 그리드 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="게시물 클릭 수"
          value={totalClicks7d.toLocaleString()}
          icon={MousePointerClick}
          subtitle="최근 7일간 (이벤트 기반)"
          gradient="from-blue-500 via-blue-600 to-blue-700"
          iconGradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="평균 게시물 체류 시간"
          value={formatStayTime(avgPostStay7d)}
          icon={Clock}
          subtitle="최근 7일간 평균"
          gradient="from-purple-500 via-purple-600 to-purple-700"
          iconGradient="from-purple-500 to-purple-600"
        />
        <StatCard
          title="평균 홈 체류 시간"
          value={formatStayTime(avgHomeStay7d)}
          icon={Home}
          subtitle="최근 7일간 평균"
          gradient="from-indigo-500 via-indigo-600 to-indigo-700"
          iconGradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="공유 수"
          value={totalShare7d.toLocaleString()}
          icon={Share2}
          subtitle="최근 7일간"
          gradient="from-amber-500 via-amber-600 to-amber-700"
          iconGradient="from-amber-500 to-amber-600"
        />
        <StatCard
          title="평균 추천 CTR"
          value={`${avgCtr7d.toFixed(2)}%`}
          icon={Activity}
          subtitle={
            totalRecoImpressions7d > 0
              ? `클릭 ${totalRecoClicks7d.toLocaleString()}회 / 노출 ${totalRecoImpressions7d.toLocaleString()}회`
              : '데이터 수집 중'
          }
          gradient="from-emerald-500 via-emerald-600 to-emerald-700"
          iconGradient="from-emerald-500 to-emerald-600"
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 일별 클릭 수 / 공유 수 */}
        <ChartCard
          title="일별 클릭 수 / 공유 수"
          description="일별 게시물 클릭 수와 공유 수의 추이를 확인합니다"
          className="lg:col-span-2"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={clickShareChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="sharesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px',
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px',
                    fontSize: '13px',
                  }}
                  itemStyle={{
                    padding: '4px 0',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '24px' }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: '#374151', fontSize: '13px' }}>
                      {value}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="게시물 클릭 수"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#clicksGradient)"
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="shares"
                  name="공유 수"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#sharesGradient)"
                  dot={{ fill: '#f59e0b', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* 일별 평균 체류 시간 비교 */}
        <ChartCard
          title="체류 시간 비교"
          description="게시물과 홈 페이지의 평균 체류 시간"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stayChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                barCategoryGap="25%"
                barGap={12}
              >
                <defs>
                  <linearGradient id="postStayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="homeStayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const seconds = Number(value).toFixed(2)
                    const minutes = Math.floor(Number(value) / 60)
                    const secs = (Number(value) % 60).toFixed(2)
                    const display =
                      Number(value) >= 60
                        ? `${minutes}분 ${secs}초 (${seconds}초)`
                        : `${seconds}초`
                    return [display, name]
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px',
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px',
                    fontSize: '13px',
                  }}
                  itemStyle={{
                    padding: '4px 0',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '24px' }}
                  iconType="square"
                  formatter={(value) => (
                    <span style={{ color: '#374151', fontSize: '13px' }}>
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="postStay"
                  name="게시물 체류 시간"
                  fill="url(#postStayGradient)"
                  radius={[10, 10, 0, 0] as any}
                  activeBar={{
                    fill: 'rgba(99, 102, 241, 0.5)',
                    stroke: '#6366f1',
                    strokeWidth: 2,
                    radius: [10, 10, 0, 0] as any,
                  }}
                />
                <Bar
                  dataKey="homeStay"
                  name="홈 체류 시간"
                  fill="url(#homeStayGradient)"
                  radius={[10, 10, 0, 0] as any}
                  activeBar={{
                    fill: 'rgba(245, 158, 11, 0.5)',
                    stroke: '#f59e0b',
                    strokeWidth: 2,
                    radius: [10, 10, 0, 0] as any,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* 일별 추천 CTR 추이 */}
        <ChartCard
          title="추천 CTR 추이"
          description="추천 콘텐츠의 클릭률 변화 추이"
        >
          {ctrChartData.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <p className="mb-1 text-sm font-semibold text-gray-700">
                데이터가 없습니다
              </p>
              <p className="text-xs text-gray-500">
                추천 영역에서 노출 및 클릭이 발생하면 그래프가 표시됩니다
              </p>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={ctrChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="ctrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => {
                      if (name === '추천 CTR(%)') {
                        return [
                          `${value}% (클릭: ${props.payload.clicks.toLocaleString()}회, 노출: ${props.payload.impressions.toLocaleString()}회)`,
                          name,
                        ]
                      }
                      return [value, name]
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px',
                    }}
                    labelStyle={{
                      fontWeight: 600,
                      color: '#111827',
                      marginBottom: '8px',
                      fontSize: '13px',
                    }}
                    itemStyle={{
                      padding: '4px 0',
                      fontSize: '13px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '24px' }}
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: '#374151', fontSize: '13px' }}>
                        {value}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="ctr"
                    name="추천 CTR(%)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#ctrGradient)"
                    dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
