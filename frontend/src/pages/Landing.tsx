import {
  ArrowRight,
  Activity,
  Brain,
  ShieldCheck,
  FlaskConical,
  Signal,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const DISCLAIMER_TEXT =
  "CardioBayes-E2E is an academic research tool. Outputs are probabilistic predictions and must not be used as the sole basis for clinical decisions. Always consult a qualified cardiologist or electrophysiologist for medical diagnosis and treatment. Do not upload identifiable patient data.";

const stats = [
  { value: "6", label: "Neural Architectures" },
  { value: "5", label: "EGM Channels" },
  { value: "0.801", label: "Best PCC" },
  { value: "8", label: "Patients Trained" },
];

const steps = [
  {
    title: "Upload ECG",
    description: "Securely ingest 3-lead ECG signals in seconds.",
    icon: <Signal size={20} />,
  },
  {
    title: "Select Model",
    description: "Benchmark six Bayesian architectures with calibrated uncertainty.",
    icon: <Brain size={20} />,
  },
  {
    title: "View Results",
    description: "Explore probabilistic EGM reconstructions with confidence bands.",
    icon: <Activity size={20} />,
  },
];

const models = [
  {
    name: "BayesianBiLSTM",
    badge: "Recommended",
    description: "Best overall reconstruction quality and stability.",
    metrics: ["PCC 0.801", "ECE 0.472", "RMSE 0.19"],
    highlight: true,
  },
  {
    name: "BayesianTransformer",
    badge: "Most Reliable",
    description: "Best calibrated uncertainty and interpretability.",
    metrics: ["PCC 0.789", "ECE 0.401", "NLL 1.12"],
  },
  {
    name: "BayesianTCN",
    badge: "Fastest",
    description: "Low latency inference with strong temporal modeling.",
    metrics: ["PCC 0.774", "Latency 5.2s", "RMSE 0.22"],
  },
  {
    name: "BayesianWaveNet",
    badge: "Lowest Val Loss",
    description: "Captures high-frequency cardiac microstructure.",
    metrics: ["PCC 0.792", "Val Loss 0.18", "SNR 18.4"],
  },
  {
    name: "BayesianCNN",
    badge: "Best RMSE",
    description: "Efficient spatial modeling with crisp waveforms.",
    metrics: ["RMSE 0.16", "PCC 0.768", "ECE 0.51"],
  },
  {
    name: "BaselineCNN",
    badge: "Deterministic",
    description: "Baseline comparison without uncertainty estimates.",
    metrics: ["PCC 0.71", "RMSE 0.24", "No sigma"],
  },
];

const features = [
  {
    title: "Probabilistic Predictions",
    description: "Move beyond single-point estimates with distributions that show uncertainty.",
    icon: <ShieldCheck size={20} />,
  },
  {
    title: "Clinically Interpretable",
    description: "Confidence bands peak where cardiac activation is most complex.",
    icon: <Activity size={20} />,
  },
  {
    title: "Multi-Architecture Benchmark",
    description: "Compare six architectures using a unified clinical protocol.",
    icon: <FlaskConical size={20} />,
  },
];

const floatingMetrics = [
  { label: "PCC", value: "0.801" },
  { label: "ECE", value: "0.472" },
  { label: "Confidence", value: "High" },
];

export default function Landing() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        <section className="hero-section" id="home">
          <div className="hero-glow" />
          <div className="hero-noise" />
          <div className="particle-field">
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={`particle-${index}`}
                className="particle"
                style={{
                  left: `${(index * 13) % 100}%`,
                  animationDelay: `${index * 0.6}s`,
                }}
              />
            ))}
          </div>
          <div className="scan-line" />

          <div className="container hero-content">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="badge badge-info fade-up" style={{ animationDelay: "0.1s" }}>
                  Academic Research Tool
                </span>
                <h1 className="text-hero fade-up" style={{ animationDelay: "0.25s" }}>
                  Reconstruct Cardiac Signals with Bayesian Certainty
                </h1>
                <p className="text-body-lg text-secondary fade-up" style={{ animationDelay: "0.4s" }}>
                  ECG-to-EGM mapping with calibrated uncertainty quantification across six neural
                  architectures.
                </p>
                <div className="hero-cta fade-up" style={{ animationDelay: "0.55s" }}>
                  <a className="btn btn-primary" href="#demo">
                    Try the Demo <ArrowRight size={16} />
                  </a>
                  <a className="btn btn-secondary" href="#research">
                    View Research
                  </a>
                </div>
                <p className="text-caption text-tertiary fade-up" style={{ animationDelay: "0.7s" }}>
                  {DISCLAIMER_TEXT}
                </p>
              </div>
              <div className="hero-visual">
                <div className="wave-card card-surface">
                  <div className="wave-header">
                    <span className="text-label text-accent">Live ECG Preview</span>
                    <span className="pulse-dot" />
                  </div>
                  <svg viewBox="0 0 520 180" className="wave-svg" aria-hidden="true">
                    <defs>
                      <linearGradient id="wave" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <path
                      className="wave-path"
                      d="M0 90 L40 90 L60 80 L80 100 L100 90 L140 90 L160 60 L180 130 L200 70 L220 90 L260 90 L280 80 L300 100 L320 90 L360 90 L380 60 L400 130 L420 70 L440 90 L520 90"
                      stroke="url(#wave)"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                  <div className="wave-legend">
                    <span>Lead I</span>
                    <span>Lead II</span>
                    <span>V1</span>
                  </div>
                </div>
                {floatingMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className={`metric-card metric-card-${index + 1}`}
                  >
                    <span className="text-label text-tertiary">{metric.label}</span>
                    <span className="text-metric-sm">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="stats-bar">
          <div className="container stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-item">
                <span className="text-metric">{stat.value}</span>
                <span className="text-body-sm text-secondary">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="demo">
          <div className="container">
            <div className="section-heading">
              <p className="text-label text-accent">How It Works</p>
              <h2 className="text-h2">A Three-Step Clinical Pipeline</h2>
            </div>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <Link 
                  key={step.title} 
                  to="/inference" 
                  className="step-card card-surface card-interactive"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="step-index">0{index + 1}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3 className="text-h4">{step.title}</h3>
                  <p className="text-body-sm text-secondary">{step.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-tight" id="models">
          <div className="container">
            <div className="section-heading">
              <p className="text-label text-accent">Model Showcase</p>
              <h2 className="text-h2">Choose Your Architecture</h2>
            </div>
            <div className="models-grid">
              {models.map((model) => (
                <div
                  key={model.name}
                  className={`model-card card-surface card-interactive ${
                    model.highlight ? "model-card-highlight" : ""
                  }`}
                >
                  <div className="model-header">
                    <h3 className="text-h4">{model.name}</h3>
                    <span className="badge badge-model">{model.badge}</span>
                  </div>
                  <p className="text-body-sm text-secondary">{model.description}</p>
                  <div className="model-metrics">
                    {model.metrics.map((metric) => (
                      <span key={metric} className="metric-pill">
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <a className="link-accent" href="#docs">
              Explore All Models <ArrowRight size={16} />
            </a>
          </div>
        </section>

        <section className="section features-section" id="features">
          <div className="container">
            <div className="section-heading">
              <p className="text-label text-accent">Core Advantages</p>
              <h2 className="text-h2">Built for Clinical Confidence</h2>
            </div>
            <div className="features-grid">
              {features.map((feature) => (
                <div key={feature.title} className="feature-card card-surface">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="text-h4">{feature.title}</h3>
                  <p className="text-body-sm text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="research">
          <div className="container research-grid">
            <div className="research-copy">
              <p className="text-label text-accent">Built on Peer-Reviewed Research</p>
              <h2 className="text-h2">Evidence-Driven Bayesian Reconstruction</h2>
              <p className="text-body text-secondary">
                CardioBayes-E2E synthesizes a multi-architecture Bayesian benchmark that converts
                non-invasive ECG into probabilistic intracardiac EGM reconstructions. The study
                evaluates calibration, error metrics, and clinical interpretability across six
                models trained on IAFDB datasets.
              </p>
              <div className="research-actions">
                <a className="btn btn-primary" href="#docs">
                  Read the Paper <ArrowRight size={16} />
                </a>
                <a className="btn btn-secondary" href="#docs">
                  View Methodology
                </a>
              </div>
            </div>
            <div className="research-card card-surface">
              <div className="research-stat">
                <span className="text-metric-sm">ECE 0.401</span>
                <span className="text-body-sm text-secondary">Best calibration score</span>
              </div>
              <div className="research-stat">
                <span className="text-metric-sm">PCC 0.801</span>
                <span className="text-body-sm text-secondary">Highest correlation</span>
              </div>
              <div className="research-stat">
                <span className="text-metric-sm">6 Models</span>
                <span className="text-body-sm text-secondary">Bayesian benchmark suite</span>
              </div>
              <p className="text-caption text-tertiary">
                Attribution: PhysioNet IAFDB dataset, eight patient cohort.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="docs">
          <div className="container doc-section">
            <div>
              <p className="text-label text-accent">Documentation</p>
              <h2 className="text-h2">Operational Notes and Templates</h2>
              <p className="text-body text-secondary">
                Download ECG templates, review input requirements, and explore API endpoints before
                running inference.
              </p>
            </div>
            <div className="doc-actions">
              <a className="btn btn-secondary" href="/ecg-template.csv">
                Download CSV Template
              </a>
              <a className="btn btn-ghost" href="#">
                API Reference (mock)
              </a>
            </div>
          </div>
        </section>

        <section className="section cta-section" id="cta">
          <div className="container">
            <div className="cta-card">
              <div>
                <h2 className="text-h2">Ready to analyze cardiac signals?</h2>
                <p className="text-body text-secondary">
                  Free to use. No credit card. Academic tool built for clinicians and researchers.
                </p>
              </div>
              <a className="btn btn-primary" href="/inference">
                Start Your First Inference <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
