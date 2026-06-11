import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../ui/ToastProvider";

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState, watch } = useForm<FormData>({ mode: "onChange" });
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s: any) => s.setToken);
  const setRefreshToken = useAuthStore((s: any) => s.setRefreshToken);
  const setUser = useAuthStore((s: any) => s.setUser);
  const navigate = useNavigate();
  const toast = useToast();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const email = watch("email");
  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const loadId = toast.loading("Signing in…");
    try {
      const res = await api.post("/api/v1/auth/login", data);
      const token = res.data.access_token;
      setToken(token);
      if (res.data.refresh_token) setRefreshToken(res.data.refresh_token);
      const me = await api.get("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(me.data);
      toast.update(loadId, "Signed in successfully!", "success");
      navigate("/inference");
    } catch (err: any) {
      toast.dismiss(loadId);
      const detail = err?.response?.data?.detail || "Login failed";
      if (err?.response?.status === 403) {
        setUnverifiedEmail(data.email);
        toast.warning("Email not verified. Check your inbox or resend below.");
      } else {
        toast.error(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {unverifiedEmail && (
        <div className="card-warning p-3 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-amber-800">Email not verified</div>
              <div className="text-sm text-amber-600">We sent a verification link to {unverifiedEmail}.</div>
            </div>
            <button
              type="button"
              className="btn btn-ghost text-sm"
              onClick={async () => {
                const id = toast.loading("Resending verification…");
                try {
                  const r = await api.post("/api/v1/auth/resend-verification", { email: unverifiedEmail });
                  const token = r.data.verification_token;
                  if (token) {
                    try {
                      await api.post("/api/v1/auth/verify", { token });
                      toast.update(id, "Email verified! You can now sign in.", "success");
                      setUnverifiedEmail(null);
                    } catch {
                      toast.update(id, "Verification token: " + token, "info");
                    }
                  } else {
                    toast.update(id, "Verification email sent. Check your inbox.", "success");
                  }
                } catch (e: any) {
                  toast.update(id, e?.response?.data?.detail || "Resend failed", "error");
                }
              }}
            >
              Resend
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          {...register("email", { required: true, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } })}
          type="email"
          className="input"
          placeholder="you@institution.edu"
        />
        {formState.errors.email && email && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{formState.errors.email.message || "Enter a valid email"}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Password</label>
        <input
          {...register("password", { required: true, minLength: { value: 8, message: "Password must be at least 8 characters" } })}
          type="password"
          className="input"
          placeholder="••••••••"
        />
        {formState.errors.password && password && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{formState.errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-sm text-accent hover:underline"
          onClick={() => toast.info("Password reset is not yet available. Contact support if needed.")}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={!formState.isValid || loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
