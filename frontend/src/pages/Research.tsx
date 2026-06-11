import Navbar from "../components/layout/Navbar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Loader, Database, TrendingUp, Shield, Users,
  Brain, Activity, Zap, BarChart2, ChevronRight
} from "lucide-react";

interface ResearchStats {
  total_inferences: number;
  total_users: number;
  data_points_collected: number;
  models_evaluated: number;
  channels_analyzed: number;
  unique_signal_types: number;
}

const architectures = [
  {
    name: "BayesianBiLSTM",
    params: "55K",
    badge: "Best Reconstruction",
    badgeColor: "text-blue-300 bg-blue-500/20 border-blue-500/40",
    highlight: true,
    description: "Bidirectional LSTM with 3 layers, residual connections, and layer normalisation. Achieves best per-channel PCC (0.801 on CS56) with only 55K parameters — 33× fewer than CNN variants.",
    metrics: { pcc: "0.801", ece: "0.622", rmse: "1.011", params: "55,301" },
  },
  {
    name: "BayesianTransformer",
    params: "1.04M",
    badge: "Best Calibration",
    badgeColor: "text-cyan-300 bg-cyan-500/20 border-cyan-500/40",
    description: "Multi-head self-attention with patch tokenisation (patch size 20, 50 tokens/segment). Attains the best uncertainty calibration (ECE = 0.472, PICP@95 = 0.424).",
    metrics: { pcc: "0.461", ece: "0.472", rmse: "1.028", params: "1,043,940" },
  },
  {
    name: "BayesianTCN",
    params: "116K",
    badge: "Fast Inference",
    badgeColor: "text-green-300 bg-green-500/20 border-green-500/40",
    description: "Dilated causal convolutions with exponentially growing receptive field (dilations 2⁰–2⁵). Achieves PCC = 0.722 on CS56 with a fundamentally different approach to BiLSTM.",
    metrics: { pcc: "0.722", ece: "0.643", rmse: "1.006", params: "115,589" },
  },
  {
    name: "BayesianWaveNet",
    params: "575K",
    badge: "Best Val Loss",
    badgeColor: "text-purple-300 bg-purple-500/20 border-purple-500/40",
    description: "Gated dilated convolutions with skip connections. Achieves the best Bayesian validation loss (0.538) and best spectral coherence, capturing high-frequency cardiac microstructure.",
    metrics: { pcc: "0.577", ece: "0.666", rmse: "1.015", params: "575,173" },
  },
  {
    name: "BayesianCNN",
    params: "1.83M",
    badge: "Best RMSE",
    badgeColor: "text-amber-300 bg-amber-500/20 border-amber-500/40",
    description: "Encoder-decoder CNN with MC-Dropout (p=0.3) active at inference. Achieves best aggregate RMSE (1.001) among Bayesian models.",
    metrics: { pcc: "0.059", ece: "0.571", rmse: "1.001", params: "1,825,285" },
  },
  {
    name: "BaselineCNN",
    params: "1.83M",
    badge: "Deterministic",
    badgeColor: "text-slate-300 bg-slate-500/20 border-slate-500/40",
    description: "Same architecture as BayesianCNN with dropout disabled (p=0.0). Provides a deterministic baseline for comparison. No uncertainty estimates.",
    metrics: { pcc: "0.089", ece: "—", rmse: "1.057", params: "1,825,285" },
  },
];

