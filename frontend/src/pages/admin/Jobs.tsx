import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api';
import AdminLayout from '../../components/layout/AdminLayout';
import { Download, Loader } from 'lucide-react';

interface AdminJob {
  id: string;
  created_at: string;
  user: string;
  architecture: string;
  status: string;
  processing_time_ms: number;
  overall_pcc: number;
  overall_confidence: string;
  input_filename: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: any = {
    complete: 'bg-green-500/20 text-green-300 border-green-500/30',
    failed: 'bg-red-500/20 text-red-300 border-red-500/30',
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    preprocessing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    inferring: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm border ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [architectureFilter, setArchitectureFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [architectures, setArchitectures] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/v1/admin/jobs');
        setJobs(response.data.jobs);
        setFilteredJobs(response.data.jobs);

        // Extract unique architectures
        const archs = Array.from(new Set(response.data.jobs.map((j: any) => j.architecture)));
        setArchitectures(archs as string[]);
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((j) => j.status === statusFilter);
    }

    // Architecture filter
    if (architectureFilter !== 'all') {
      filtered = filtered.filter((j) => j.architecture === architectureFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((j) => new Date(j.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter((j) => new Date(j.created_at) <= new Date(dateTo));
    }

    setFilteredJobs(filtered);
  }, [statusFilter, architectureFilter, dateFrom, dateTo, jobs]);

  const handleExport = () => {
    const csv = [
      ['Job ID', 'Created At', 'User', 'Architecture', 'Status', 'Processing (ms)', 'PCC', 'Confidence'].join(','),
      ...filteredJobs.map((j) =>
        [
          j.id,
          j.created_at,
          j.user,
          j.architecture,
          j.status,
          j.processing_time_ms,
          j.overall_pcc.toFixed(4),
          j.overall_confidence,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
          <h1 className="text-h2 text-white mb-4">Inference Jobs Management</h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
              value={architectureFilter}
              onChange={(e) => setArchitectureFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Architectures</option>
              {architectures.map((arch) => (
                <option key={arch} value={arch}>
                  {arch}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
            />

            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Job ID
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">User</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Architecture
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Processing (s)
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">PCC</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-700/20">
                    <td className="px-6 py-4 text-slate-300 text-xs font-mono">
                      {job.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-white text-sm">{job.user}</td>
                    <td className="px-6 py-4 text-slate-300 text-xs">{job.architecture}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                      {(job.processing_time_ms / 1000).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-blue-300 font-mono text-sm">
                      {job.overall_pcc.toFixed(3)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          job.overall_confidence === 'High'
                            ? 'bg-green-500/20 text-green-300'
                            : job.overall_confidence === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {job.overall_confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No jobs found matching your filters
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-slate-400 text-sm">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>
    </AdminLayout>
  );
}
