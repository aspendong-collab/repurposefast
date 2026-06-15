-- ── RePurposeFast Database Schema ──────────────────────────────────────────
-- Run this in your Supabase SQL Editor to set up the database.
-- File: scripts/supabase-migration.sql

-- ── 1. repurpose_jobs ───────────────────────────────────────────────────────
-- Tracks each transcription + repurposing job

CREATE TABLE IF NOT EXISTS public.repurpose_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN (
                  'pending', 'transcribing', 'transcribed',
                  'repurposing', 'completed', 'failed'
                )),
  source        TEXT NOT NULL CHECK (source IN ('url', 'file')),
  source_url    TEXT,
  source_platform TEXT,
  source_language TEXT DEFAULT 'zh',

  -- Transcription result
  transcript    TEXT,
  transcript_segments JSONB,
  duration_seconds DOUBLE PRECISION,

  -- Repurpose result
  outputs       JSONB,

  -- Metadata
  error         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_jobs_user_id ON public.repurpose_jobs(user_id);
CREATE INDEX idx_jobs_status ON public.repurpose_jobs(status);
CREATE INDEX idx_jobs_created_at ON public.repurpose_jobs(created_at DESC);

-- ── 2. user_credits ─────────────────────────────────────────────────────────
-- Tracks user credit/usage limits

CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier            TEXT NOT NULL DEFAULT 'free'
                  CHECK (tier IN ('free', 'basic', 'standard', 'pro')),
  minutes_used    INTEGER NOT NULL DEFAULT 0,
  minutes_limit   INTEGER NOT NULL DEFAULT 120,  -- Free tier: 120 min/month
  files_processed INTEGER NOT NULL DEFAULT 0,
  billing_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. uploads (Storage Bucket Setup) ───────────────────────────────────────
-- Run these separately in the Storage section of Supabase dashboard, or via SQL:

-- Create storage bucket for user uploads
-- Note: This needs to be done via Supabase dashboard > Storage > New Bucket
-- Bucket name: repurpose-uploads
-- Public bucket: Yes (files need to be publicly accessible for Whisper API)
-- File size limit: 500MB

-- RLS Policy for uploads bucket (run after creating the bucket):
-- Allow authenticated users to upload
-- CREATE POLICY "Users can upload files"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'repurpose-uploads');

-- Allow public read access (needed for Whisper API)
-- CREATE POLICY "Public can read files"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'repurpose-uploads');

-- ── 4. analytics_events ─────────────────────────────────────────────────────
-- For tracking tool usage and conversions

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id            BIGSERIAL PRIMARY KEY,
  event_type    TEXT NOT NULL,  -- 'transcribe', 'repurpose', 'download', 'copy'
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tool_slug     TEXT,           -- e.g., 'youtube-to-blog-post'
  source_format TEXT,
  target_format TEXT,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);

-- ── 5. Row Level Security ──────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.repurpose_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Repurpose jobs: users can only see their own
CREATE POLICY "Users can view own jobs"
ON public.repurpose_jobs FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own jobs"
ON public.repurpose_jobs FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own jobs"
ON public.repurpose_jobs FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- User credits: users can view own credits
CREATE POLICY "Users can view own credits"
ON public.user_credits FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Analytics: allow anonymous inserts for event tracking
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events FOR INSERT
TO public
WITH CHECK (true);

-- ── 6. Functions ────────────────────────────────────────────────────────────

-- Function to increment minutes used
CREATE OR REPLACE FUNCTION increment_minutes_used(
  p_user_id UUID,
  p_minutes INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, tier, minutes_used, minutes_limit)
  VALUES (p_user_id, 'free', p_minutes, 120)
  ON CONFLICT (user_id)
  DO UPDATE SET
    minutes_used = user_credits.minutes_used + p_minutes,
    updated_at = now();
END;
$$;

-- Function to check if user has remaining credits
CREATE OR REPLACE FUNCTION check_credits(
  p_user_id UUID
)
RETURNS TABLE(
  minutes_used INTEGER,
  minutes_limit INTEGER,
  remaining INTEGER,
  can_use BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.minutes_used,
    uc.minutes_limit,
    GREATEST(uc.minutes_limit - uc.minutes_used, 0) AS remaining,
    (uc.minutes_limit - uc.minutes_used) > 0 AS can_use
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;
END;
$$;
