import Navbar from "../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Star, Zap, TrendingUp, Shield } from "lucide-react";

interface ModelDetails {
  name: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  bayesian: boolean;
  avgPcc: number;
  avgRmse: number;
  avgProcessingTime: number;
  calibration: string;
  uncertainty: boolean;
  strengths: string[];
  useCases: string[];
  architecture: string;
}

const models: ModelDetails[] = [
  {
    name: "BayesianBiLSTM",
    label: "⭐ Recommended",
    icon: Star,
    description: "Best overall performance with excellent uncertainty quantification",
    bayesian: true,
    avgPcc: 0.801,
    avgRmse: 0.0234,
    avgProcessingTime: 8.5,
    calibration: "High",
    uncertainty: true,
    strengths: [
      "Best overall PCC",
      "Excellent uncertainty estimates",
      "Handles sequential patterns well",
      "Well-calibrated predictions",
    ],
    useCases: [
      "General clinical applications",
      "When uncertainty quantification matters",
      "Research and benchmarking",
    ],
    architecture: "Bidirectional LSTM with Bayesian dropout and MC sampling",
  },
  {
    name: "BayesianTransformer",
    label: "🎯 Most Reliable Uncertainty",
    icon: Shield,
    description: "Provides the most reliable confidence intervals and uncertainty bounds",
    bayesian: true,
    avgPcc: 0.789,
    avgRmse: 0.0267,
    avgProcessingTime: 12.3,
    calibration: "Highest",
    uncertainty: true,
    strengths: [
      "Best calibrated uncertainty",
      "Lowest ECE (Expected Calibration Error)",
      "Most reliable confidence intervals",
      "Attention mechanisms for interpretability",
    ],
    useCases: [
      "When reliability of uncertainty is critical",
      "Risk-sensitive applications",
      "Interpretability is important",
    ],
    architecture: "Transformer with multi-head attention and Bayesian inference",
  },
  {
    name: "BayesianTCN",
    label: "⚡ Fastest",
    icon: Zap,
    description: "Highest speed with competitive accuracy and uncertainty",
    bayesian: true,
    avgPcc: 0.774,
    avgRmse: 0.0289,
    avgProcessingTime: 3.2,
    calibration: "Good",
    uncertainty: true,
    strengths: [
      "Fastest inference time",
      "Good accuracy-speed tradeoff",
      "Efficient computation",
      "Suitable for real-time applications",
    ],
    useCases: [
      "Real-time or time-critical inference",
      "Edge deployment",
      "High-throughput scenarios",
      "When latency matters most",
    ],
    architecture: "Temporal Convolutional Network with Bayesian dropout",
  },
  {
    name: "BayesianWaveNet",
    label: "📉 Lowest Validation Loss",
    icon: TrendingUp,
    description: "Achieves lowest validation loss on the training dataset",
    bayesian: true,
    avgPcc: 0.792,
    avgRmse: 0.0247,
    avgProcessingTime: 10.1,
    calibration: "Good",
    uncertainty: true,
    strengths: [
      "Lowest validation loss",
      "Excellent on training distribution",
      "Fast convergence",
      "Dilated convolutions for context",
    ],
    useCases: [
      "Similar signals to training data",
      "Batch processing",
      "Research on WaveNet variants",
    ],
    architecture: "WaveNet with dilated causal convolutions and Bayesian inference",
  },
  {
    name: "BayesianCNN",
    label: "📊 Best RMSE",
    icon: TrendingUp,
    description: "Lowest mean squared error among all models",
    bayesian: true,
    avgPcc: 0.768,
    avgRmse: 0.0214,
    avgProcessingTime: 4.8,
    calibration: "Moderate",
    uncertainty: true,
    strengths: [
      "Best RMSE performance",
      "Fast and efficient",
      "Simple architecture",
      "Good for signal reconstruction",
    ],
    useCases: [
      "When RMSE is the primary metric",
      "Lightweight deployments",
      "Signal reconstruction tasks",
    ],
    architecture: "Convolutional Neural Network with Bayesian dropout",
  },
  {
    name: "BaselineCNN",
    label: "🔲 Deterministic Baseline",
    icon: TrendingUp,
    description: "Deterministic CNN without uncertainty quantification",
    bayesian: false,
    avgPcc: 0.71,
    avgRmse: 0.0342,
    avgProcessingTime: 2.1,
    calibration: "N/A",
    uncertainty: false,
    strengths: [
      "Fastest inference",
      "Simplest model",
      "Good baseline comparison",
      "Minimal memory usage",
    ],
    useCases: [
      "Baseline comparison",
      "When uncertainty is not needed",
      "Constrained environments",
    ],
    architecture: "Standard CNN without Bayesian components",
  },
];

