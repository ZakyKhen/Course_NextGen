const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres:Supabzk003!@db.hkbeqdhzpkvewsvhqifa.supabase.co:5432/postgres"
});

const sql = `
-- 1. יצירת פונקציה שעוקפת את ה-RLS כדי לבדוק תפקיד (Security Definer)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. מחיקת המדיניות הישנה אם קיימת
DROP POLICY IF EXISTS "Admins full access" ON public.profiles;

-- 3. יצירת המדיניות החדשה והתקינה בעזרת הפונקציה
CREATE POLICY "Admins full access" ON public.profiles 
FOR ALL 
TO authenticated 
USING (public.is_admin());

-- 4. וידוי שהמשתמש שלך מוגדר כאדמין
UPDATE public.profiles SET role = 'admin', access_status = 'active' WHERE email = 'ort.zaky@gmail.com';
`;

async function fix() {
    try {
        await client.connect();
        console.log("Connected to database for fix.");
        await client.query(sql);
        console.log("RLS recursion fixed and access granted to Admin!");
    } catch (err) {
        console.error("Error during fix:", err);
    } finally {
        await client.end();
    }
}

fix();
