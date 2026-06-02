import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

type Status = "pending" | "preprocessing" | "inferring" | "complete" | "failed" | string;

export function useJobPolling(jobId: string | undefined, intervalMs = 2000) {
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pollOnce = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await api.get(`/api/v1/inference/status/${jobId}`);
      setStatus(res.data.status);
      setMessage(res.data.message || null);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "poll failed");
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    pollOnce();
    timer.current = setInterval(pollOnce, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [jobId, intervalMs, pollOnce]);

  return { status, message, error, refresh: pollOnce };
}
