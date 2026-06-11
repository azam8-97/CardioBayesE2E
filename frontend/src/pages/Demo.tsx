import { ArrowRight, Signal, Brain, Activity, Upload, FileText, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

const steps = [
  {
    index: "01",
    icon: <Upload size={22} />,
    title: "Upload ECG",
    description:
      "Securely ingest 3-lead ECG signals in CSV, EDF, WFDB (.zip), or MATLAB formats. The pipeline validates, resamples if needed, and segments your recording automatically.",
    detail: "Supported: .csv, .edf, .mat, .zip (WFDB)",
  },
  {
    index: "02",
    icon: <Brain size={22} />,
    title: "Select a Model",
    description:
      "Choose from six Bayesian architectures. Each runs MC-Dropout with N=50 stochastic forward passes to produce calibrated mean reconstructions and uncertainty bands.",
    detail: "BiLSTM · Transformer · TCN · WaveNet · CNN · BaselineCNN",
  },
  {
    index: "03",
    icon: <Activity size={22} />,
    title: "Explore Results",
    description:
      "View per-channel EGM reconstructions (CS12–CS90) with σ confidence envelopes, PCC/RMSE/ECE metrics, and a confidence badge. Export as CSV or PDF.",
    detail: "Channels: CS12, CS34, CS56, CS78, CS90",
  },
];

const models = [
  {
    name: "BayesianBiLSTM",
    badge: "Recommended",
    description: "Best overall reconstruction quality and stability across all five EGM channels.",
    metrics: ["PCC 0.801", "ECE 0.472", "RMSE 0.19"],
    highlight: true,
  },
  {
    name: "BayesianTransformer",
    badge: "Best Calibration",
    description: "Lowest expected calibration error — most reliable uncertainty estimates.",
    metrics: ["PCC 0.789", "ECE 0.401", "NLL 1.12"],
  },
  {
    name: "BayesianTCN",
    badge: "Fastest",
    description: "Temporal Convolutional Network with low latency and strong sequential modeling.",
    metrics: ["PCC 0.774", "Latency 5.2s", "RMSE 0.22"],
  },
  {
    name: "BayesianWaveNet",
    badge: "Lowest Val Loss",
    description: "Captures high-frequency cardiac microstructure through dilated convolutions.",
    metrics: ["PCC 0.792", "Val Loss 0.18", "SNR 18.4"],
  },
  {
    name: "BayesianCNN",
    badge: "Best RMSE",
    description: "Efficient spatial feature extraction with the sharpest waveform boundaries.",
    metrics: ["RMSE 0.16", "PCC 0.768", "ECE 0.51"],
  },
  {
    name: "BaselineCNN",
    badge: "Deterministic",
    description: "Point-estimate baseline — no uncertainty bands. Use for speed comparison.",
    metrics: ["PCC 0.71", "RMSE 0.24", "No sigma"],
  },
];

const formats = [
  {
    icon: <FileText size={18} />,
    ext: ".csv",
    label: "CSV",
    note: "3 columns: lead_I, lead_II, V1 at any sample rate",
  },
  {
    icon: <Signal size={18} />,
    ext: ".edf",
    label: "EDF / EDF+",
    note: "European Data Format — auto channel detection",
  },
  {
    icon: <Zap size={18} />,
    ext: ".zip",
    label: "WFDB ZIP",
    note: "ZIP containing a .hea + .dat pair",
  },
  {
    icon: <FileText size={18} />,
    ext: ".mat",
    label: "MATLAB",
    note: "HDF5 or v5 .mat with signal arrays",
  },
];

export default function Demo() {
  return (
    <div className="page-shell">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="section" style={{ paddingTop: "5rem", paddingBottom: "3rem" }}>
          <div className="container">
            <div className="section-heading">
              <p className="text-label text-accent">Interactive Demo</p>
              <h1 className="text-h2">A Three-Step Clinical Pipeline</h1>
              <p className="text-body text-secondary" style={{ maxWidth: "52ch", margin: "0 auto" }}>
                Upload a 3-lead ECG, pick a Bayesian architecture, and receive probabilistic
                intracardiac EGM reconstructions with calibrated confidence bands — in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="section section-light">
          <div className="container">
            <div className="section-heading">
              <p className="text-label text-accent">How It Works</p>
              <h2 className="text-h2">Three Steps to Reconstruction</h2>
            </div>
            <div className="steps-grid">
              {steps.map((step) => (
                <div key={step.index} className="step-card card-surface">
                  <div className="step-index">{step.index}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3 className="text-h4">{step.title}</h3>
                  <p className="text-body-sm text-secondary">{step.description}</p>
                  <p className="text-caption text-tertiary" style={{ marginTop: "0.75rem" }}>
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link className="btn btn-primary" to="/inference">
                Start Inference <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="section-tight">
          <div className="container">
            <div className="section-heading">
              <p className="text-label text-accent">Input Formats</p>
              <h2 className="text-h2">What You Can Upload</h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              {formats.map((f) => (
                <div key={f.ext} className="card-surface" style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span className="text-accent">{f.icon}</span>
                    <span className="text-h4" style={{ fontSize: "0.95rem" }}>{f.label}</span>
                    <span className="metric-pill" style={{ marginLeft: "auto" }}>{f.ext}</span>
                  </div>
                  <p className="text-caption text-secondary">{f.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Model Showcase */}
        <section className="section section-light">
          <div className="container">
            <div className="section-heading">
              <p className="text-label text-accent">Model Showcase</p>
              <h2 className="text-h2">Choose Your Architecture</h2>
              <p className="text-body text-secondary" style={{ maxWidth: "52ch", margin: "0 auto" }}>
                All Bayesian models use MC-Dropout (N=50 passes). Results are evaluated on an
                eight-patient IAFDB cohort; BayesianBiLSTM leads in overall PCC.
              </p>
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
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link className="link-accent" to="/models">
                Detailed Model Comparison <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section cta-section">
          <div className="container">
            <div className="cta-card">
              <div>
                <h2 className="text-h2">Ready to run inference?</h2>
                <p className="text-body text-secondary">
                  Upload your ECG now — no special hardware required.
                </p>
              </div>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link className="btn btn-primary" to="/inference">
                  Run Inference <ArrowRight size={16} />
                </Link>
                <Link className="btn btn-secondary" to="/research">
                  Read the Paper
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
