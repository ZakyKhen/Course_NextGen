const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

const sql = `
-- 1. יצירת טבלת מגדרים
CREATE TABLE IF NOT EXISTS public.genders (
    id SERIAL PRIMARY KEY,
    name_he TEXT NOT NULL UNIQUE
);

INSERT INTO public.genders (name_he) VALUES ('זכר'), ('נקבה'), ('אחר') ON CONFLICT DO NOTHING;

-- 2. עדכון טבלת פרופילים עם שדות ליבה חסרים
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender_id INTEGER REFERENCES public.genders(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 3. יצירת טבלת הרחבות (למידע נוסף ופחות בשימוש יומיומי)
CREATE TABLE IF NOT EXISTS public.profile_extensions (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    notes TEXT,
    github_url TEXT,
    emergency_phone TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. יצירת שורת הרחבה לכל פרופיל קיים
INSERT INTO public.profile_extensions (profile_id)
SELECT id FROM public.profiles
ON CONFLICT DO NOTHING;

-- 5. טריגר ליצירה אוטומטית של הרחבה לכל משתמש חדש
CREATE OR REPLACE FUNCTION public.handle_new_profile_extension()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile_extensions (profile_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_extension ON public.profiles;
CREATE TRIGGER on_profile_created_extension
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile_extension();

-- 6. אבטחה לטבלת ההרחבות
ALTER TABLE public.profile_extensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access to extensions" ON public.profile_extensions USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
CREATE POLICY "Users view own extensions" ON public.profile_extensions FOR SELECT USING (auth.uid() = profile_id);
`;

async function evolve() {
    try {
        await client.connect();
        console.log("Connected to Supabase. Evolving Schema...");
        await client.query(sql);
        console.log("✅ DATABASE SCHEMA EVOLVED SUCCESSFULLY!");
    } catch (err) {
        console.error("❌ Error evolving database:", err);
    } finally {
        await client.end();
    }
}

evolve();
