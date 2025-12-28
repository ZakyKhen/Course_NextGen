require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

const sql = `
-- *** שלב 1: טבלאות עזר מנורמלות ***
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.cities CASCADE;
DROP TABLE IF EXISTS public.phone_prefixes CASCADE;

CREATE TABLE public.cities (
    id SERIAL PRIMARY KEY,
    city_he TEXT NOT NULL UNIQUE
);

CREATE TABLE public.genders (
    id SERIAL PRIMARY KEY,
    name_he TEXT NOT NULL UNIQUE,
    name_en TEXT
);

CREATE TABLE public.phone_prefixes (
    id SERIAL PRIMARY KEY,
    prefix TEXT NOT NULL UNIQUE
);

INSERT INTO public.phone_prefixes (prefix) VALUES ('050'), ('052'), ('053'), ('054'), ('058'), ('077'), ('02'), ('03');
INSERT INTO public.cities (city_he) VALUES ('תל אביב-יפו'), ('ירושלים'), ('חיפה'), ('ראשון לציון'), ('נתניה'), ('אשדוד');
INSERT INTO public.genders (name_he) VALUES ('זכר'), ('נקבה'), ('אחר'), ('לא מעוניין לציין');

-- *** שלב 2: טבלת ה-Profiles המלאה ***
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    id_number TEXT UNIQUE, 
    full_name TEXT,
    email TEXT UNIQUE,
    birth_date DATE,
    city_id INTEGER REFERENCES public.cities(id),
    gender_id INTEGER REFERENCES public.genders(id),
    phone_prefix_id INTEGER REFERENCES public.phone_prefixes(id),
    phone_body TEXT,
    address TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    access_status TEXT DEFAULT 'pending_approval' CHECK (access_status IN ('pending_approval', 'active', 'expired', 'denied')),
    access_expires_at TIMESTAMP WITH TIME ZONE,
    license_key TEXT,
    is_active BOOLEAN DEFAULT true,
    terms_accepted BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    role_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- *** שלב 3: טבלת הרחבות (Extensions) ***
CREATE TABLE public.profile_extensions (
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    bio TEXT,
    notes TEXT,
    github_url TEXT,
    emergency_phone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- *** שלב 3: אבטחה (RLS & Policies) ***
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins full access" ON public.profiles USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Users update own info except role" ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    (role = (SELECT role FROM (SELECT role FROM public.profiles WHERE id = auth.uid()) AS r))
);

-- *** שלב 4: טריגרים חכמים ***
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, access_status)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''), 'student', 'pending_approval');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.ensure_last_admin() 
RETURNS TRIGGER AS $$
DECLARE admin_count INTEGER;
BEGIN
    SELECT count(*) INTO admin_count FROM public.profiles WHERE role = 'admin' AND deleted_at IS NULL;
    IF (OLD.role = 'admin' AND (NEW.role != 'admin' OR NEW.deleted_at IS NOT NULL) AND admin_count <= 1) THEN
        RAISE EXCEPTION 'מחסום אבטחה: לא ניתן לבטל או למחוק את האדמין האחרון במערכת!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_last_admin ON public.profiles;
CREATE TRIGGER check_last_admin
  BEFORE UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.ensure_last_admin();
`;

async function setup() {
    try {
        await client.connect();
        console.log("Connected to Supabase Postgres.");
        await client.query(sql);
        console.log("Database Schema created successfully!");
    } catch (err) {
        console.error("Error setting up database:", err);
    } finally {
        await client.end();
    }
}

setup();
