import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/api/v1/auth/register", {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
      });
      
      alert("Registration successful! You can now sign in.");
      navigate("/auth?mode=login");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Full name</label>
        <input {...register("fullName", { required: true, minLength: 2 })} className="input" />
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input {...register("email", { required: true, pattern: /@/ })} className="input" />
      </div>

      <div>
        <label className="block text-sm mb-1">Password</label>
        <input {...register("password", { required: true, minLength: 8 })} type="password" className="input" placeholder="Min. 8 characters" />
        {formState.errors.password && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>Password must be at least 8 characters</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Confirm Password</label>
        <input
          {...register("confirm", { required: true, validate: (v) => v === pwd || "Passwords must match" })}
          type="password"
          className="input"
          placeholder="Repeat password"
        />
        {formState.errors.confirm && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{formState.errors.confirm.message as string || "Passwords must match"}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input {...register("terms", { required: true })} type="checkbox" id="terms" />
        <label htmlFor="terms" className="text-sm text-secondary">I understand this is a research tool and outputs are not for clinical use</label>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={!formState.isValid || loading}>
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
