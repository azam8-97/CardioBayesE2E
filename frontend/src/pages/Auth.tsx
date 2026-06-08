import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [current, setCurrent] = useState(mode === "register" ? "register" : "login");

  return (
    <div className="auth-page min-h-screen flex items-stretch">
      <aside className="hidden md:flex w-5/12 flex-col justify-center items-start p-12 text-white"
        style={{ background: "linear-gradient(145deg, #1a3a8a 0%, #1d4ed8 45%, #4f46e5 100%)" }}>
        <a href="/" className="mb-8 flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src="/logo.svg" alt="CardioBayes" className="w-11 h-11" />
          <div>
            <div className="text-2xl font-bold tracking-tight">CardioBayes<sup className="text-sm text-blue-200 ml-0.5">E2E</sup></div>
            <div className="text-sm text-blue-200 mt-0.5">Uncertainty-Aware Cardiac Signal Intelligence</div>
          </div>
        </a>
        <div className="mb-6 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-white/10 text-blue-100 border border-white/20 inline-block">
          Academic Research Tool
        </div>
        <h1 className="text-3xl font-extrabold mb-4 leading-tight">Secure access<br />for researchers</h1>
        <p className="text-sm text-blue-100 max-w-xs leading-relaxed mb-8">
          Sign in to run Bayesian ECG→EGM reconstructions and explore probabilistic results with calibrated uncertainty.
        </p>
        <div className="space-y-3 text-sm text-blue-100/80">
          <div className="flex items-center gap-2"><span className="text-green-300">✓</span> 6 Bayesian neural architectures</div>
          <div className="flex items-center gap-2"><span className="text-green-300">✓</span> Calibrated uncertainty quantification</div>
          <div className="flex items-center gap-2"><span className="text-green-300">✓</span> IAFDB-trained benchmark models</div>
        </div>
        <p className="mt-auto pt-8 text-xs text-blue-200/60 max-w-xs">
          Do not upload identifiable patient data. Outputs are probabilistic and not for clinical use.
        </p>
      </aside>

      <main className="auth-right">
        <div className="auth-card">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-slate-800">
              {current === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {current === "login" ? "Sign in to your research account" : "Start using CardioBayes-E2E today"}
            </p>
          </div>

          <div className="flex gap-1 mb-6 p-1 bg-slate-100 rounded-lg">
            <button
              className={`tab flex-1 ${current === "login" ? "tab-active" : ""}`}
              onClick={() => setCurrent("login")}
            >
              Sign In
            </button>
            <button
              className={`tab flex-1 ${current === "register" ? "tab-active" : ""}`}
              onClick={() => setCurrent("register")}
            >
              Create Account
            </button>
          </div>

          {current === "login" ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 text-center text-sm" style={{ color: "#94a3b8" }}>
            <Link to="/" className="text-accent hover:underline">← Return to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
