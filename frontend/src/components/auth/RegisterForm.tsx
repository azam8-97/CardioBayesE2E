import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/ToastProvider";

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirm: string;
  terms: boolean;
};

export default function RegisterForm() {
  const { register, handleSubmit, watch, formState } = useForm<FormData>({ mode: "onChange" });
  const [loading, setLoading] = useState(false);
  const pwd = watch("password");
  const email = watch("email");
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const loadId = toast.loading("Creating your account…");
    try {
      await api.post("/api/v1/auth/register", {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
      });
      toast.update(loadId, "Account created! You can now sign in.", "success");
      navigate("/auth?mode=login");
    } catch (err: any) {
      toast.dismiss(loadId);
      toast.error(err?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Full name</label>
        <input
          {...register("fullName", { required: true, minLength: { value: 2, message: "Name must be at least 2 characters" } })}
          className="input"
          placeholder="Dr. Jane Smith"
        />
        {formState.errors.fullName && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{formState.errors.fullName.message || "Required"}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          {...register("email", {
            required: true,
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
          })}
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
          placeholder="Min. 8 characters"
        />
        {formState.errors.password && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Confirm Password</label>
        <input
          {...register("confirm", {
            required: true,
            validate: (v) => v === pwd || "Passwords do not match",
          })}
          type="password"
          className="input"
          placeholder="Repeat password"
        />
        {formState.errors.confirm && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{formState.errors.confirm.message as string}</p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input {...register("terms", { required: true })} type="checkbox" id="terms" className="mt-0.5" />
        <label htmlFor="terms" className="text-sm text-secondary leading-snug">
          I understand this is a research tool and outputs are not for clinical use
        </label>
      </div>
      {formState.errors.terms && (
        <p className="text-xs -mt-2" style={{ color: "#ef4444" }}>You must accept before continuing</p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={!formState.isValid || loading}>
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
