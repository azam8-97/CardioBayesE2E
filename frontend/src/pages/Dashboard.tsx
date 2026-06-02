import Navbar from "../components/layout/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/api";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader, ArrowRight } from "lucide-react";

interface InferenceJob {
  id: string;
  created_at: string;
  architecture: string;
  overall_pcc: number;
  overall_confidence: string;
  status: string;
  processing_time_ms: number;
  input_filename: string;
}

interface DashboardStats {
  total_jobs: number;
  jobs_last_7_days: number;
  most_used_model: string;
  average_pcc: number;
  success_rate: number;
}

const COLORS = {
  High: "#22C55E",
  Medium: "#F59E0B",
  Low: "#EF4444",
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: any = {
    complete: "bg-green-500/20 text-green-300 border-green-500/30",
    failed: "bg-red-500/20 text-red-300 border-red-500/30",
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    preprocessing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    inferring: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm border ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; unit?: string }> = ({
  label,
  value,
  unit,
}) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-center">
    <p className="text-slate-400 text-sm mb-2">{label}</p>
    <p className="text-3xl font-mono font-bold text-blue-300">
      {value}
      {unit && <span className="text-sm text-slate-400 ml-1">{unit}</span>}
    </p>
  </div>
);

export default function Dashboard() {
  const [jobs, setJobs] = useState<InferenceJob[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [jobsRes, statsRes] = await Promise.all([
          apiClient.get("/api/v1/dashboard/jobs?limit=20"),
          apiClient.get("/api/v1/dashboard/stats"),
        ]);
        setJobs(jobsRes.data.jobs);
        setStats(statsRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== "all" && job.status !== statusFilter) return false;
    if (modelFilter !== "all" && job.architecture !== modelFilter) return false;
    return true;
  });

  const jobsByStatus = jobs.reduce(
    (acc, job) => {
      const status = job.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusChartData = Object.entries(jobsByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const models = Array.from(new Set(jobs.map((j) => j.architecture)));

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="container py-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-h2 text-white">My Dashboard</h1>
            <p className="text-slate-400 mt-1">Track your inference jobs and performance</p>
          </div>
          <button
            onClick={() => navigate("/inference")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
          >
            New Inference <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Inferences" value={stats.total_jobs} />
            <StatCard label="Last 7 Days" value={stats.jobs_last_7_days} />
            <StatCard label="Success Rate" value={(stats.success_rate * 100).toFixed(1)} unit="%" />
            <StatCard label="Average PCC" value={stats.average_pcc.toFixed(3)} />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Jobs by Status */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-h5 text-white mb-4">Jobs by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={["#22C55E", "#EF4444", "#F59E0B", "#3B82F6"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Model Performance */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-h5 text-white mb-4">Top Performing Models</h3>
            <div className="space-y-3">
              {models.slice(0, 5).map((model) => {
                const modelJobs = jobs.filter((j) => j.architecture === model);
                const avgPcc =
                  modelJobs.reduce((sum, j) => sum + j.overall_pcc, 0) / modelJobs.length;
                return (
                  <div key={model} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{model}</p>
                      <p className="text-slate-400 text-sm">{modelJobs.length} inferences</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-300 font-mono font-bold">{avgPcc.toFixed(3)}</p>
                      <p className="text-slate-400 text-sm">avg PCC</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="complete">Complete</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="preprocessing">Preprocessing</option>
            <option value="inferring">Inferring</option>
          </select>

          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          >
            <option value="all">All Models</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* Jobs Table */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Model</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">File</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">PCC</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Confidence</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Time (s)</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-700/20 transition">
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-white font-mono text-xs">
                      {job.architecture}
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate">
                      {job.input_filename}
                    </td>
                    <td className="px-6 py-4 text-blue-300 font-mono">
                      {job.overall_pcc?.toFixed(3) || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {job.overall_confidence && (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${COLORS[job.overall_confidence as keyof typeof COLORS] || "#6B7280"}20`,
                            color: COLORS[job.overall_confidence as keyof typeof COLORS] || "#6B7280",
                            border: `1px solid ${COLORS[job.overall_confidence as keyof typeof COLORS] || "#6B7280"}50`,
                          }}
                        >
                          {job.overall_confidence}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {(job.processing_time_ms / 1000).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4">
                      {job.status === "complete" ? (
                        <button
                          onClick={() => navigate(`/results/${job.id}`)}
                          className="text-blue-400 hover:text-blue-300 font-medium text-sm transition"
                        >
                          View Results
                        </button>
                      ) : (
                        <span className="text-slate-500 text-sm">{job.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-400 mb-4">No jobs found</p>
              <button
                onClick={() => navigate("/inference")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition"
              >
                Create Your First Inference
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
