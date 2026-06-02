import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertCircle, TrendingUp, Users, Zap } from 'lucide-react';

interface KPI {
  total_users: number;
  total_inferences: number;
  inferences_today: number;
  failed_jobs: number;
}

interface ChartData {
  inference_trend: Array<{ date: string; count: number }>;
  jobs_by_architecture: Array<{ name: string; value: number }>;
  jobs_by_status: Array<{ name: string; value: number }>;
}

interface RecentJob {
  id: string;
  created_at: string;
  user: string;
  architecture: string;
  status: string;
  pcc: number;
}

interface FailedJob {
  id: string;
  created_at: string;
  user: string;
  error_message: string;
  error_code: string;
}

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminOverview() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [kpiRes, chartRes, jobsRes, failedRes] = await Promise.all([
          apiClient.get('/api/v1/admin/overview/kpi'),
          apiClient.get('/api/v1/admin/overview/charts'),
          apiClient.get('/api/v1/admin/overview/recent-jobs'),
          apiClient.get('/api/v1/admin/overview/failed-jobs'),
        ]);

        setKpi(kpiRes.data);
        setChartData(chartRes.data);
        setRecentJobs(jobsRes.data.jobs);
        setFailedJobs(failedRes.data.jobs);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="container py-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p className="text-slate-300">Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">System overview and real-time metrics</p>
        </div>

        {/* KPI Cards */}
        {kpi && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm">Total Users</p>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-mono font-bold text-blue-300">{kpi.total_users}</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm">Total Inferences</p>
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-mono font-bold text-green-300">
                {kpi.total_inferences}
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm">Today's Inferences</p>
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-mono font-bold text-amber-300">
                {kpi.inferences_today}
              </p>
            </div>

            <div className="bg-slate-800/50 border border-red-700/50 rounded-lg p-6 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm">Failed Jobs</p>
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-mono font-bold text-red-300">{kpi.failed_jobs}</p>
            </div>
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Inference Trend */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-h4 text-white mb-4">Inferences (Last 30 Days)</h3>
            {chartData?.inference_trend && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.inference_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Jobs by Architecture */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-h4 text-white mb-4">Jobs by Architecture</h3>
            {chartData?.jobs_by_architecture && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.jobs_by_architecture}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Jobs by Status */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-h4 text-white mb-4">Jobs by Status</h3>
            {chartData?.jobs_by_status && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.jobs_by_status}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.jobs_by_status.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-h4 text-white">Recent Jobs (Last 10)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Job ID
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">PCC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-700/20">
                      <td className="px-6 py-3 text-slate-300 text-xs font-mono">
                        {job.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-3 text-slate-300 text-sm">{job.user}</td>
                      <td className="px-6 py-3 text-slate-300 text-xs">{job.architecture}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            job.status === 'complete'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-blue-300 font-mono text-sm">
                        {job.pcc.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failed Jobs */}
          <div className="bg-slate-800/30 border border-red-700/50 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-red-700/50">
              <h3 className="text-h4 text-red-300">Failed Jobs (Last 5)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Job ID
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">User</th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Error Code
                    </th>
                    <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {failedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-700/20">
                      <td className="px-6 py-3 text-slate-300 text-xs font-mono">
                        {job.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-3 text-slate-300 text-sm">{job.user}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-mono">
                          {job.error_code}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-300 text-sm truncate">
                        {job.error_message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
