import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import api from "../services/api";
import Navbar from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Toast } from "../components/ui/Toast";
import { useInferenceStore } from "../stores/inferenceStore";

const models = [
  "BayesianBiLSTM",
  "BayesianTransformer",
  "BayesianTCN",
  "BayesianWaveNet",
  "BayesianCNN",
  "BaselineCNN",
];

const modelMeta: Record<string, { badge: string; blurb: string }> = {
  BayesianBiLSTM: { badge: "Recommended", blurb: "Best overall reconstruction." },
  BayesianTransformer: { badge: "Calibration", blurb: "Most reliable uncertainty." },
  BayesianTCN: { badge: "Fast", blurb: "Lowest latency." },
  BayesianWaveNet: { badge: "Val loss", blurb: "Rich high-frequency detail." },
  BayesianCNN: { badge: "RMSE", blurb: "Strong spatial baseline." },
  BaselineCNN: { badge: "Deterministic", blurb: "No σ bands." },
};

export default function Inference() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(models[0]);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<
    Array<{ title: string; status: "waiting" | "active" | "complete" | "error" }>
  >([
    { title: "Validating ECG format...", status: "waiting" },
    { title: "Parsing signal leads I, II, V1...", status: "waiting" },
    { title: "Resampling to 1000 Hz...", status: "waiting" },
    { title: "Normalizing segments...", status: "waiting" },
    { title: "Connecting to inference engine...", status: "waiting" },
    { title: "Running Bayesian passes...", status: "waiting" },
    { title: "Computing uncertainty bands...", status: "waiting" },
    { title: "Storing results...", status: "waiting" },
  ]);
  const [coldStart, setColdStart] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const setLastJobId = useInferenceStore((s) => s.setLastJobId);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "text/csv": [".csv"],
      "application/x-matlab": [".mat"],
      "application/octet-stream": [".edf"],
    },
  });

  const runInference = async () => {
    if (!file) return alert("Select a file first");
    setRunning(true);
    setColdStart(false);
    startTimeRef.current = Date.now();
    const form = new FormData();
    form.append("file", file as Blob, file.name);
    form.append("architecture", selectedModel);
    try {
      const res = await api.post("/api/v1/inference/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const jobId = res.data.job_id as string;

      const updateStep = (index: number, status: "waiting" | "active" | "complete" | "error") =>
        setSteps((s) => s.map((st, i) => (i === index ? { ...st, status } : st)));

      for (let i = 0; i < steps.length; i++) {
        updateStep(i, "active");
        const title = steps[i].title;
        
        // Handle preprocessing steps (faster)
        if (title.includes("Validating") || title.includes("Parsing") || title.includes("Resampling") || title.includes("Normalizing")) {
          await new Promise((r) => setTimeout(r, 500));
          updateStep(i, "complete");
          continue;
        }
        
        // Handle "Connecting to inference engine" - wait for job to start processing
        if (title.includes("Connecting")) {
          const connectStart = Date.now();
          let status = "pending";
          
          while (status === "pending") {
            const s = await api.get(`/api/v1/inference/status/${jobId}`);
            status = s.data.status;
            
            if (status === "failed") {
              updateStep(i, "error");
              throw new Error(s.data.message || "Failed to connect to inference engine");
            }
            
            const elapsed = Date.now() - connectStart;
            if (elapsed > 10000 && status === "pending") {
              setColdStart(true);
            }
            
            if (status !== "pending") break;
            await new Promise((r) => setTimeout(r, 1000));
          }
          updateStep(i, "complete");
          continue;
        }
        
        // Handle "Running Bayesian passes" - long-running inference
        if (title.includes("Bayesian")) {
          const inferenceStart = Date.now();
          let status = "preprocessing"; // Should move from "preprocessing" to "inferring" to "complete"
          
          while (status !== "complete") {
            const s = await api.get(`/api/v1/inference/status/${jobId}`);
            status = s.data.status;
            
            if (status === "failed") {
              updateStep(i, "error");
              // Parse inference error messages
              const errorMsg = s.data.message || "Inference failed";
              if (errorMsg.includes("TIMEOUT") || errorMsg.includes("timeout")) {
                throw new Error("Inference timeout: HuggingFace took too long. Models may still be warming up. Try again in a moment.");
              } else if (errorMsg.includes("CIRCUIT_BREAKER") || errorMsg.includes("UNAVAILABLE")) {
                throw new Error("Inference service temporarily unavailable. Too many failures detected. Please try again in a few moments.");
              } else if (errorMsg.includes("CONNECTION")) {
                throw new Error("Failed to connect to inference service. Check your internet connection and try again.");
              } else {
                throw new Error(`Inference error: ${errorMsg}`);
              }
            }
            
            const elapsedInference = Date.now() - inferenceStart;
            if (elapsedInference > 30000 && status === "inferring") {
              setColdStart(true);
            }
            
            if (status === "complete") break;
            await new Promise((r) => setTimeout(r, 1000));
          }
          updateStep(i, "complete");
          continue;
        }
        
        // Handle remaining steps (computing uncertainty, storing results)
        let status = "pending";
        while (status !== "complete") {
          const s = await api.get(`/api/v1/inference/status/${jobId}`);
          status = s.data.status;
          
          if (status === "failed") {
            updateStep(i, "error");
            throw new Error(s.data.message || "Inference failed");
          }
          
          if (status === "complete") break;
          await new Promise((r) => setTimeout(r, 1000));
        }
        updateStep(i, "complete");
      }

      setLastJobId(jobId);
      navigate(`/results/${jobId}`);
    } catch (err: unknown) {
      console.error(err);
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (err instanceof Error ? err.message : "Inference failed");
      alert(String(msg));
      
      // Mark current active step as error
      setSteps((s) =>
        s.map((st) =>
          st.status === "active" ? { ...st, status: "error" } : st
        )
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="container py-10">
        <nav className="text-caption text-slate-500 mb-4">
          <Link to="/dashboard" className="text-blue-400 hover:underline">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-300">New inference</span>
        </nav>

        <h1 className="text-h2 text-white mb-2">New inference</h1>
        <p className="text-body-sm text-slate-400 mb-6">
          Upload a 3-lead ECG (.csv, .mat, .edf), choose an architecture, and run the Bayesian pipeline.
        </p>

        <Toast variant="warning" className="mb-6 text-left">
          CardioBayes-E2E is an academic research tool. Outputs are probabilistic and must not be used as the sole
          basis for clinical decisions. Do not upload identifiable patient data.
        </Toast>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-h5 text-white mb-3">1. File upload</h2>
              <div
                {...getRootProps()}
                className={`dropzone min-h-[200px] flex items-center justify-center cursor-pointer ${
                  isDragActive ? "dropzone--active" : ""
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="text-center text-slate-200">
                    <div className="font-mono text-code">{file.name}</div>
                    <div className="text-caption text-slate-400 mt-1">{Math.round(file.size / 1024)} KB</div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 px-4">
                    Drag and drop <span className="text-blue-300">.csv</span>, <span className="text-blue-300">.mat</span>
                    , or <span className="text-blue-300">.edf</span> here, or click to browse.
                  </div>
                )}
              </div>
              <p className="text-caption text-slate-500 mt-3">
                CSV columns should include leads I, II, and V1 (e.g. lead_I, lead_II, lead_V1). Minimum 1000 samples.
              </p>
            </Card>

            <Card>
              <h2 className="text-h5 text-white mb-4">2. Architecture</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {models.map((m) => {
                  const meta = modelMeta[m] || { badge: "", blurb: "" };
                  const sel = selectedModel === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedModel(m)}
                      className={`text-left rounded-lg border p-4 transition hover:border-blue-500/50 ${
                        sel ? "border-blue-500 bg-blue-500/10 shadow-glow-blue" : "border-slate-700 bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">{m}</span>
                        <span className="text-[10px] uppercase tracking-wide text-blue-300">{meta.badge}</span>
                      </div>
                      <p className="text-caption text-slate-400">{meta.blurb}</p>
                      <p className="text-metric-sm text-cyan-300 mt-2">~5–15s</p>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <aside>
            <Card>
              <h4 className="text-h5 text-white mb-3">3. Run</h4>
              <p className="text-body-sm text-slate-400 mb-1">
                <span className="text-slate-500">File:</span> {file ? file.name : "—"}
              </p>
              <p className="text-body-sm text-slate-400 mb-4">
                <span className="text-slate-500">Model:</span> {selectedModel}
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => void runInference()}
                disabled={running || !file}
              >
                {running ? "Running…" : "Run inference"}
              </Button>

              {running && (
                <div className="mt-4">
                  {coldStart && (
                    <Toast variant="warning" className="mb-3 text-left text-caption">
                      Warming up inference engine… First call to Hugging Face can take 30–60 seconds.
                    </Toast>
                  )}
                  <div className="stepper">
                    {steps.map((s, idx) => (
                      <div key={s.title} className={`step ${s.status}`}>
                        <div className="step-index">{s.status === "complete" ? "✓" : idx + 1}</div>
                        <div className="step-content">
                          <div className="step-title">{s.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
