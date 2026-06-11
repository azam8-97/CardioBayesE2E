-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Creates the waveforms table used to store mean/sigma arrays per inference channel.

CREATE TABLE IF NOT EXISTS waveforms (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id      UUID        NOT NULL REFERENCES inference_jobs(id) ON DELETE CASCADE,
    channel     TEXT        NOT NULL,
    mean_data   JSONB       NOT NULL DEFAULT '[]',
    sigma_data  JSONB       NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (job_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_waveforms_job_id ON waveforms (job_id);