const perChannelPCC = [
  { arch: "BayesianBiLSTM", cs12: "0.761", cs34: "0.506", cs56: "0.801", cs78: "0.104", cs90: "0.003" },
  { arch: "BayesianTCN",    cs12: "0.698", cs34: "0.262", cs56: "0.722", cs78: "0.291", cs90: "0.013" },
  { arch: "BayesianWaveNet",cs12: "0.485", cs34: "0.068", cs56: "0.577", cs78: "0.379", cs90: "0.094" },
  { arch: "BayesianTransf.",cs12: "0.427", cs34: "0.301", cs56: "0.461", cs78: "0.360", cs90: "0.160" },
  { arch: "BayesianCNN",    cs12: "0.192", cs34: "0.349", cs56: "0.213", cs78: "—",     cs90: "0.489" },
];

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-center">
      <div className={`mx-auto mb-3 ${color}`}>{icon}</div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-mono font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function Research() {
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/v1/research/stats")
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container py-10">

        {/* Header */}
        <div className="mb-10">
          <span className="text-label text-accent">BSCS Final Year Project</span>
          <h1 className="text-h1 text-white mt-2 mb-4">CardioBayes-E2E Research</h1>
          <p className="text-body text-slate-300 max-w-3xl">
            A multi-architecture Bayesian deep learning benchmark for uncertainty-aware ECG-to-EGM
            reconstruction. This platform is the live demonstration and data-collection layer of the
            accompanying academic paper currently under review.
          </p>
        </div>

        {/* Live Platform Stats */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader className="w-8 h-8 text-blue-400 animate-spin" /></div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <StatCard icon={<Database className="w-7 h-7 mx-auto" />} label="Total Inferences Run" value={String(stats.total_inferences)} color="text-blue-300" />
            <StatCard icon={<Users className="w-7 h-7 mx-auto" />} label="Active Researchers" value={String(stats.total_users)} color="text-green-300" />
            <StatCard icon={<TrendingUp className="w-7 h-7 mx-auto" />} label="Data Points Processed" value={`${((stats.data_points_collected || 0) / 1_000_000).toFixed(1)}M`} color="text-amber-300" />
          </div>
        ) : null}

        {/* Paper Overview */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-8 mb-12">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-h3 text-white mb-1">About the Paper</h2>
              <p className="text-slate-400 text-sm">Under review · BSCS FYP · Department of Computer Science</p>
            </div>
            <Link to="/docs" className="btn btn-ghost flex items-center gap-2 text-sm shrink-0">
              Read Full Paper <ChevronRight size={15} />
            </Link>
          </div>
          <p className="text-slate-300 leading-relaxed">
            We present <strong className="text-white">CardioBayes-E2E</strong>, the first multi-architecture Bayesian benchmark
            that systematically compares six neural network architectures—spanning convolutional, recurrent,
            temporal convolutional, attention-based, and dilated gated families—for mapping 3-lead surface
            ECG (I, II, V1) to 5-channel coronary sinus EGM (CS12–CS90) with calibrated uncertainty estimates
            via Monte Carlo Dropout. Evaluated on the PhysioNet IAFDB dataset (8 patients, 1000 Hz).
          </p>
        </div>

        {/* Key Findings */}
        <div className="mb-12">
          <h2 className="text-h2 text-white mb-6">Key Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-white font-semibold">Competitive Reconstruction</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                BayesianBiLSTM achieves per-channel PCC = <strong className="text-blue-300">0.801</strong> on CS56
                using only 55K parameters. This is comparable to Banta et al.'s cross-patient PCC of 0.765 (14 patients)
                despite training on just 8 patients.
              </p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-cyan-300" />
                </div>
                <h3 className="text-white font-semibold">Calibrated Uncertainty</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                BayesianTransformer achieves the best calibration (ECE = <strong className="text-cyan-300">0.472</strong>,
                NLL = 22.6). All models exhibit overconfident prediction intervals (PICP@95 = 0.12–0.42),
                attributable to MC-Dropout capturing only epistemic uncertainty.
              </p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-300" />
                </div>
                <h3 className="text-white font-semibold">Clinically Interpretable Uncertainty</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                MC-Dropout uncertainty peaks coincide with cardiac activation complexes at ∼100 ms, ∼400 ms,
                and ∼800 ms — physically consistent with sharp activation wavefronts being the hardest
                events to reconstruct from surface recordings.
              </p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="text-white font-semibold">Cross-Architecture Convergence</h3>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Four fundamentally different families (BiLSTM, TCN, WaveNet, Transformer) independently extract
                genuine ECG-to-EGM signal, ruling out single-model overfitting and confirming the ECG
                contains genuine extractable intracardiac information.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture Cards */}
        <div className="mb-12">
          <h2 className="text-h2 text-white mb-2">Benchmark Architectures</h2>
          <p className="text-body-sm text-slate-400 mb-6">
            Six architectures across five neural network families, all with Monte Carlo Dropout (N=50 passes)
            for uncertainty quantification — except BaselineCNN (deterministic).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {architectures.map((arch) => (
              <div
                key={arch.name}
                className={`rounded-xl border p-5 ${arch.highlight ? "border-blue-500/60 bg-blue-500/5" : "border-slate-700/50 bg-slate-800/30"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-semibold text-sm">{arch.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${arch.badgeColor}`}>
                    {arch.badge}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{arch.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-700/40 pt-3">
                  <div>
                    <p className="text-slate-500 text-xs">Best PCC</p>
                    <p className="text-white font-mono text-sm font-bold">{arch.metrics.pcc}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ECE</p>
                    <p className="text-white font-mono text-sm font-bold">{arch.metrics.ece}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Params</p>
                    <p className="text-white font-mono text-sm font-bold">{arch.params}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Channel PCC Table */}
        <div className="mb-12">
          <h2 className="text-h2 text-white mb-2">Per-Channel PCC Results</h2>
          <p className="text-body-sm text-slate-400 mb-4">
            Best per-channel Pearson Correlation Coefficient across the held-out test patient (iaf8).
            CS56 (mid-catheter) consistently achieves the best reconstruction quality.
          </p>
          <div className="overflow-x-auto bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700/50">
                <tr className="bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-slate-300 font-semibold">Architecture</th>
                  {["CS12","CS34","CS56","CS78","CS90"].map(ch => (
                    <th key={ch} className={`px-4 py-3 text-center font-semibold ${ch === "CS56" ? "text-blue-300" : "text-slate-300"}`}>{ch}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {perChannelPCC.map((row, i) => (
                  <tr key={row.arch} className={i === 0 ? "bg-blue-500/5" : "hover:bg-slate-700/20"}>
                    <td className={`px-4 py-3 font-medium ${i === 0 ? "text-blue-300" : "text-white"}`}>{row.arch}</td>
                    {[row.cs12, row.cs34, row.cs56, row.cs78, row.cs90].map((val, j) => (
                      <td key={j} className={`px-4 py-3 text-center font-mono ${j === 2 && val !== "—" && parseFloat(val) > 0.5 ? "text-blue-300 font-bold" : "text-slate-300"}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 text-xs mt-2">Bold blue values ≥ 0.5 indicate clinically meaningful reconstruction quality.</p>
        </div>

        {/* Methodology */}
        <div className="mb-12">
          <h2 className="text-h2 text-white mb-6">Methodology</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-h5 text-white mb-3">Dataset & Preprocessing</h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li>• <strong>Dataset:</strong> PhysioNet IAFDB — 8 patients undergoing AF catheter ablation</li>
                <li>• <strong>Signal:</strong> 3-lead ECG (I, II, V1) + 5-channel coronary sinus EGM, 1000 Hz</li>
                <li>• <strong>Segmentation:</strong> 1-second windows, 50% overlap</li>
                <li>• <strong>Normalisation:</strong> Per-segment, per-channel z-score</li>
                <li>• <strong>Split:</strong> iaf8 held-out test; iaf1–iaf7 → 85/15 train/val</li>
                <li>• <strong>Augmentation:</strong> Synthetic ECG-EGM pairs (AF 55%, Flutter 15%, Sinus 20%, PVC 10%)</li>
              </ul>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-h5 text-white mb-3">Training & Inference</h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li>• <strong>Loss:</strong> 0.2·MSE + 1.5·(1−PCC) + 0.5·GDL</li>
                <li>• <strong>Optimiser:</strong> AdamW (lr=3×10⁻⁴, weight decay 3×10⁻⁴)</li>
                <li>• <strong>Schedule:</strong> Cosine annealing, gradient clipping at 1.0</li>
                <li>• <strong>Early stopping:</strong> patience 40, max 200 epochs</li>
                <li>• <strong>MC-Dropout:</strong> N=50 stochastic forward passes at inference</li>
                <li>• <strong>Uncertainty:</strong> Epistemic — variance across MC passes</li>
              </ul>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-h5 text-white mb-3">Reconstruction Metrics</h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li>• RMSE, MAE, R² — point estimate quality</li>
                <li>• PCC — morphological correlation</li>
                <li>• SNR (dB) — signal-to-noise ratio</li>
                <li>• Spectral coherence (3–12 Hz) — AF-band accuracy</li>
              </ul>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-h5 text-white mb-3">Uncertainty Metrics</h3>
              <ul className="text-slate-300 text-sm space-y-2">
                <li>• ECE — Expected Calibration Error (lower = better)</li>
                <li>• PICP@95 — Prediction Interval Coverage Probability (target 0.95)</li>
                <li>• MPIW — Mean Prediction Interval Width</li>
                <li>• NLL — Negative Log-Likelihood</li>
                <li>• Sharpness — mean predicted uncertainty</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-h5 text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" /> Privacy Commitments
            </h3>
            <ul className="text-slate-300 text-sm space-y-2">
              <li>• Raw ECG files are processed in-memory only and never stored</li>
              <li>• No identifiable patient information is collected</li>
              <li>• Only computed metrics and interaction metadata are retained</li>
              <li>• Aggregated findings will be released publicly</li>
            </ul>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-h5 text-white mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" /> What We Collect
            </h3>
            <ul className="text-slate-300 text-sm space-y-2">
              <li>• Input file format, duration, sampling rate</li>
              <li>• Model selection and reconstruction metrics (PCC, RMSE, ECE…)</li>
              <li>• User feedback ratings (optional)</li>
              <li>• No raw signal data — metadata only</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-8 text-center">
          <h2 className="text-h3 text-white mb-3">Try the Inference Pipeline</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto text-sm">
            Upload a 3-lead ECG file and run any of the six Bayesian architectures. Results include
            per-channel waveform reconstructions, uncertainty bands, and calibration metrics.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/inference" className="btn btn-primary">
              Run Inference →
            </Link>
            <Link to="/docs" className="btn btn-ghost">
              Read the Paper
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
