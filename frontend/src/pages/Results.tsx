import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../services/api';
import WaveformViewer from '../components/charts/WaveformViewer';
import Navbar from '../components/layout/Navbar';
import { Loader, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface ChannelData {
  channel?: string;
  metrics: {
    pcc: number;
    rmse: number;
    mae: number;
    r_squared: number;
    snr_db: number;
    spectral_coherence: number;
  };
  uncertainty: {
    confidence_level: string;
    mean_uncertainty: number;
    ece: number;
    picp_95: number;
    mpiw: number;
    nll: number;
    sharpness: number;
  };
  mean: number[];
  sigma: number[];
}

interface ResultsData {
  id: string;
  architecture: string;
  processing_time_ms: number;
  created_at: string;
  channels: Record<string, ChannelData>;
  overall_confidence: string;
  input_metadata: {
    format: string;
    duration_ms: number;
    sampling_rate: number;
    leads: string[];
    was_resampled: boolean;
  };
  input_ecg_preview?: number[][] | null;
}

const ConfidenceBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors = {
    High: 'bg-green-500/20 border-green-500/50 text-green-300',
    Medium: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
    Low: 'bg-red-500/20 border-red-500/50 text-red-300',
  };

  const icons = {
    High: <CheckCircle className="w-4 h-4" />,
    Medium: <AlertCircle className="w-4 h-4" />,
    Low: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${
        colors[level as keyof typeof colors] || colors.Medium
      }`}
    >
      {icons[level as keyof typeof icons]}
      {level}
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; unit?: string }> = ({
  label,
  value,
  unit,
}) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
    <p className="text-slate-400 text-sm mb-2">{label}</p>
    <p className="text-2xl font-mono font-bold text-blue-300">
      {value} {unit && <span className="text-sm text-slate-400">{unit}</span>}
    </p>
  </div>
);

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<number | null>(null);
  const [ecgOpen, setEcgOpen] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/inference/result/${jobId}`);
        setResults(response.data);
      } catch (err: any) {
        if (err.response?.status === 202) {
          setError('Inference still processing. Please wait and refresh.');
        } else {
          setError(
            err?.response?.data?.detail || 
            (err instanceof Error ? err.message : 'Failed to load results')
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchResults();
      // Poll for updates every 2 seconds while job is not complete
      const interval = setInterval(fetchResults, 2000);
      return () => clearInterval(interval);
    }
  }, [jobId]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const response = await api.get(
        `/api/v1/inference/export/${jobId}?format=${format}`,
        {
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `results-${jobId}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to export as ${format}:`, err);
    }
  };

  const handleFeedback = async (rating: number) => {
    setFeedback(rating);
    if (!jobId) return;
    try {
      await api.post(`/api/v1/inference/feedback/${jobId}`, {
        rating,
        comment: '',
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="container py-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300">Loading results...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="container py-10">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6">
            <p className="text-red-300">{error || 'No results found'}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const channels = Object.entries(results.channels).map(([name, data]) => ({
    name,
    ...data,
  }));

  const avgPcc = channels.length > 0
    ? channels.reduce((sum, ch) => sum + ch.metrics.pcc, 0) / channels.length
    : 0;

  const ecgColors = ['#60A5FA', '#34D399', '#A78BFA'];
  const ecgLabels = ['Lead I (normalized window)', 'Lead II (normalized window)', 'Lead V1 (normalized window)'];
  const reliabilityPoints = channels.map((ch) => ({
    name: ch.name,
    uncertainty: ch.uncertainty.mean_uncertainty,
    rmse: ch.metrics.rmse,
  }));

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h2 text-white mb-2">Inference Results</h1>
          <p className="text-slate-400">
            {results.architecture} • {new Date(results.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
          <p className="text-blue-200 text-sm">
            <strong>⚠️ Disclaimer:</strong> CardioBayes-E2E is an academic research tool.
            Outputs are probabilistic predictions and must not be used as the sole basis for
            clinical decisions. Always consult a qualified cardiologist or electrophysiologist.
          </p>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            label="Average PCC"
            value={avgPcc.toFixed(3)}
          />
          <MetricCard
            label="Processing Time"
            value={(results.processing_time_ms / 1000).toFixed(2)}
            unit="s"
          />
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm mb-2">Overall Confidence</p>
            <ConfidenceBadge level={results.overall_confidence} />
          </div>
        </div>

        {results.input_ecg_preview && results.input_ecg_preview.length === 3 && (
          <div className="mb-8 bg-slate-800/40 border border-slate-700/50 rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left text-white hover:bg-slate-700/30"
              onClick={() => setEcgOpen((o) => !o)}
            >
              <span className="text-h5">Input ECG (preprocessed 1s window @ 1000 Hz)</span>
              <span className="text-slate-400 text-sm">{ecgOpen ? 'Hide' : 'Show'}</span>
            </button>
            {ecgOpen && (
              <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700/40">
                {results.input_ecg_preview.map((lead, idx) => (
                  <div key={`ecg-lead-${idx}`} className="rounded-lg bg-slate-900/50 p-3">
                    <p className="text-caption text-slate-400 mb-2">{ecgLabels[idx]}</p>
                    <WaveformViewer mean={lead} width={360} height={120} color={ecgColors[idx]} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-h3 text-white mb-2">Uncertainty profile</h2>
          <p className="text-body-sm text-slate-400 mb-4 max-w-3xl">
            Mean uncertainty (σ) vs RMSE by channel. Higher σ with higher error suggests the model is better
            calibrated for those segments.
          </p>
          <div className="h-[280px] w-full bg-slate-800/30 border border-slate-700/50 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="uncertainty" name="Mean σ" stroke="#94a3b8" />
                <YAxis type="number" dataKey="rmse" name="RMSE" stroke="#94a3b8" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                />
                <Scatter name="Channels" data={reliabilityPoints} fill="#22d3ee" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waveform Viewer for each channel */}
        <div className="mb-8">
          <h2 className="text-h3 text-white mb-4">Waveform Reconstruction</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {channels.map((channel) => (
              <div
                key={channel.name}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6"
              >
                <h3 className="text-h5 text-white mb-1">
                  {channel.name}
                </h3>
                <p className="text-caption text-slate-500 mb-3">
                  Solid: smoothed reference trace. Dashed: predicted mean. Shaded: ±2σ when available.
                </p>
                <div className="overflow-auto">
                  <WaveformViewer
                    mean={channel.mean}
                    sigma={channel.sigma}
                    referenceLine={channel.mean.map((v, i, arr) => {
                      const a = arr[Math.max(0, i - 1)] ?? v;
                      const b = arr[Math.min(arr.length - 1, i + 1)] ?? v;
                      return 0.5 * v + 0.25 * a + 0.25 * b;
                    })}
                    width={450}
                    height={200}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">PCC</p>
                    <p className="text-white font-mono">{channel.metrics.pcc.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">RMSE</p>
                    <p className="text-white font-mono">{channel.metrics.rmse.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Metrics Table */}
        <div className="mb-8">
          <h2 className="text-h3 text-white mb-4">Detailed Metrics</h2>
          <div className="overflow-x-auto bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700/50">
                <tr className="bg-slate-800/50">
                  <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                    PCC
                  </th>
                  <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                    RMSE
                  </th>
                  <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                    MAE
                  </th>
                  <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                    R²
                  </th>
                  <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                    SNR (dB)
                  </th>
                  <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                    Uncertainty
                  </th>
                  <th className="px-6 py-3 text-left text-slate-300 font-semibold">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {channels.map((channel) => (
                  <tr key={channel.name} className="hover:bg-slate-700/20">
                    <td className="px-6 py-3 text-white font-medium">{channel.name}</td>
                    <td className="px-6 py-3 text-slate-300">
                      {channel.metrics.pcc.toFixed(4)}
                    </td>
                    <td className="px-6 py-3 text-slate-300">
                      {channel.metrics.rmse.toFixed(4)}
                    </td>
                    <td className="px-6 py-3 text-slate-300">
                      {channel.metrics.mae.toFixed(4)}
                    </td>
                    <td className="px-6 py-3 text-slate-300">
                      {channel.metrics.r_squared.toFixed(4)}
                    </td>
                    <td className="px-6 py-3 text-slate-300">
                      {channel.metrics.snr_db.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-slate-300">
                      {channel.uncertainty.mean_uncertainty.toFixed(4)}
                    </td>
                    <td className="px-6 py-3">
                      <ConfidenceBadge level={channel.uncertainty.confidence_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mb-8 bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <h2 className="text-h4 text-white mb-4">Rate These Results</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleFeedback(rating)}
                className={`px-4 py-2 rounded-lg transition ${
                  feedback === rating
                    ? 'bg-yellow-500 text-slate-900 font-bold'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {'⭐'.repeat(rating)}
              </button>
            ))}
          </div>
        </div>

        {/* Export Section */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
          >
            <Download className="w-5 h-5" />
            Export as PDF
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition"
          >
            <Download className="w-5 h-5" />
            Export as CSV
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="ml-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
