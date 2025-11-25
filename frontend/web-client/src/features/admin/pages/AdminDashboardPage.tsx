// src/features/admin/pages/AdminDashboardPage.tsx
import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  MousePointerClick,
  Clock,
  Home,
  Share2,
  Activity,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
        <Icon size={20} className="text-blue-500" />
      </div>
      <div className="flex flex-col">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  )
}

function formatDateLabel(isoDate: string) {
  // "YYYY-MM-DD" -> "MM-DD"
  const d = isoDate.split('-')
  if (d.length !== 3) return isoDate
  return `${d[1]}-${d[2]}`
}

/* =========================
   페이지 컴포넌트
   ========================= */

export default function AdminDashboardPage() {
  const [daily, setDaily] = useState<DailyMetric[]>([])
  const [reco, setReco] = useState<RecommendationMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dailyData, recoData] = await Promise.all([
          fetchDailyMetrics(),
          fetchRecommendationMetrics(),
        ])
        setDaily(dailyData)
        setReco(recoData)
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

  const avgCtr7d = useMemo(() => {
    if (!reco.length) return 0
    const sum = reco.reduce((s, r) => s + (r.ctr ?? 0), 0)
    return sum / reco.length
  }, [reco])

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
        postStay: d.postStayAvgSec ?? 0,
        homeStay: d.homeStayAvgSec ?? 0,
      })),
    [daily],
  )

  const ctrChartData = useMemo(
    () =>
      reco.map((r) => ({
        date: formatDateLabel(r.date),
        ctr: r.ctr ?? 0,
      })),
    [reco],
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        성과 지표 대시보드
      </h1>

      {/* 요약 카드 5개 한 줄 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-4">
        <StatCard
          title="최근 7일 게시물 클릭 수"
          value={totalClicks7d.toLocaleString()}
          icon={MousePointerClick}
        />
        <StatCard
          title="최근 7일 평균 게시물 체류 시간(초)"
          value={avgPostStay7d.toFixed(1)}
          icon={Clock}
        />
        <StatCard
          title="최근 7일 평균 홈 체류 시간(초)"
          value={avgHomeStay7d.toFixed(1)}
          icon={Home}
        />
        <StatCard
          title="최근 7일 공유 수"
          value={totalShare7d.toLocaleString()}
          icon={Share2}
        />
        <StatCard
          title="최근 7일 평균 추천 CTR(%)"
          value={avgCtr7d.toFixed(2)}
          icon={Activity}
        />
      </div>

      {/* 일별 클릭 수 / 공유 수 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          일별 게시물 클릭 수 / 공유 수
        </h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={clickShareChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="clicks"
                name="게시물 클릭 수"
                stroke="#2563eb"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="shares"
                name="공유 수"
                stroke="#f97316"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 일별 평균 체류 시간 비교 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          일별 평균 체류 시간(초) 비교
        </h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stayChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="postStay"
                name="게시물 체류 시간(평균, 초)"
                fill="#111827"
              />
              <Bar
                dataKey="homeStay"
                name="홈 체류 시간(평균, 초)"
                fill="#4b5563"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 일별 추천 CTR 추이 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">
          일별 추천 CTR(%) 추이
        </h2>
        {ctrChartData.length === 0 ? (
          <p className="text-sm text-gray-500">
            추천 CTR 데이터가 아직 없습니다. 추천 영역에서 노출 및 클릭이
            발생하면 이곳에 그래프가 표시됩니다.
          </p>
        ) : (
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ctrChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ctr"
                  name="추천 CTR(%)"
                  stroke="#22c55e"
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {loading && (
        <p className="text-xs text-gray-400">
          지표 불러오는 중… (데이터 양에 따라 시간이 조금 걸릴 수 있습니다)
        </p>
      )}
    </div>
  )
}
