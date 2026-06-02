import { ExternalLink } from "lucide-react";

const DISCLAIMER_TEXT =
  "CardioBayes-E2E is an academic research tool. Outputs are probabilistic predictions and must not be used as the sole basis for clinical decisions. Always consult a qualified cardiologist or electrophysiologist for medical diagnosis and treatment. Do not upload identifiable patient data.";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="brand footer-brand">
            <img src="/logo.svg" alt="CardioBayes" className="brand-logo" />
            <span className="brand-text">CardioBayes</span>
            <sup className="brand-sup">E2E</sup>
          </div>
          <p className="text-body-sm text-secondary">
            Uncertainty-aware cardiac signal intelligence for academic research.
          </p>
          <div className="status-row">
            <span className="status-dot" />
            <span className="text-caption text-secondary">Status: Online (mock)</span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="text-h6">Product</h4>
          <a href="#demo" className="footer-link">Demo</a>
          <a href="#models" className="footer-link">Models</a>
          <a href="#docs" className="footer-link">Documentation</a>
          <a href="#cta" className="footer-link">Start Inference</a>
        </div>

        <div className="footer-col">
          <h4 className="text-h6">Research</h4>
          <a href="#research" className="footer-link">Paper Overview</a>
          <a href="#features" className="footer-link">Key Findings</a>
          <a href="https://physionet.org" className="footer-link" target="_blank" rel="noreferrer">
            PhysioNet Dataset <ExternalLink size={14} />
          </a>
          <a href="#docs" className="footer-link">API Reference</a>
        </div>

        <div className="footer-col">
          <h4 className="text-h6">Legal</h4>
          <p className="text-body-sm text-secondary">{DISCLAIMER_TEXT}</p>
          <a href="https://github.com" className="footer-link" target="_blank" rel="noreferrer">
            GitHub <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="text-caption text-secondary">
          Copyright 2025 CardioBayes-E2E Research Project.
        </p>
      </div>
    </footer>
  );
}
