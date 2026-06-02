import { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader } from 'lucide-react';

interface ModelMetric {
  architecture: string;
  total_inferences: number;
  avg_pcc: number;
  avg_rmse: number;
  avg_processing_time_ms: number;
  success_rate: number;
  avg_user_rating: number;
}

interface ChannelMetric {
  channel: string;
  avg_pcc: number;
  avg_rmse: number;
  avg_mae: number;
  success_rate: number;
}

interface TrendData {
  date: string;
  [key: string]: any;
}

export default function AdminModels() {
  const [models, setModels] = useState<ModelMetric[]>([]);
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetric[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [modelsRes, channelRes, trendRes] = await Promise.all([
          apiClient.get('/api/v1/admin/models'),
          apiClient.get('/api/v1/admin/models/channels'),
          apiClient.get('/api/v1/admin/models/trend'),
        ]);

        setModels(modelsRes.data.models);
        setChannelMetrics(channelRes.data.channels);
        setTrendData(trendRes.data.trend);
      } catch (err) {
        console.error('Failed to load model data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="container py-10 flex justify-center items-center min-h-[60vh]">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-white mb-2">Model Analytics</h1>
          <p className="text-slate-400">Performance metrics and comparisons across all architectures</p>
        </div>

        {/* Model Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {models.map((model) => (
            <div
              key={model.architecture}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 cursor-pointer hover:border-blue-500/50 transition"
            >
              <h3 className="text-h5 text-white mb-4">{model.architecture}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Inferences</span>
                  <span className="text-white font-mono font-bold">{model.total_inferences}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg PCC</span>
                  <span className="text-blue-300 font-mono font-bold">
                    {model.avg_pcc.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg RMSE</span>
                  <span className="text-slate-300 font-mono font-bold">
                    {model.avg_rmse.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Processing (ms)</span>
                  <span className="text-amber-300 font-mono font-bold">
                    {model.avg_processing_time_ms.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Success Rate</span>
                  <span
                    className={`font-mono font-bold ${
                      model.success_rate >= 0.95
                        ? 'text-green-300'
                        : model.success_rate >= 0.8
                        ? 'text-amber-300'
                        : 'text-red-300'
                    }`}
                  >
                    {(model.success_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">User Rating</span>
                  <span className="text-slate-300 font-mono font-bold">
                    ⭐ {model.avg_user_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Comparison Chart */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 mb-8">
          <h3 className="text-h4 text-white mb-6">Model Performance Comparison</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PCC Comparison */}
            <div>
              <p className="text-slate-400 text-sm mb-4">Average PCC Score</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={models}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="architecture" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                  <Bar dataKey="avg_pcc" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Processing Time Comparison */}
            <div>
              <p className="text-slate-400 text-sm mb-4">Average Processing Time (ms)</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={models}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="architecture" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                  <Bar dataKey="avg_processing_time_ms" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Trend */}
        {trendData.length > 0 && (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 mb-8">
            <h3 className="text-h4 text-white mb-6">Performance Trend (30 Days)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                  }}
                />
                <Legend />
                {models.slice(0, 3).map((model, idx) => (
                  <Line
                    key={model.architecture}
                    type="monotone"
                    dataKey={model.architecture.toLowerCase()}
                    stroke={['#3B82F6', '#22C55E', '#F59E0B'][idx]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Channel Performance */}
        {channelMetrics.length > 0 && (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-h4 text-white">Channel Performance Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 border-b border-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Channel
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Avg PCC
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Avg RMSE
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Avg MAE
                    </th>
                    <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {channelMetrics.map((metric) => (
                    <tr key={metric.channel} className="hover:bg-slate-700/20">
                      <td className="px-6 py-4 text-white font-mono text-sm">
                        {metric.channel}
                      </td>
                      <td className="px-6 py-4 text-blue-300 font-mono text-sm">
                        {metric.avg_pcc.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                        {metric.avg_rmse.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                        {metric.avg_mae.toFixed(4)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            metric.success_rate >= 0.95
                              ? 'bg-green-500/20 text-green-300'
                              : metric.success_rate >= 0.8
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {(metric.success_rate * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
