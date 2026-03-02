# MedConnect AI - Database Schema

This document outlines the database structure for the MedConnect AI project. The system uses **PostgreSQL** hosted on **Supabase** with Row-Level Security (RLS) enabled.

---

## 🏗️ Core Tables

### 1. `users`
Extends Supabase Auth users with healthcare and subscription metadata.
- **id**: `UUID` (Primary Key, references `auth.users`)
- **email**: `TEXT` (Unique)
- **full_name**: `TEXT`
- **phone**: `TEXT`
- **date_of_birth**: `DATE`
- **gender**: `TEXT` (male, female, other, prefer_not_to_say)
- **blood_group**: `TEXT`
- **subscription_tier**: `TEXT` (free, pro, enterprise)
- **subscription_status**: `TEXT` (active, cancelled, expired)
- **stripe_customer_id**: `TEXT` (Unique)

### 2. `prescriptions`
Stores uploaded prescription files and processed OCR data.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID` (References `users`)
- **file_name**: `TEXT`
- **file_url**: `TEXT`
- **raw_text**: `TEXT` (Full OCR output)
- **extracted_medicines**: `JSONB` (Structured medicine list)
- **status**: `TEXT` (pending, processing, processed, failed)

### 3. `medications`
Individual medications extracted from prescriptions or added manually.
- **id**: `UUID` (Primary Key)
- **user_id**: `UUID` (References `users`)
- **name**: `TEXT`
- **dosage**: `TEXT`
- **frequency**: `TEXT`
- **start_date**: `DATE`
- **end_date**: `DATE`
- **is_active**: `BOOLEAN`
- **stock_quantity**: `INTEGER`

### 4. `reminders`
Scheduled alerts for specific medications.
- **id**: `UUID` (Primary Key)
- **medication_id**: `UUID` (References `medications`)
- **medicine_name**: `TEXT`
- **time**: `TIME`
- **next_reminder_at**: `TIMESTAMPTZ`
- **is_active**: `BOOLEAN`

---

## 📊 Supporting Tables

### 5. `adherence_log`
Tracks when users take or skip their medications.
- **user_id**, **medication_id**, **reminder_id**
- **taken_at**: `TIMESTAMPTZ`
- **skipped**: `BOOLEAN`
- **notes**: `TEXT`

### 6. `appointments`
Manages doctor visits and hospital reminders.
- **doctor_name**, **specialty**, **hospital**
- **appointment_date**: `DATE`
- **appointment_time**: `TIME`
- **status**: `TEXT` (scheduled, completed, cancelled, etc.)

### 7. `alerts`
System-wide notifications (interaction warnings, low stock, etc.).
- **type**: `TEXT` (reminder, interaction, expiry, etc.)
- **severity**: `TEXT` (info, warning, error, success)
- **is_read**: `BOOLEAN`

### 8. `drug_interactions`
A cache of known dangerous drug combinations.
- **drug_a**, **drug_b**: `TEXT`
- **severity**: `TEXT`
- **description**: `TEXT`

### 9. `payment_transactions`
History of Stripe subscription and payment intents.
- **stripe_payment_intent_id**: `TEXT`
- **amount**: `INTEGER` (in cents)
- **status**: `TEXT`

### 10. `chat_history`
Contextual memory for the AI medical assistant.
- **role**: `TEXT` (user, bot, system)
- **message**: `TEXT`
- **session_id**: `UUID`

---

## 🔐 Security & Optimization

- **Row Level Security (RLS)**: Every table has policies ensuring users can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` their own data.
- **Indexes**: Optimized for fast lookups on `user_id`, `status`, and `next_reminder_at`.
- **Triggers**: Automated `updated_at` timestamp management for all core tables.
- **Functions**:
    - `get_active_medications_count`: Returns count of active meds for a user.
    - `get_upcoming_reminders`: Fetches the next 10 reminders within a specified timeframe.
- **Views**: 
    - `user_dashboard_stats`: Aggregates cross-table data for the main dashboard view.
