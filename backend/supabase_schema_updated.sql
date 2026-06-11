-- CardioBayes-E2E Supabase Schema
-- Paste this entire file into Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: all statements use IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS

BEGIN;

-- ============================================================
-- 1) Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2) Helper: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3) User profiles
--    Stores auth credentials + profile in one table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  full_name     TEXT,
  role          TEXT        NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user','admin','superadmin')),
  is_verified   BOOLEAN     NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_idx    ON public.user_profiles (email);
CREATE        INDEX IF NOT EXISTS user_profiles_created_idx  ON public.user_profiles (created_at);

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 4) Role change audit log
-- ============================================================
CREATE TABLE IF NOT EXISTS public.role_change_log (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_user_id  UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  changed_by_id   UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  old_role        TEXT,
  new_role        TEXT,
  reason          TEXT
);

-- ============================================================
-- 5) Inference jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inference_jobs (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at         TIMESTAMPTZ,

  -- User tracking
  user_id              UUID        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  session_id           TEXT,
  user_agent           TEXT,
  country              TEXT,

  -- Input metadata
  input_file_format    TEXT        NOT NULL,
  input_filename       TEXT,
  input_sampling_rate  INTEGER,
  input_duration_ms    DOUBLE PRECISION,
  input_leads          TEXT[],
  input_segment_count  INTEGER,
  was_resampled        BOOLEAN     NOT NULL DEFAULT FALSE,
  preprocessing_notes  TEXT,

  -- Model configuration
  architecture         TEXT        NOT NULL,
  mc_passes            INTEGER     NOT NULL DEFAULT 20,

  -- Job lifecycle
  status               TEXT        NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','preprocessing','inferring','complete','failed')),
  processing_time_ms   DOUBLE PRECISION,
  error_message        TEXT,
  error_code           TEXT,

  -- Research metadata
  is_marked_synthetic  BOOLEAN     NOT NULL DEFAULT FALSE,
  user_feedback_rating INTEGER     CHECK (user_feedback_rating BETWEEN 1 AND 5),
  user_feedback_text   TEXT
);

CREATE INDEX IF NOT EXISTS inference_jobs_created_idx  ON public.inference_jobs (created_at);
CREATE INDEX IF NOT EXISTS inference_jobs_user_idx     ON public.inference_jobs (user_id);
CREATE INDEX IF NOT EXISTS inference_jobs_status_idx   ON public.inference_jobs (status);

DROP TRIGGER IF EXISTS trg_inference_jobs_updated_at ON public.inference_jobs;
CREATE TRIGGER trg_inference_jobs_updated_at
  BEFORE UPDATE ON public.inference_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 6) Inference results (per-channel metrics)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inference_results (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id              UUID        NOT NULL REFERENCES public.inference_jobs(id) ON DELETE CASCADE,
  channel             TEXT        NOT NULL,   -- CS12 / CS34 / CS56 / CS78 / CS90

  -- Reconstruction metrics
  pcc                 DOUBLE PRECISION,
  rmse                DOUBLE PRECISION,
  mae                 DOUBLE PRECISION,
  r_squared           DOUBLE PRECISION,
  snr_db              DOUBLE PRECISION,
  spectral_coherence  DOUBLE PRECISION,

  -- Uncertainty metrics
  confidence_level    TEXT        CHECK (confidence_level IN ('High','Medium','Low')),
  mean_uncertainty    DOUBLE PRECISION,
  ece                 DOUBLE PRECISION,
  picp_95             DOUBLE PRECISION,
  mpiw                DOUBLE PRECISION,
  nll                 DOUBLE PRECISION,
  sharpness           DOUBLE PRECISION,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inference_results_job_idx ON public.inference_results (job_id);

-- ============================================================
-- 7) Waveforms (mean + sigma arrays stored as JSONB)
--    One row per job+channel. Replaces the old Supabase Storage approach.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.waveforms (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID        NOT NULL REFERENCES public.inference_jobs(id) ON DELETE CASCADE,
  channel     TEXT        NOT NULL,
  mean_data   JSONB       NOT NULL DEFAULT '[]',
  sigma_data  JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, channel)
);

CREATE INDEX IF NOT EXISTS waveforms_job_idx ON public.waveforms (job_id);

