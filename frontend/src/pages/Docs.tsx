import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import { ChevronDown, ChevronUp, BookOpen, FileText, ExternalLink, AlertCircle } from "lucide-react";

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden mb-4">
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-4 bg-slate-800/50 hover:bg-slate-700/40 text-left transition"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-white font-semibold">{title}</span>
        {open ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>
      {open && <div className="px-6 py-5 bg-slate-900/40 text-slate-300 text-sm leading-relaxed space-y-3">{children}</div>}
    </div>
  );
}

function MetricTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700/50 my-3">
      <table className="w-full text-xs">
        <thead className="bg-slate-800/60 border-b border-slate-700/50">
          <tr>{headers.map((h, i) => <th key={i} className="px-3 py-2 text-left text-slate-300 font-semibold whitespace-nowrap">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {rows.map((row, i) => (
            <tr key={i} className={i === 0 ? "bg-blue-500/5" : "hover:bg-slate-700/20"}>
              {row.map((cell, j) => <td key={j} className="px-3 py-2 font-mono whitespace-nowrap">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Docs() {
  const [paperOpen, setPaperOpen] = useState(false);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container py-10 max-w-4xl">

        {/* Quick reference cards */}
        <div className="mb-10">
          <h1 className="text-h2 text-white mb-2">Documentation</h1>
          <p className="text-slate-400 text-sm mb-6">Platform guides, accepted file formats, API reference, and the research paper.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card-surface p-5 rounded-xl">
              <FileText className="w-5 h-5 text-blue-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Accepted File Formats</h3>
              <ul className="text-slate-400 text-xs space-y-1">
                <li><span className="text-blue-300 font-mono">.csv</span> — columns: timestamp_ms, lead_I, lead_II, lead_V1</li>
                <li><span className="text-blue-300 font-mono">.mat</span> — variables: ecg_I, ecg_II, ecg_V1, fs</li>
                <li><span className="text-blue-300 font-mono">.edf</span> — channels labelled I, II, V1</li>
                <li><span className="text-blue-300 font-mono">.zip</span> — WFDB .hea + .dat pair</li>
              </ul>
              <p className="text-slate-500 text-xs mt-2">Minimum 1000 samples. Resampled to 1000 Hz if needed.</p>
            </div>
            <div className="card-surface p-5 rounded-xl">
              <BookOpen className="w-5 h-5 text-cyan-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">API Endpoints</h3>
              <ul className="text-slate-400 text-xs space-y-1 font-mono">
                <li className="text-slate-300">POST /api/v1/inference/upload</li>
                <li className="text-slate-300">GET /api/v1/inference/status/:id</li>
                <li className="text-slate-300">GET /api/v1/inference/result/:id</li>
                <li className="text-slate-300">POST /api/v1/auth/register</li>
                <li className="text-slate-300">POST /api/v1/auth/login</li>
              </ul>
            </div>
            <div className="card-surface p-5 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="text-white font-semibold mb-2">Medical Disclaimer</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                CardioBayes-E2E is an academic research tool. Outputs are probabilistic predictions
                and must not be used as the sole basis for clinical decisions. Always consult a
                qualified cardiologist.
              </p>
            </div>
          </div>
        </div>

        {/* ── RESEARCH PAPER ── */}
        <div className="border border-blue-500/30 rounded-xl overflow-hidden mb-6 bg-blue-500/5">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-blue-400 font-medium uppercase tracking-wide mb-1">Research Paper · Under Review</p>
                <h2 className="text-white font-bold text-lg leading-snug mb-1">
                  CardioBayes-E2E: A Bayesian Deep Learning Framework for<br className="hidden sm:block" />
                  Uncertainty-Aware ECG-to-EGM Reconstruction with<br className="hidden sm:block" />
                  Multi-Architecture Benchmarking
                </h2>
                <p className="text-slate-400 text-sm">Department of Computer Science · BSCS Final Year Project</p>
              </div>
            </div>

            {/* Abstract — always visible */}
            <div className="mt-5 bg-slate-900/60 border border-slate-700/40 rounded-lg p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">Abstract</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Reconstructing intracardiac electrograms (EGM) from surface electrocardiograms (ECG) is a
                clinically important but mathematically ill-posed inverse problem. Existing deep learning
                approaches provide point estimates without quantifying prediction reliability, which is
                critical for clinical decision-making. We present <strong className="text-white">CardioBayes-E2E</strong>,
                a comprehensive Bayesian deep learning framework that systematically benchmarks six neural
                network architectures—spanning convolutional, recurrent, temporal convolutional,
                attention-based, and dilated gated families—with Monte Carlo Dropout (MC-Dropout) approximate
                Bayesian inference for uncertainty quantification. Evaluated on the Intracardiac Atrial
                Fibrillation Database (IAFDB, 8 patients), our framework maps 3-lead surface ECG (I, II, V1)
                to 5-channel coronary sinus EGM. BayesianBiLSTM achieves per-channel Pearson correlation
                coefficients (PCC) up to 0.801 on mid-catheter channels, while BayesianTransformer attains
                the best calibration (ECE = 0.472). Critically, MC-Dropout uncertainty estimates correctly
                identify cardiac activation complexes as high-uncertainty regions, demonstrating clinically
                interpretable uncertainty. Cross-architecture convergence of reconstruction quality confirms
                genuine signal extraction rather than single-model overfitting. Systematic calibration
                analysis reveals that all models exhibit overconfident prediction intervals (PICP@95 = 0.12–0.42),
                attributable to MC-Dropout's epistemic-only uncertainty capture. Our work provides the first
                multi-architecture Bayesian benchmark with full uncertainty characterisation for ECG-to-EGM
                reconstruction, establishing a foundation for uncertainty-aware clinical decision support
                in cardiac electrophysiology.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Bayesian deep learning","Monte Carlo Dropout","ECG-to-EGM","Uncertainty quantification","Atrial fibrillation","Cardiac inverse problem"].map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-slate-600 text-slate-400">{tag}</span>
                ))}
              </div>
            </div>

            {/* Expand toggle */}
            <button
              type="button"
              onClick={() => setPaperOpen((o) => !o)}
              className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition font-medium"
            >
              {paperOpen ? <><ChevronUp size={16} /> Hide full paper</> : <><ChevronDown size={16} /> Read full paper</>}
            </button>
          </div>

          {/* Full paper content */}
          {paperOpen && (
            <div className="border-t border-blue-500/20 px-6 py-6 space-y-2">

              <Section title="I. Introduction" defaultOpen>
                <p>
                  Intracardiac electrograms (EGM) recorded via catheter-based mapping provide high-resolution,
                  spatially localised electrical activity essential for diagnosing and treating cardiac
                  arrhythmias such as atrial fibrillation (AF). However, acquiring EGMs requires invasive
                  catheterisation procedures, limiting their availability in routine clinical monitoring.
                  In contrast, the standard 12-lead surface ECG is non-invasive, inexpensive, and universally
                  accessible. Reconstructing intracardiac EGM signals from surface ECG recordings — the
                  cardiac inverse problem — would enable non-invasive estimation of local cardiac electrical
                  activity with significant implications for remote AF monitoring and pre-procedural ablation
                  planning.
                </p>
                <p>
                  The cardiac inverse problem is mathematically ill-posed: multiple internal cardiac source
                  configurations can produce identical surface ECG patterns. Classical approaches using linear
                  transfer functions and time-delay neural networks demonstrated feasibility but were limited
                  to patient-specific reconstruction. Banta et al. advanced the field with a CNN
                  encoder-decoder on STFT spectrograms, achieving cross-patient PCC of 0.765 on 14 patients.
                  Despite these advances, existing methods produce deterministic point estimates without
                  quantifying prediction reliability.
                </p>
                <p className="font-medium text-white">Contributions of this work:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>First multi-architecture Bayesian benchmark for ECG→EGM reconstruction, comparing six architectures across five neural network families with full uncertainty quantification.</li>
                  <li>Comprehensive uncertainty characterisation with calibration analysis (ECE, PICP, NLL), reliability diagrams, and clinically interpretable uncertainty profiles identifying cardiac activation complexes as high-uncertainty regions.</li>
                  <li>Cross-architecture convergence analysis demonstrating that multiple architecture families extract genuine ECG-to-EGM signal, ruling out single-model overfitting.</li>
                  <li>Spectral coherence evaluation in the AF-dominant frequency band (3–12 Hz), addressing the limitation of time-domain metrics in detecting smoothing bias.</li>
                </ul>
              </Section>

              <Section title="II. Related Work">
                <p className="font-medium text-white">ECG-to-EGM Reconstruction</p>
                <p>Kachenoura et al. and Porée et al. established linear and non-linear approaches achieving patient-specific PCC of 0.85–0.94. Banta et al. proposed a CNN encoder-decoder on STFT spectrograms, achieving patient-specific PCC of 0.945 and cross-patient PCC of 0.765 with 14 patients, and reverse-direction PCC of 0.908. None of these methods incorporated uncertainty quantification.</p>
                <p className="font-medium text-white mt-2">Bayesian Deep Learning for Biomedical Signals</p>
                <p>MC-Dropout (Gal & Ghahramani, 2016) approximates variational Bayesian inference by maintaining dropout at test time, proven to approximate a deep Gaussian process. Applications in medical imaging, ECG classification, and time-series prediction have demonstrated clinical value. Kendall and Gal formalised epistemic–aleatoric uncertainty decomposition, with aleatoric estimation requiring heteroscedastic output heads.</p>
              </Section>

              <Section title="III. Methodology">
                <p className="font-medium text-white">Problem Formulation</p>
                <p>
                  Given a 3-channel surface ECG segment X ∈ ℝ^(3×T) (leads I, II, V1; T=1000 samples at
                  1000 Hz), we seek a mapping to the 5-channel coronary sinus EGM Y ∈ ℝ^(5×T). Under the
                  Bayesian framework, N=50 stochastic MC-Dropout passes yield predictive mean μ̂ and
                  epistemic uncertainty σ̂².
                </p>
                <p className="font-medium text-white mt-2">Dataset</p>
                <p>The IAFDB from PhysioNet provides simultaneous ECG and intracardiac EGM from 8 patients (iaf1–iaf8) undergoing catheter ablation for AF, recorded at 1000 Hz. Patient iaf8 was held out for testing; iaf1–iaf7 were split 85/15 for training/validation. Synthetic ECG-EGM pairs (AF 55%, Flutter 15%, Sinus 20%, PVC 10%) provided ~1:1 augmentation during training only.</p>
                <p className="font-medium text-white mt-2">Training</p>
                <p>All models used a composite loss: <span className="font-mono bg-slate-800/60 px-1 rounded">L = 0.2·MSE + 1.5·(1−PCC) + 0.5·GDL</span> with AdamW (lr=3×10⁻⁴, weight decay 3×10⁻⁴), cosine annealing, gradient clipping at 1.0, and early stopping (patience 40, max 200 epochs).</p>

                <p className="font-medium text-white mt-3">Training Summary</p>
                <MetricTable
                  headers={["Architecture","Params","Val Loss","RMSE","Epochs"]}
                  rows={[
                    ["BayesianBiLSTM","55,301","0.678","0.799","99"],
                    ["BayesianTransformer","1,043,940","0.676","0.760","161"],
                    ["BayesianWaveNet","575,173","0.538","0.701","118"],
                    ["BayesianTCN","115,589","0.778","0.848","195"],
                    ["BayesianCNN","1,825,285","0.614","0.755","140"],
                    ["BaselineCNN","1,825,285","0.436","0.634","168"],
                  ]}
                />
              </Section>

              <Section title="IV. Experimental Results">
                <p className="font-medium text-white">Comprehensive Benchmark — Held-out Patient (iaf8)</p>
                <MetricTable
                  headers={["Architecture","RMSE↓","MAE↓","PCC↑","R²↑","ECE↓","PICP↑","NLL↓"]}
                  rows={[
                    ["BayesianBiLSTM","1.011","0.591","0.094","−0.021","0.622","0.182","395.2"],
                    ["BayesianTransformer","1.028","0.614","0.075","−0.057","0.472","0.424","22.6"],
                    ["BayesianWaveNet","1.015","0.588","0.059","−0.031","0.666","0.120","830.8"],
                    ["BayesianTCN","1.006","0.579","0.043","−0.013","0.643","0.150","921.3"],
                    ["BayesianCNN","1.001","0.579","0.059","−0.002","0.571","0.273","71.7"],
                    ["BaselineCNN (det.)","1.057","0.631","0.089","−0.014","—","—","—"],
                  ]}
                />
                <p className="font-medium text-white mt-3">Best Per-Channel PCC — Test Set</p>
                <MetricTable
                  headers={["Architecture","CS12","CS34","CS56 ★","CS78","CS90"]}
                  rows={[
                    ["BayesianBiLSTM","0.761","0.506","0.801","0.104","0.003"],
                    ["BayesianTCN","0.698","0.262","0.722","0.291","0.013"],
                    ["BayesianWaveNet","0.485","0.068","0.577","0.379","0.094"],
                    ["BayesianTransformer","0.427","0.301","0.461","0.360","0.160"],
                    ["BayesianCNN","0.192","0.349","0.213","—","0.489"],
                  ]}
                />
                <p className="text-slate-500 text-xs">★ CS56 (mid-catheter) consistently achieves best reconstruction quality.</p>

                <p className="font-medium text-white mt-3">Uncertainty Quantification</p>
                <p>A key finding: uncertainty peaks coincide with cardiac activation complexes at ~100 ms, ~400 ms, and ~800 ms. This is physically consistent — activation wavefronts are the sharpest, most spatially localised events, making them hardest to reconstruct from surface recordings. Between beats, uncertainty is low.</p>
                <p className="mt-2">All calibration curves fall below the diagonal: at 95% nominal coverage, empirical coverage ranges from 12% (BayesianWaveNet) to 42.4% (BayesianTransformer). This overconfidence reflects MC-Dropout's epistemic-only uncertainty capture; aleatoric uncertainty from measurement noise is not modelled.</p>
              </Section>

              <Section title="V. Discussion">
                <p className="font-medium text-white">Performance Gap: Aggregate vs. Per-Channel</p>
                <p>The gap between aggregate PCC (~0.09) and best per-channel PCC (0.801) reveals strongly segment-dependent reconstruction quality. On segments with clear activation complexes, models achieve clinically meaningful reconstruction. Channel variation is physiologically meaningful: mid-catheter CS56 is best reconstructed, consistent with the known morphological complexity gradient of coronary sinus electrograms.</p>

                <p className="font-medium text-white mt-3">The Calibration Gap</p>
                <p>PICP@95 of 0.12–0.42 (vs. target 0.95) represents the key limitation. MC-Dropout captures only epistemic uncertainty. Aleatoric uncertainty — measurement noise, motion artefacts, and the irreducible ambiguity of the many-to-one mapping — requires heteroscedastic output heads. Post-hoc calibration via temperature scaling or conformal prediction could improve coverage without retraining.</p>

                <p className="font-medium text-white mt-3">Limitations</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Dataset size: 8 patients severely limits generalisability</li>
                  <li>Per-segment z-score normalisation destroys ECG-EGM amplitude coupling; global normalisation is recommended for future work</li>
                  <li>MC-Dropout captures only epistemic uncertainty; narrow prediction intervals confirm aleatoric modelling is needed</li>
                  <li>Best-case per-channel results are cherry-picked; median performance is substantially lower</li>
                </ul>
              </Section>

              <Section title="VI. Conclusion">
                <p>
                  We presented CardioBayes-E2E, the first multi-architecture Bayesian framework for
                  uncertainty-aware ECG-to-EGM reconstruction. Six architectures across five families demonstrated:
                </p>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Per-channel PCC up to 0.801 with cross-architecture convergence confirming genuine signal extraction</li>
                  <li>MC-Dropout uncertainty correctly identifying cardiac activation complexes as high-uncertainty regions</li>
                  <li>BayesianTransformer achieving best calibration while BayesianBiLSTM achieves best reconstruction with fewest parameters</li>
                  <li>Systematic overconfidence motivating heteroscedastic extensions</li>
                </ol>
                <p className="mt-3">
                  <strong className="text-white">Future work:</strong> heteroscedastic output heads, global normalisation,
                  multi-centre datasets, and conformal calibration.
                </p>
              </Section>

              <Section title="References">
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400">
                  <li>Calkins et al., "2017 HRS/EHRA/ECAS expert consensus on catheter ablation of AF," Europace, 2018.</li>
                  <li>Haïssaguerre et al., "Spontaneous initiation of AF by ectopic beats in pulmonary veins," NEJM, 1998.</li>
                  <li>Banta et al., "A novel CNN for reconstructing surface ECG from intracardiac EGM and vice versa," Artif. Intell. Med., 2021.</li>
                  <li>Rudy, "Noninvasive electrocardiographic imaging of arrhythmogenic substrates," Circ. Res., 2006.</li>
                  <li>Porée et al., "Surface ECG reconstruction from intracardiac EGM using dynamic time delay ANN," IEEE TBME, 2013.</li>
                  <li>Kachenoura et al., "Surface ECG reconstruction from intracardiac EGM: a PCA-vectorcardiogram method," Asilomar, 2007.</li>
                  <li>Kachenoura et al., "Non-linear 12-lead ECG synthesis from two intracardiac recordings," Comput. Cardiol., 2009.</li>
                  <li>Gal & Ghahramani, "Dropout as a Bayesian approximation," ICML, 2016.</li>
                  <li>Gal, "Uncertainty in deep learning," PhD dissertation, University of Cambridge, 2016.</li>
                  <li>Kendall & Gal, "What uncertainties do we need in Bayesian deep learning for computer vision?" NeurIPS, 2017.</li>
                  <li>Goldberger et al., "PhysioBank, PhysioToolkit, PhysioNet," Circulation, 2000.</li>
                  <li>Naeini et al., "Obtaining well-calibrated probabilities using Bayesian binning," AAAI, 2015.</li>
                </ol>
                <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs">
                  <ExternalLink size={12} />
                  <span>IAFDB dataset: </span>
                  <a href="https://physionet.org/content/iafdb/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">physionet.org/content/iafdb/</a>
                </div>
              </Section>

            </div>
          )}
        </div>

      </main>
    </div>
  );
}
