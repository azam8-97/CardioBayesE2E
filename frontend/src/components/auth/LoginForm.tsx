import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuthStore } from "../../stores/authStore";

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit, formState } = useForm<FormData>({ mode: "onChange" });
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s: any) => s.setToken);
  const setRefreshToken = useAuthStore((s: any) => s.setRefreshToken);
  const setUser = useAuthStore((s: any) => s.setUser);
  const navigate = useNavigate();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post("/api/v1/auth/login", data);
      const token = res.data.access_token;
      setToken(token);
      if (res.data.refresh_token) setRefreshToken(res.data.refresh_token);
      // fetch /me
      const me = await api.get("/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      setUser(me.data);
      navigate("/inference");
    } catch (err: any) {
      console.error(err);
      const detail = err?.response?.data?.detail || "Login failed";
      if (err?.response?.status === 403) {
        // unverified
        setUnverifiedEmail(data.email);
      }
      alert(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {unverifiedEmail && (
        <div className="card-warning p-3 bg-amber-50 border-l-4 border-amber-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email not verified</div>
              <div className="text-sm text-tertiary">We sent a verification link to {unverifiedEmail}.</div>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={async () => {
                  try {
                    const r = await api.post('/api/v1/auth/resend-verification', { email: unverifiedEmail });
                    const token = r.data.verification_token;
                    if (token) {
                      // Automatically verify in dev mode
                      try {
                        await api.post('/api/v1/auth/verify', { token });
                        alert('Email verified! You can now sign in.');
                        setUnverifiedEmail(null);
                      } catch (verifyErr: any) {
                        alert('Verification token: ' + token + '\nVerification failed: ' + (verifyErr?.response?.data?.detail || 'Unknown error'));
                      }
                    } else {
                      alert('Verification resent. Check your email.');
                    }
                  } catch (e:any){
                    alert(e?.response?.data?.detail || 'Resend failed');
                  }
                }}
              >
                Resend verification
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          {...register("email", { required: true, pattern: /@/ })}
          type="email"
          className="input"
          placeholder="you@institution.edu"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Password</label>
        <input
          {...register("password", { required: true, minLength: 8 })}
          type="password"
          className="input"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center justify-between">
        <a className="text-sm text-accent" href="#">Forgot password?</a>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={!formState.isValid || loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