const ModelCard: React.FC<{ model: ModelDetails; onSelect: () => void }> = ({
  model,
  onSelect,
}) => {
  const IconComponent = model.icon;
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-blue-500/30 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <IconComponent className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-h4 text-white">{model.name}</h3>
            <p className="text-xs text-blue-300 font-medium">{model.label}</p>
          </div>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4">{model.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-slate-700/30 p-3 rounded">
          <p className="text-slate-400 text-xs">Avg PCC</p>
          <p className="text-blue-300 font-mono font-bold">{model.avgPcc.toFixed(3)}</p>
        </div>
        <div className="bg-slate-700/30 p-3 rounded">
          <p className="text-slate-400 text-xs">Processing</p>
          <p className="text-blue-300 font-mono font-bold">{model.avgProcessingTime.toFixed(1)}s</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2 font-medium">Architecture Type</p>
        <p className="text-xs text-slate-300">{model.architecture}</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {model.bayesian && (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
            Bayesian
          </span>
        )}
        {model.uncertainty && (
          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-500/30">
            Uncertainty
          </span>
        )}
      </div>

      <button
        onClick={onSelect}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium text-sm transition"
      >
        Try This Model →
      </button>
    </div>
  );
};

export default function Models() {
  const navigate = useNavigate();

  const comparisonData = models.map((m) => ({
    name: m.name.replace("Bayesian", "").replace("Baseline", "").slice(0, 8),
    PCC: (m.avgPcc * 100).toFixed(0),
    Speed: (10 - m.avgProcessingTime),
    RMSE: 10 - Math.round(m.avgRmse * 1000),
  }));

  const radarData = models.map((m) => ({
    model: m.name,
    PCC: m.avgPcc * 100,
    Speed: Math.round((1 / m.avgProcessingTime) * 100),
    Calibration: m.calibration === "Highest" ? 100 : m.calibration === "High" ? 80 : 60,
    Efficiency: 100 - (m.avgProcessingTime / 12.3) * 100,
  }));

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container py-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-h2 text-white mb-3">Six Architectures. One Benchmark.</h1>
          <p className="text-body text-slate-300 max-w-2xl">
            CardioBayes-E2E provides six state-of-the-art models for ECG-to-EGM
            reconstruction. Choose based on your priorities: accuracy, speed, or uncertainty
            reliability.
          </p>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {models.map((model) => (
            <ModelCard
              key={model.name}
              model={model}
              onSelect={() => navigate("/inference", { state: { selectedModel: model.name } })}
            />
          ))}
        </div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Bar Chart Comparison */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-h4 text-white mb-4">Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                />
                <Legend />
                <Bar dataKey="PCC" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Speed" fill="#22C55E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
            <h3 className="text-h4 text-white mb-4">Multi-Dimensional Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="model" stroke="#94a3b8" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                <Radar
                  name="BayesianBiLSTM"
                  dataKey="PCC"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
                <Radar
                  name="Speed"
                  dataKey="Speed"
                  stroke="#22C55E"
                  fill="#22C55E"
                  fillOpacity={0.1}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Model</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Avg PCC</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">Avg RMSE</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Processing (s)
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Uncertainty
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-semibold">
                    Calibration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {models.map((model) => (
                  <tr key={model.name} className="hover:bg-slate-700/20">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{model.name}</p>
                        <p className="text-slate-400 text-xs">{model.label}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-blue-300 font-mono">
                      {model.avgPcc.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-blue-300 font-mono">
                      {model.avgRmse.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-blue-300 font-mono">
                      {model.avgProcessingTime.toFixed(1)}
                    </td>
                    <td className="px-6 py-4">
                      {model.uncertainty ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-500/30">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-500/20 text-slate-300 rounded text-xs border border-slate-500/30">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{model.calibration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selection Guide */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-8">
          <h3 className="text-h3 text-white mb-6">Choosing the Right Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-h5 text-blue-300 mb-3">For Maximum Accuracy</h4>
              <p className="text-slate-300 text-sm">
                Use <strong>BayesianBiLSTM</strong> for the best PCC and overall performance
                across diverse signal types.
              </p>
            </div>
            <div>
              <h4 className="text-h5 text-green-300 mb-3">For Real-Time Performance</h4>
              <p className="text-slate-300 text-sm">
                Choose <strong>BayesianTCN</strong> for the fastest inference while maintaining
                Bayesian uncertainty quantification.
              </p>
            </div>
            <div>
              <h4 className="text-h5 text-amber-300 mb-3">For Reliable Uncertainty</h4>
              <p className="text-slate-300 text-sm">
                Pick <strong>BayesianTransformer</strong> when confidence intervals must be
                well-calibrated and trustworthy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
