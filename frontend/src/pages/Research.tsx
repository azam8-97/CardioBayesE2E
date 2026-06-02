import Navbar from "../components/layout/Navbar";
import { useEffect, useState } from "react";
import { apiClient } from "../services/api";
import { Loader, Database, TrendingUp, Shield, BookOpen, Users } from "lucide-react";

interface ResearchStats {
  total_inferences: number;
  total_users: number;
  data_points_collected: number;
  models_evaluated: number;
  channels_analyzed: number;
  unique_signal_types: number;
}

export default function Research() {
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/api/v1/research/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Failed to load research stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container py-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-h1 text-white mb-4">Research & Data Collection</h1>
          <p className="text-body text-slate-300 max-w-3xl">
            CardioBayes-E2E is not just a tool—it's a living research platform that advances
            the field of cardiac signal processing. Every inference you run contributes valuable
            data to our academic research program.
          </p>
        </div>

        {/* Research Stats */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-center">
              <Database className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-2">Total Inferences</p>
              <p className="text-3xl font-mono font-bold text-blue-300">{stats.total_inferences}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-2">Active Researchers</p>
              <p className="text-3xl font-mono font-bold text-green-300">{stats.total_users}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 text-center">
              <TrendingUp className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-2">Data Points Analyzed</p>
              <p className="text-3xl font-mono font-bold text-amber-300">
                {(stats.data_points_collected / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        ) : null}

        {/* Research Overview */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-8 mb-12">
          <h2 className="text-h2 text-white mb-4">Project Overview</h2>
          <p className="text-slate-300 text-lg leading-relaxed">
            CardioBayes-E2E synthesizes a multi-architecture Bayesian benchmark that converts
            non-invasive 3-lead surface ECG signals into probabilistic intracardiac EGM
            reconstructions with calibrated uncertainty estimates. This is the first publicly
            accessible tool enabling comparison of six state-of-the-art architectures on
            real-world data.
          </p>
        </div>

        {/* What We Collect */}
        <div className="mb-12">
          <h2 className="text-h2 text-white mb-6">What We Collect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-white mb-3 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-400" />
                Signal Characteristics
              </h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Input file format (CSV, MAT, EDF)</li>
                <li>• Signal duration and sampling rate</li>
                <li>• Lead configuration and counts</li>
                <li>• Preprocessing applied</li>
                <li>• Resampling information</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Model Performance Metrics
              </h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Reconstruction quality (PCC, RMSE, MAE, R²)</li>
                <li>• Uncertainty estimates (mean σ, ECE, PICP)</li>
                <li>• Processing time per architecture</li>
                <li>• Per-channel performance breakdown</li>
                <li>• Confidence calibration metrics</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-white mb-3 flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-400" />
                User Interaction Data
              </h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• Model selection preferences</li>
                <li>• User feedback ratings (1-5 stars)</li>
                <li>• Preferred confidence thresholds</li>
                <li>• Export format choices</li>
                <li>• User research consent status</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-white mb-3 flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-400" />
                Privacy Commitments
              </h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li>• NO raw ECG data stored permanently</li>
                <li>• NO identifiable patient information</li>
                <li>• Metadata only, processed in-memory</li>
                <li>• User consent required for research use</li>
                <li>• Transparent data practices</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Research Value */}
        <div className="mb-12">
          <h2 className="text-h2 text-white mb-6">Why This Matters</h2>
          <div className="space-y-4">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-blue-300 mb-2">🔬 Beyond Laboratory Conditions</h3>
              <p className="text-slate-300">
                Original model training used only 8 IAFDB patients. Your inferences provide
                real-world validation on diverse signal types, enabling us to understand model
                generalization beyond the training distribution.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-green-300 mb-2">📊 Uncertainty Calibration Research</h3>
              <p className="text-slate-300">
                We can now measure how well each model's uncertainty estimates match true error
                rates on real data. This is impossible with a single laboratory dataset. Your
                data directly advances Bayesian deep learning research.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-amber-300 mb-2">🏆 Failure Mode Analysis</h3>
              <p className="text-slate-300">
                By collecting metadata about failed inferences and signal characteristics, we
                identify which ECG patterns cause model difficulty. This informs next-generation
                architectures.
              </p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-purple-300 mb-2">📈 Performance Trends</h3>
              <p className="text-slate-300">
                Aggregated statistics reveal which models users find most useful, which formats
                are problematic, and where computational limits are hit. This shapes feature
                development.
              </p>
            </div>
          </div>
        </div>

        {/* Research Commitments */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 mb-12">
          <h2 className="text-h2 text-white mb-4">Our Commitments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-h4 text-green-300 mb-2">✓ Transparency</h3>
              <p className="text-slate-300 text-sm">
                All data collection is disclosed. You opt-in to research use at registration.
                You can withdraw at any time.
              </p>
            </div>
            <div>
              <h3 className="text-h4 text-green-300 mb-2">✓ Privacy by Design</h3>
              <p className="text-slate-300 text-sm">
                Raw ECG files are never stored. Only computed metrics and metadata are
                preserved. No identifiable information is collected.
              </p>
            </div>
            <div>
              <h3 className="text-h4 text-green-300 mb-2">✓ Academic Value</h3>
              <p className="text-slate-300 text-sm">
                Findings will be published in peer-reviewed venues. You'll be credited as
                research contributor if you opt in.
              </p>
            </div>
            <div>
              <h3 className="text-h4 text-green-300 mb-2">✓ Open Science</h3>
              <p className="text-slate-300 text-sm">
                Aggregated research datasets and findings will be released publicly to benefit
                the entire cardiac signal processing community.
              </p>
            </div>
          </div>
        </div>

        {/* Data Usage Agreement */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 mb-12">
          <h2 className="text-h2 text-white mb-4">Research Data Usage Agreement</h2>
          <div className="bg-slate-900/50 rounded-lg p-6 text-slate-300 text-sm leading-relaxed">
            <p className="mb-4">
              <strong>By using CardioBayes-E2E, you agree that:</strong>
            </p>
            <ul className="space-y-3 mb-6">
              <li>
                ✓ Your uploaded signal metadata, model outputs, and interaction data may be
                used for academic research
              </li>
              <li>✓ You will NOT upload identifiable patient data</li>
              <li>
                ✓ Raw ECG files are processed in-memory only and are not permanently stored
              </li>
              <li>
                ✓ Your research contributions may be acknowledged in academic publications
              </li>
              <li>✓ Aggregated findings will be released publicly</li>
            </ul>

            <p className="text-amber-300 font-medium">
              💡 Medical Disclaimer: CardioBayes-E2E is an academic research tool. Outputs are
              probabilistic predictions and must not be used as the sole basis for clinical
              decisions. Always consult a qualified cardiologist or electrophysiologist for
              medical diagnosis and treatment.
            </p>
          </div>
        </div>

        {/* Publications & Citations */}
        <div className="mb-12">
          <h2 className="text-h2 text-white mb-6">Publications & Resources</h2>
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-white flex items-center gap-2 mb-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                Primary Research
              </h3>
              <p className="text-slate-300 text-sm mb-3">
                CardioBayes-E2E: A Multi-Architecture Bayesian Benchmark for ECG-to-EGM
                Reconstruction with Uncertainty Quantification
              </p>
              <p className="text-slate-400 text-sm">
                Status: Manuscript in preparation. Expected submission: 2026 Q2
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-h4 text-white flex items-center gap-2 mb-2">
                <BookOpen className="w-6 h-6 text-green-400" />
                Datasets & Code
              </h3>
              <p className="text-slate-300 text-sm mb-3">
                All models, training code, and aggregated research datasets will be released on
                GitHub under open-source licenses (MIT license).
              </p>
              <p className="text-slate-400 text-sm">
                Repository: github.com/CardioBayes/CardioBayes-E2E (coming soon)
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-8 text-center">
          <h2 className="text-h3 text-white mb-3">Contribute to Cardiac Signal Research</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Every inference you run advances Bayesian deep learning and cardiac signal
            processing. Your data—treated with complete privacy—helps build the next generation
            of AI-powered cardiac diagnostics.
          </p>
          <a
            href="/inference"
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
          >
            Start an Inference & Contribute →
          </a>
        </div>
      </main>
    </div>
  );
}
