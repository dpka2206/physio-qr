-- 001_initial.sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. doctors
CREATE TABLE doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    city TEXT,
    license_no TEXT,
    specialisation TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INT,
    gender TEXT CHECK (gender IN ('Male','Female','Other')),
    phone TEXT,
    diagnosis TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. exercises
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    body_part TEXT,
    category TEXT CHECK (category IN ('Strength','Stretch','Balance','Cardio')),
    default_yt_url TEXT,
    yt_thumbnail TEXT,
    yt_title TEXT,
    created_by UUID REFERENCES doctors(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','expired','archived')),
    qr_url TEXT,
    public_url TEXT,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. prescription_exercises
CREATE TABLE prescription_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    order_index INT NOT NULL,
    sets INT,
    reps INT,
    duration_seconds INT,
    yt_url TEXT,
    doctor_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_exercises ENABLE ROW LEVEL SECURITY;

-- doctors: users can only read/update their own row
CREATE POLICY "Doctors can view own record" ON doctors FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Doctors can update own record" ON doctors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Doctors can insert own record" ON doctors FOR INSERT WITH CHECK (auth.uid() = id);

-- patients: doctors can only CRUD their own patients (WHERE doctor_id = auth.uid())
CREATE POLICY "Doctors can view own patients" ON patients FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can insert own patients" ON patients FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update own patients" ON patients FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete own patients" ON patients FOR DELETE USING (auth.uid() = doctor_id);

-- prescriptions: doctors can only CRUD their own prescriptions (WHERE doctor_id = auth.uid())
CREATE POLICY "Doctors can view own prescriptions" ON prescriptions FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can insert own prescriptions" ON prescriptions FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update own prescriptions" ON prescriptions FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete own prescriptions" ON prescriptions FOR DELETE USING (auth.uid() = doctor_id);

-- prescription_exercises: accessible if the parent prescription belongs to auth.uid()
CREATE POLICY "Doctors can view own prescription exercises" ON prescription_exercises FOR SELECT USING (
    EXISTS (SELECT 1 FROM prescriptions WHERE id = prescription_exercises.prescription_id AND doctor_id = auth.uid())
);
CREATE POLICY "Doctors can insert own prescription exercises" ON prescription_exercises FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM prescriptions WHERE id = prescription_exercises.prescription_id AND doctor_id = auth.uid())
);
CREATE POLICY "Doctors can update own prescription exercises" ON prescription_exercises FOR UPDATE USING (
    EXISTS (SELECT 1 FROM prescriptions WHERE id = prescription_exercises.prescription_id AND doctor_id = auth.uid())
);
CREATE POLICY "Doctors can delete own prescription exercises" ON prescription_exercises FOR DELETE USING (
    EXISTS (SELECT 1 FROM prescriptions WHERE id = prescription_exercises.prescription_id AND doctor_id = auth.uid())
);

-- exercises: anyone can SELECT; INSERT/UPDATE only if created_by = auth.uid() OR created_by IS NULL
CREATE POLICY "Anyone can view exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Users can insert exercises" ON exercises FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);
CREATE POLICY "Users can update exercises" ON exercises FOR UPDATE USING (auth.uid() = created_by OR created_by IS NULL);

-- prescriptions: SELECT is also allowed with NO auth check (for public QR scan URL)
CREATE OR REPLACE FUNCTION get_public_prescription(p_id UUID)
RETURNS SETOF prescriptions
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM prescriptions WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Alternatively, allow public select using a specific token or just public unauthenticated read (not recommended normally, but requested: 'SELECT is also allowed with NO auth check (for public QR scan URL) — use a SECURITY DEFINER function for this')
-- A policy allowing public read of prescriptions might not be needed if they exclusively use the function get_public_prescription.
