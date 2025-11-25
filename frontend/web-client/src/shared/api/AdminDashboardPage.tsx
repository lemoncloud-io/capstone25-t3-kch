// src/features/admin/pages/AdminDashboardPage.tsx

import React, { useEffect, useState } from 'react';
import { fetchDailyMetrics, type DailyMetric } from '@/shared/api/analytics'; 
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDailyMetrics();
      setMetrics(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8">Loading Analytics...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1 className="text-2xl font-bold mb-6">📊 성과 지표 대시보드</h1>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        
        {/* 1. 일일 조회수 및 클릭수 추이 (라인 차트) */}
        <div style={{ flex: 1, minWidth: '400px', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3 className="text-lg font-semibold mb-4">📈 일일 트래픽 (Views & Clicks)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#8884d8" name="조회수" />
              <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="추천 클릭수" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2. 추천 콘텐츠 클릭률(CTR) (바 차트) */}
        <div style={{ flex: 1, minWidth: '400px', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          <h3 className="text-lg font-semibold mb-4">🎯 추천 콘텐츠 클릭률 (CTR %)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Bar dataKey="ctr" fill="#ffc658" name="클릭률(%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;