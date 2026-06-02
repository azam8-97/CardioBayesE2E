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
      <aside className="auth-left w-5/12 hidden md:flex flex-col justify-center items-start p-12 bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
        <a href="/" className="mb-6 flex items-center gap-3">
          <img src="/logo.svg" alt="CardioBayes" className="w-10 h-10" />
          <div>
            <div className="text-2xl font-bold">CardioBayes</div>
            <div className="text-sm text-blue-200">E2E — Uncertainty-Aware Cardiac Signal Intelligence</div>
          </div>
        </a>
        <h1 className="text-3xl font-extrabold mb-4">Secure access for researchers</h1>
        <p className="text-sm text-blue-100 max-w-xs">Sign in to run Bayesian ECG→EGM reconstructions and explore probabilistic results. Do not upload identifiable patient data.</p>
      </aside>

      <main className="auth-right flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="auth-card w-full max-w-md bg-elevated p-8 rounded-lg shadow-card">
          <div className="tabs flex gap-2 mb-6">
            <button
              className={`tab ${current === "login" ? "tab-active" : ""}`}
              onClick={() => setCurrent("login")}
            >
              Sign In
            </button>
            <button
              className={`tab ${current === "register" ? "tab-active" : ""}`}
              onClick={() => setCurrent("register")}
            >
              Create Account
            </button>
          </div>

          {current === "login" ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 text-center text-sm text-tertiary">
            <Link to="/" className="text-accent">Return to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