-- ============================================================
-- 8) Model analytics snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS public.model_analytics (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  architecture        TEXT        NOT NULL,
  total_jobs          INTEGER     NOT NULL DEFAULT 0,
  successful_jobs     INTEGER     NOT NULL DEFAULT 0,
  failed_jobs         INTEGER     NOT NULL DEFAULT 0,
  avg_pcc             DOUBLE PRECISION,
  avg_rmse            DOUBLE PRECISION,
  avg_uncertainty     DOUBLE PRECISION,
  avg_processing_ms   DOUBLE PRECISION,
  avg_user_rating     DOUBLE PRECISION,
  most_used_channel   TEXT
);

CREATE INDEX IF NOT EXISTS model_analytics_arch_idx ON public.model_analytics (architecture);

-- ============================================================
-- 9) System events log
-- ============================================================
CREATE TABLE IF NOT EXISTS public.system_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type  TEXT,
  severity    TEXT        CHECK (severity IN ('info','warning','error')),
  message     TEXT,
  metadata    JSONB
);

CREATE INDEX IF NOT EXISTS system_events_time_idx ON public.system_events (occurred_at);

-- ============================================================
-- 10) Row-Level Security
-- ============================================================

-- --- user_profiles ---
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS up_insert_public   ON public.user_profiles;
CREATE POLICY up_insert_public
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS up_select_owner_or_admin ON public.user_profiles;
CREATE POLICY up_select_owner_or_admin
  ON public.user_profiles FOR SELECT
  USING (
    id = auth.uid()
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    ))
  );

DROP POLICY IF EXISTS up_update_owner_or_admin ON public.user_profiles;
CREATE POLICY up_update_owner_or_admin
  ON public.user_profiles FOR UPDATE
  USING (
    id = auth.uid()
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    ))
  )
  WITH CHECK (
    id = auth.uid()
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    ))
  );

-- --- inference_jobs ---
ALTER TABLE public.inference_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ij_insert ON public.inference_jobs;
CREATE POLICY ij_insert
  ON public.inference_jobs FOR INSERT
  WITH CHECK ((user_id IS NULL) OR (user_id = auth.uid()));

DROP POLICY IF EXISTS ij_select ON public.inference_jobs;
CREATE POLICY ij_select
  ON public.inference_jobs FOR SELECT
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    ))
  );

DROP POLICY IF EXISTS ij_update ON public.inference_jobs;
CREATE POLICY ij_update
  ON public.inference_jobs FOR UPDATE
  USING (
    (user_id IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    ))
  )
  WITH CHECK (
    (user_id IS NULL) OR (user_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    ))
  );

-- --- inference_results ---
ALTER TABLE public.inference_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ir_insert ON public.inference_results;
CREATE POLICY ir_insert
  ON public.inference_results FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS ir_select ON public.inference_results;
CREATE POLICY ir_select
  ON public.inference_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inference_jobs ij
      WHERE ij.id = public.inference_results.job_id
        AND (ij.user_id = auth.uid() OR auth.uid() IS NOT NULL)
    )
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    ))
  );

-- --- waveforms ---
ALTER TABLE public.waveforms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wf_insert ON public.waveforms;
CREATE POLICY wf_insert
  ON public.waveforms FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS wf_upsert ON public.waveforms;
CREATE POLICY wf_upsert
  ON public.waveforms FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS wf_select ON public.waveforms;
CREATE POLICY wf_select
  ON public.waveforms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inference_jobs ij
      WHERE ij.id = public.waveforms.job_id
        AND (ij.user_id = auth.uid() OR auth.uid() IS NOT NULL)
    )
    OR (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    ))
  );

-- --- model_analytics ---
ALTER TABLE public.model_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ma_insert ON public.model_analytics;
CREATE POLICY ma_insert
  ON public.model_analytics FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS ma_select ON public.model_analytics;
CREATE POLICY ma_select
  ON public.model_analytics FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    )
  );

-- --- system_events ---
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS se_insert ON public.system_events;
CREATE POLICY se_insert
  ON public.system_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS se_select ON public.system_events;
CREATE POLICY se_select
  ON public.system_events FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_profiles u
      WHERE u.id = auth.uid() AND u.role IN ('admin','superadmin')
    )
  );

-- ============================================================
-- 11) Grants
-- ============================================================
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO public;

COMMIT;
