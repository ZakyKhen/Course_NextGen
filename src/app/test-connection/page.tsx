"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ConnectionTest() {
    const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
    const [message, setMessage] = useState('בודק חיבור לסופהבייס...');

    useEffect(() => {
        async function checkConnection() {
            try {
                // בודקים אם אפשר לקרוא נתונים בסיסיים (אפילו אם אין טבלאות עדיין)
                const { error } = await supabase.from('non_existent_table_just_for_test').select('*').limit(1);

                // אם קיבלנו שגיאה של "טבלה לא קיימת" זה סימן מעולה - זה אומר שהתחברנו בהצלחה לסופהבייס!
                if (error && error.code === '42P01') {
                    setStatus('success');
                    setMessage('החיבור הצליח! האפליקציה מדברת עם סופהבייס בהצלחה. ✅');
                } else if (error) {
                    throw error;
                }
            } catch (err: any) {
                setStatus('error');
                setMessage(`שגיאת חיבור: ${err.message}`);
            }
        }
        checkConnection();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4 rtl">
            <div className={`p-8 rounded-2xl shadow-2xl border-2 ${status === 'success' ? 'border-green-500 bg-green-900/20' :
                    status === 'error' ? 'border-red-500 bg-red-900/20' : 'border-blue-500'
                }`}>
                <h1 className="text-2xl font-bold mb-4">בדיקת תקשורת Supabase</h1>
                <p className="text-xl">{message}</p>
                {status === 'success' && (
                    <p className="mt-4 text-sm text-slate-400">
                        עכשיו אתה יכול להיות רגוע - הצינור מוכן להעברת נתונים!
                    </p>
                )}
            </div>
        </div>
    );
}
