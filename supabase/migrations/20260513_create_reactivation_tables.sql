-- Patient Reactivation Campaign Tables
-- Run via: npx supabase db push  OR  paste into Supabase SQL Editor

-- 1. Patient list uploaded by the clinic
CREATE TABLE IF NOT EXISTS reactivation_patients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id       uuid NOT NULL,
  first_name      text,
  last_name       text,
  email           text,
  phone           text,
  last_visit_date date,
  total_visits    integer,
  notes           text,
  status          text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_id, email)
);

-- 2. Reactivation campaigns
CREATE TABLE IF NOT EXISTS reactivation_campaigns (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      uuid NOT NULL,
  name           text NOT NULL,
  status         text NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  from_name      text,
  from_email     text,
  reply_to       text,
  booking_url    text,
  total_enrolled integer NOT NULL DEFAULT 0,
  total_sent     integer NOT NULL DEFAULT 0,
  total_opened   integer NOT NULL DEFAULT 0,
  total_booked   integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 3. Patient enrollment per campaign
CREATE TABLE IF NOT EXISTS campaign_enrollments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  uuid NOT NULL REFERENCES reactivation_campaigns(id) ON DELETE CASCADE,
  patient_id   uuid NOT NULL REFERENCES reactivation_patients(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'enrolled'
               CHECK (status IN ('enrolled', 'completed', 'unsubscribed', 'booked')),
  current_step integer NOT NULL DEFAULT 0,
  next_send_at timestamptz,
  enrolled_at  timestamptz NOT NULL DEFAULT now(),
  booked_at    timestamptz,
  UNIQUE (campaign_id, patient_id)
);

-- 4. Per-email send log
CREATE TABLE IF NOT EXISTS reactivation_email_sends (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES campaign_enrollments(id) ON DELETE CASCADE,
  step          integer NOT NULL,
  subject       text NOT NULL,
  status        text NOT NULL DEFAULT 'sent'
                CHECK (status IN ('sent', 'failed')),
  resend_id     text,
  sent_at       timestamptz NOT NULL DEFAULT now()
);

-- Row-level security
ALTER TABLE reactivation_patients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactivation_campaigns   ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_enrollments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactivation_email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_patients"    ON reactivation_patients  FOR ALL USING (clinic_id = auth.uid());
CREATE POLICY "own_campaigns"   ON reactivation_campaigns FOR ALL USING (clinic_id = auth.uid());
CREATE POLICY "own_enrollments" ON campaign_enrollments   FOR ALL USING (
  campaign_id IN (SELECT id FROM reactivation_campaigns WHERE clinic_id = auth.uid())
);
CREATE POLICY "own_sends"       ON reactivation_email_sends FOR ALL USING (
  enrollment_id IN (
    SELECT e.id FROM campaign_enrollments e
    JOIN reactivation_campaigns c ON c.id = e.campaign_id
    WHERE c.clinic_id = auth.uid()
  )
);
