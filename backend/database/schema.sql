-- ============================================
-- MEDCONNECT AI - DATABASE SCHEMA
-- PostgreSQL / Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (Extended from Supabase Auth)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  blood_group TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  
  -- Subscription info
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  
  -- Preferences
  notification_enabled BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ============================================
-- PRESCRIPTIONS TABLE
-- ============================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- File info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  
  -- OCR data
  raw_text TEXT,
  extracted_medicines JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_share_token ON prescriptions(share_token) WHERE share_token IS NOT NULL;

-- ============================================
-- MEDICATIONS TABLE
-- ============================================
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  
  -- Medicine details
  name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  times_per_day INTEGER DEFAULT 1,
  time_slots TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  stock_unit TEXT DEFAULT 'tablets',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_active ON medications(is_active);
CREATE INDEX idx_medications_end_date ON medications(end_date) WHERE end_date IS NOT NULL;

-- ============================================
-- REMINDERS TABLE
-- ============================================
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  
  -- Reminder details
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  time TIME NOT NULL,
  frequency TEXT NOT NULL,
  
  -- Schedule
  next_reminder_at TIMESTAMPTZ NOT NULL,
  last_taken_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_next_reminder ON reminders(next_reminder_at) WHERE is_active = true;
CREATE INDEX idx_reminders_medication_id ON reminders(medication_id);

-- ============================================
-- ADHERENCE LOG TABLE (Dose tracking)
-- ============================================
CREATE TABLE adherence_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES reminders(id) ON DELETE SET NULL,
  
  -- Dose info
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Notes
  notes TEXT,
  skipped BOOLEAN DEFAULT false,
  skip_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_adherence_user_id ON adherence_log(user_id);
CREATE INDEX idx_adherence_taken_at ON adherence_log(taken_at);
CREATE INDEX idx_adherence_medication_id ON adherence_log(medication_id);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Doctor info
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital TEXT NOT NULL,
  phone TEXT,
  
  -- Appointment details
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================
-- ALERTS TABLE (System notifications)
-- ============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Alert details
  type TEXT NOT NULL CHECK (type IN ('reminder', 'interaction', 'expiry', 'appointment', 'system')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  related_id UUID,
  related_type TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  action_required BOOLEAN DEFAULT false,
  action_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_unread ON alerts(is_read) WHERE is_read = false;
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- ============================================
-- DRUG INTERACTIONS TABLE (Cache)
-- ============================================
CREATE TABLE drug_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  
  -- Interaction details
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  description TEXT NOT NULL,
  recommendation TEXT,
  
  -- Cache metadata
  source TEXT DEFAULT 'internal',
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(drug_a, drug_b)
);

CREATE INDEX idx_drug_interactions_lookup ON drug_interactions(drug_a, drug_b);

-- ============================================
-- PAYMENT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Stripe info
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_invoice_id TEXT,
  
  -- Transaction details
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'inr',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  
  -- Product info
  product_type TEXT NOT NULL CHECK (product_type IN ('subscription', 'one_time')),
  subscription_tier TEXT,
  billing_period TEXT, -- 'monthly' or 'annual'
  
  -- Metadata
  description TEXT,
  receipt_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payments_stripe_intent ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payment_transactions(status);

-- ============================================
-- CHAT HISTORY TABLE (AI Chatbot)
-- ============================================
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Message data
  role TEXT NOT NULL CHECK (role IN ('user', 'bot', 'system')),
  message TEXT NOT NULL,
  detected_specialty TEXT,
  
  -- Context
  session_id UUID NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_session ON chat_history(session_id);
CREATE INDEX idx_chat_created_at ON chat_history(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE adherence_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Prescriptions policies
CREATE POLICY "Users can view own prescriptions" ON prescriptions
  FOR SELECT USING (auth.uid() = user_id OR share_token IS NOT NULL);

CREATE POLICY "Users can insert own prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON prescriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON prescriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Medications policies
CREATE POLICY "Users can view own medications" ON medications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications" ON medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications" ON medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications" ON medications
  FOR DELETE USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Adherence log policies
CREATE POLICY "Users can view own adherence" ON adherence_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own adherence" ON adherence_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Chat history policies
CREATE POLICY "Users can view own chat" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment transactions policies
CREATE POLICY "Users can view own payments" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & VIEWS
-- ============================================

-- Function to get user's active medications count
CREATE OR REPLACE FUNCTION get_active_medications_count(user_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM medications
  WHERE user_id = user_uuid AND is_active = true;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get upcoming reminders
CREATE OR REPLACE FUNCTION get_upcoming_reminders(user_uuid UUID, hours_ahead INTEGER DEFAULT 24)
RETURNS TABLE (
  id UUID,
  medicine_name TEXT,
  dosage TEXT,
  next_reminder_at TIMESTAMPTZ
) AS $$
  SELECT id, medicine_name, dosage, next_reminder_at
  FROM reminders
  WHERE user_id = user_uuid
    AND is_active = true
    AND next_reminder_at <= NOW() + (hours_ahead || ' hours')::INTERVAL
  ORDER BY next_reminder_at ASC
  LIMIT 10;
$$ LANGUAGE SQL SECURITY DEFINER;

-- View for user dashboard stats
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
  u.id AS user_id,
  COUNT(DISTINCT p.id) AS total_prescriptions,
  COUNT(DISTINCT m.id) FILTER (WHERE m.is_active = true) AS active_medications,
  COUNT(DISTINCT r.id) FILTER (WHERE r.is_active = true AND r.next_reminder_at::DATE = CURRENT_DATE) AS today_reminders,
  COUNT(DISTINCT a.id) FILTER (WHERE a.is_read = false) AS unread_alerts,
  COUNT(DISTINCT apt.id) FILTER (WHERE apt.appointment_date >= CURRENT_DATE AND apt.status = 'scheduled') AS upcoming_appointments
FROM users u
LEFT JOIN prescriptions p ON u.id = p.user_id
LEFT JOIN medications m ON u.id = m.user_id
LEFT JOIN reminders r ON u.id = r.user_id
LEFT JOIN alerts a ON u.id = a.user_id
LEFT JOIN appointments apt ON u.id = apt.user_id
GROUP BY u.id;

-- ============================================
-- SEED DATA (Optional - for development)
-- ============================================

-- Insert some sample drug interactions
INSERT INTO drug_interactions (drug_a, drug_b, severity, description, recommendation) VALUES
  ('Aspirin', 'Ibuprofen', 'moderate', 'Both are NSAIDs and can increase risk of stomach bleeding', 'Avoid taking together. Space doses at least 8 hours apart.'),
  ('Warfarin', 'Aspirin', 'severe', 'Significantly increases bleeding risk', 'Avoid combination unless specifically prescribed by doctor'),
  ('Metformin', 'Alcohol', 'moderate', 'Can cause lactic acidosis', 'Limit alcohol consumption while on Metformin'),
  ('Paracetamol', 'Alcohol', 'moderate', 'Increases risk of liver damage', 'Avoid alcohol while taking Paracetamol'),
  ('Lisinopril', 'Ibuprofen', 'moderate', 'May reduce effectiveness of blood pressure medication', 'Monitor blood pressure regularly')
ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETE!
-- ============================================
