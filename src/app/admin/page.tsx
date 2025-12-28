"use client";

import React, { useEffect, useState, useRef, Fragment } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Search, Filter, MoreVertical, Edit2, Trash2, Shield, User,
    ChevronDown, ChevronUp, Download, Plus, Eye, EyeOff, Layout, List,
    CheckSquare, Square, Globe, Briefcase, Lock, Database, RefreshCw, AlertTriangle,
    Check, ChevronsUpDown, LogOut, CheckCircle, XCircle, Calendar
} from 'lucide-react';
import { Combobox, Transition } from '@headlessui/react';

type TabType = 'users' | 'courses' | 'enrollments';
type ViewMode = 'full' | 'compact';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    access_status: string;
    phone_prefix_id?: number | null;
    phone_body?: string;
    city_id?: number | null;
    gender_id?: number | null;
    address?: string;
    birth_date?: string;
    cities?: { city_he: string } | null;
    genders?: { name_he: string } | null;
    phone_prefixes?: { prefix: string } | any | null;
    extensions?: {
        bio?: string;
        notes?: string;
        github_url?: string;
        emergency_phone?: string;
    } | null;
    created_at: string;
    last_active_at?: string;
    [key: string]: any;
}

export default function AdminDashboard() {
    // Data State
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([
        { id: 1, city_he: 'תל אביב' }, { id: 2, city_he: 'ירושלים' }, { id: 3, city_he: 'חיפה' }
    ]);
    const [genders, setGenders] = useState<any[]>([
        { id: 1, name_he: 'זכר' }, { id: 2, name_he: 'נקבה' }, { id: 3, name_he: 'אחר' }
    ]);
    const [prefixes, setPrefixes] = useState<any[]>([]);
    const [cityQuery, setCityQuery] = useState('');
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [cityModalSearch, setCityModalSearch] = useState('');

    // UI State
    const [activeTab, setActiveTab] = useState<TabType>('users');
    const [viewMode, setViewMode] = useState<ViewMode>('full');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeEditTab, setActiveEditTab] = useState<'general' | 'personal' | 'academic' | 'admin'>('general');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingItem, setEditingItem] = useState<Profile | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: Profile | null } | null>(null);

    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'users') {
                // משיכת נתונים עם JOIN בזהירות (שימוש ב-Outer Joins)
                const { data: profileData, error: profileErr } = await supabase
                    .from('profiles')
                    .select(`
    *,
    cities(city_he),
    genders(name_he),
    phone_prefixes(prefix),
    extensions: profile_extensions(bio, notes, github_url, emergency_phone)
                    `)
                    .order('created_at', { ascending: false });

                if (profileErr) {
                    // אם השאילתה המורכבת נכשלת (למשל כי טבלה חסרה), ננסה למשוך נתונים בסיסיים
                    console.error("Advanced fetch failed, falling back to basic...", profileErr);
                    const { data: basicData, error: basicErr } = await supabase
                        .from('profiles')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (basicErr) throw basicErr;
                    setProfiles(basicData || []);
                    setError("חלק מהנתונים (מגדר/קידומת) חסרים בבסיס הנתונים. מומלץ להריץ 'תיקון DB'.");
                } else {
                    setProfiles(profileData || []);
                }

                // טעינת רשימות עזר בנפרד (כדי שלא יפילו את כל הדף)
                try {
                    // Supabase has a max row limit of 1000, so we need to paginate
                    let allCities: any[] = [];
                    let page = 0;
                    const pageSize = 1000;
                    let hasMore = true;

                    while (hasMore) {
                        const { data: cData } = await supabase
                            .from('cities')
                            .select('*')
                            .order('city_he')
                            .range(page * pageSize, (page + 1) * pageSize - 1);

                        if (cData && cData.length > 0) {
                            allCities = [...allCities, ...cData];
                            hasMore = cData.length === pageSize; // Continue if we got a full page
                            page++;
                        } else {
                            hasMore = false;
                        }
                    }

                    console.log('🏙️ Cities loaded from Supabase:', allCities.length);
                    if (allCities.length > 0) setCities(allCities);
                } catch (e) { console.warn("Cities load failed, using fallbacks"); }

                try {
                    const { data: gData } = await supabase.from('genders').select('*').order('name_he');
                    if (gData && gData.length > 0) setGenders(gData);
                } catch (e) { console.warn("Genders load failed, using fallbacks"); }

                try {
                    const { data: pData } = await supabase.from('phone_prefixes').select('*').order('prefix');
                    if (pData && pData.length > 0) setPrefixes(pData);
                } catch (e) { console.warn("Prefixes load failed, using fallbacks"); }

                // בדיקה אם הנתונים חסרים באמת
                const { data: checkG } = await supabase.from('genders').select('id').limit(1);
                const { data: checkC } = await supabase.from('cities').select('id').limit(1);

                if (!checkG?.length || !checkC?.length) {
                    setError("חלק מטבלאות העזר (ערים/מגדרים) עדיין לא מאוכלסות ב-DB. מומלץ להריץ 'תיקון מהיר'.");
                } else {
                    setError(null);
                }

            } else if (activeTab === 'courses') {
                const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                setCourses(data || []);
            }
        } catch (err: any) {
            console.error("Load Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // פונקציית גיבוי
    // פונקציית תיקון DB
    const handleRepairDB = async () => {
        setIsSaving(true);
        try {
            // 1. תיקון מגדרים
            const { data: g } = await supabase.from('genders').select('id').limit(1);
            if (!g || g.length === 0) {
                await supabase.from('genders').insert([
                    { name_he: 'זכר', name_en: 'Male' },
                    { name_he: 'נקבה', name_en: 'Female' },
                    { name_he: 'אחר', name_en: 'Other' },
                    { name_he: 'לא מעוניין לציין', name_en: 'Prefer not to say' }
                ]);
            }

            // 2. תיקון ערים (דוגמה)
            const { data: c } = await supabase.from('cities').select('id').limit(1);
            if (!c || c.length === 0) {
                await supabase.from('cities').insert([
                    { city_he: 'תל אביב', city_en: 'Tel Aviv' },
                    { city_he: 'ירושלים', city_en: 'Jerusalem' },
                    { city_he: 'חיפה', city_en: 'Haifa' },
                    { city_he: 'ראשון לציון', city_en: 'Rishon LeZion' },
                    { city_he: 'אשדוד', city_en: 'Ashdod' },
                    { city_he: 'נתניה', city_en: 'Netanya' },
                    { city_he: 'באר שבע', city_en: 'Beer Sheva' }
                ]);
            }

            // 3. תיקון קידומות
            const { data: p } = await supabase.from('phone_prefixes').select('id').limit(1);
            if (!p || p.length === 0) {
                await supabase.from('phone_prefixes').insert([
                    { prefix: '050' }, { prefix: '052' }, { prefix: '053' },
                    { prefix: '054' }, { prefix: '055' }, { prefix: '058' },
                    { prefix: '02' }, { prefix: '03' }, { prefix: '04' }, { prefix: '08' }, { prefix: '09' }
                ]);
            }

            alert("תיקון נתונים הושלם בהצלחה! מרענן...");
            loadData();
        } catch (err: any) {
            alert("שגיאה בתיקון: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportBackup = () => {
        const dataStr = JSON.stringify({ profiles, courses, timestamp: new Date().toISOString() }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `nxtg_backup_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...profiles].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    }).filter(p =>
        (p.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedIds.length === sortedData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sortedData.map(p => p.id));
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        setIsSaving(true);
        try {
            const updatePayload: any = {
                full_name: editingItem.full_name,
                role: editingItem.role,
                access_status: editingItem.access_status,
                phone_body: editingItem.phone_body,
                phone_prefix_id: editingItem.phone_prefix_id,
                city_id: editingItem.city_id,
                gender_id: editingItem.gender_id,
                birth_date: editingItem.birth_date,
                address: editingItem.address,
                updated_at: new Date().toISOString()
            };

            // הסרת שדות ריקים למניעת שגיאות סכימה
            Object.keys(updatePayload).forEach(key =>
                updatePayload[key] === undefined && delete updatePayload[key]
            );

            let { error: pErr } = await supabase
                .from('profiles')
                .update(updatePayload)
                .eq('id', editingItem.id);

            // טיפול בשגיאת עמודה חסרה (למשל gender_id) - שקט יותר
            if (pErr && pErr.message.includes('column') || pErr?.message.includes('not found')) {
                console.warn("Schema mismatch detected, retrying without problematic fields...", pErr.message);

                // הסרה של שדות שעלולים להיות חסרים ב-DB
                const safePayload = { ...updatePayload };
                delete safePayload.gender_id;
                delete safePayload.address;
                delete safePayload.birth_date;

                const { error: retryErr } = await supabase
                    .from('profiles')
                    .update(safePayload)
                    .eq('id', editingItem.id);
                pErr = retryErr;
            }

            if (pErr) throw pErr;

            // עדכון הרחבות - ננסה Upsert
            const extensionData = {
                profile_id: editingItem.id,
                bio: editingItem.extensions?.bio,
                github_url: editingItem.extensions?.github_url,
                notes: editingItem.extensions?.notes,
                emergency_phone: editingItem.extensions?.emergency_phone,
                updated_at: new Date().toISOString()
            };

            await supabase.from('profile_extensions').upsert(extensionData);

            setEditingItem(null);
            loadData();
        } catch (err: any) {
            alert("שגיאה בעדכון: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const calculateAge = (birthDate: string | null | undefined) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getAgeBadge = (age: number | null) => {
        if (age === null) return null;
        let styles = 'bg-slate-100 text-slate-600 border-slate-200';
        if (age < 18) styles = 'bg-emerald-50 text-emerald-600 border-emerald-100';
        else if (age < 40) styles = 'bg-blue-50 text-blue-600 border-blue-100';
        else styles = 'bg-indigo-50 text-indigo-600 border-indigo-100';

        return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border mr-2 ${styles} `}>גיל: {age}</span>;
    };

    const getRoleBadge = (role: string) => {
        const styles = role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
            role === 'teacher' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-700 border-slate-200';
        return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${styles} `}>{role}</span>;
    };

    return (
        <div className={`p-8 bg-slate-50 min-h-screen font-sans text-slate-900 overflow-hidden flex flex-col ${isMaximized ? 'fixed inset-0 z-[100] p-0' : 'h-screen'} `} dir="rtl">
            <div className={`${isMaximized ? 'w-full h-full p-4' : 'max-w-[1600px] mx-auto w-full'} flex flex-col flex-grow`}>

                {!isMaximized && (
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
                                <Shield className="text-blue-600" size={40} />
                                NxtG Control Center
                            </h1>
                            <p className="text-slate-500 font-medium mr-11">Management Hub & Data Recovery</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleExportBackup} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <Download size={20} /> גיבוי נתונים
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                                <Plus size={20} /> משתמש חדש
                            </button>
                        </div>
                    </header>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 text-amber-800 font-bold">
                            <AlertTriangle size={20} />
                            <span>{error}</span>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    const sql = `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender_id INTEGER REFERENCES public.genders(id); \nINSERT INTO public.genders(name_he, name_en) VALUES('זכר', 'Male'), ('נקבה', 'Female'), ('אחר', 'Other') ON CONFLICT DO NOTHING; `;
                                    navigator.clipboard.writeText(sql);
                                    alert("קוד ה-SQL הועתק! הדבק אותו ב-SQL Editor בלוח הבקרה של Supabase והרץ (Run).");
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-blue-700 flex items-center gap-2 shadow-sm"
                            >
                                <Database size={16} /> העתק קוד לתיקון DB
                            </button>
                            <button onClick={handleRepairDB} className="bg-amber-600 text-white px-4 py-2 rounded-xl font-black text-sm hover:bg-amber-700 flex items-center gap-2 shadow-sm">
                                <RefreshCw size={16} /> נסה תיקון מהיר
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-3 p-1 bg-slate-200/50 rounded-2xl border border-slate-200">
                        {['users', 'courses', 'enrollments'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as TabType)}
                                className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'} `}
                            >
                                <User size={18} /> {tab === 'users' ? 'משתמשים' : tab === 'courses' ? 'קורסים' : 'הרשמות'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold transition-all ${isMaximized ? 'bg-amber-600 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'} `}
                        >
                            {isMaximized ? (
                                <><List size={20} /> מזער תצוגה</>
                            ) : (
                                <><Layout size={20} /> מסך מלא</>
                            )}
                        </button>

                        <div className="flex p-1 bg-slate-200/50 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setViewMode('full')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'full' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'} `}
                                title="תצוגה מלאה"
                            >
                                <Layout size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('compact')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'} `}
                                title="תצוגה מצומצמת"
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200 mb-6 flex justify-between items-center shadow-sm">
                    <div className="relative w-1/3">
                        <Search className="absolute right-4 top-1/2-translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="חיפוש חופשי..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* DataGrid */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex-grow flex flex-col relative min-h-0">
                    <div className="overflow-auto flex-grow relative scrollbar-thin">
                        <table className="w-full text-right border-collapse min-w-[1200px]">
                            <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm font-black text-[10px] text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 w-12 text-center sticky right-0 bg-slate-50 z-30 border-b border-slate-200">
                                        <button onClick={toggleSelectAll} className="p-1 text-slate-400 hover:text-blue-600">
                                            {selectedIds.length === sortedData.length ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                    </th>
                                    <th className="p-4 text-right border-b border-slate-200 min-w-[150px]">שם מלא</th>
                                    {viewMode === 'full' && (
                                        <>
                                            <th className="p-4 text-right border-b border-slate-200 min-w-[200px]">דואר אלקטרוני</th>
                                            <th className="p-4 text-right border-b border-slate-200 w-32 font-black text-blue-600">נייד</th>
                                            <th className="p-4 text-right border-b border-slate-200 w-28">עיר</th>
                                            <th className="p-4 text-right border-b border-slate-200 w-24">מגדר</th>
                                            <th className="p-4 text-right border-b border-slate-200 w-32">תאריך לידה</th>
                                        </>
                                    )}
                                    <th className="p-4 text-right border-b border-slate-200 w-28">תפקיד</th>
                                    <th className="p-4 text-center border-b border-slate-200 w-20">פעולות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={10} className="p-20 text-center font-bold text-slate-400 italic">טוען נתונים מהענן...</td></tr>
                                ) : sortedData.map(p => (
                                    <tr
                                        key={p.id}
                                        className="group hover:bg-blue-50/40 transition-all text-sm"
                                        onDoubleClick={() => { setEditingItem({ ...p }); setActiveEditTab('general'); }}
                                    >
                                        <td className="p-4 text-center sticky right-0 bg-white/80 backdrop-blur-sm z-10 group-hover:bg-blue-50/80"><Square size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors mx-auto" /></td>
                                        <td className="p-4 font-black text-slate-800 truncate max-w-[150px]">{p.full_name || 'ללא שם'}</td>
                                        {viewMode === 'full' && (
                                            <>
                                                <td className="p-4 text-slate-500 font-medium truncate max-w-[200px]">{p.email}</td>
                                                <td className="p-4 text-slate-600 font-bold" dir="ltr">
                                                    {(() => {
                                                        const prefixObj = (p.phone_prefixes as any)?.prefix || (Array.isArray(p.phone_prefixes) ? (p.phone_prefixes as any)[0]?.prefix : null);
                                                        const fallbackPrefix = prefixes.find(pr => pr.id === p.phone_prefix_id)?.prefix;
                                                        return (prefixObj || fallbackPrefix || '---') + '-' + (p.phone_body || '-------');
                                                    })()}
                                                </td>
                                                <td className="p-4 text-slate-500 font-medium">
                                                    {p.cities?.city_he || cities.find(c => c.id === p.city_id)?.city_he || <span className="text-slate-300 italic">לא הוגדר</span>}
                                                </td>
                                                <td className="p-4 text-slate-500 font-medium">
                                                    {p.genders?.name_he || genders.find(g => g.id === p.gender_id)?.name_he || <span className="text-slate-300 italic">לא מוגדר</span>}
                                                </td>
                                                <td className="p-4 text-slate-500 font-medium">
                                                    <div className="flex items-center">
                                                        {p.birth_date ? new Date(p.birth_date).toLocaleDateString('he-IL') : <span className="text-slate-300 italic">לא הוגדר</span>}
                                                        {calculateAge(p.birth_date) !== null && getAgeBadge(calculateAge(p.birth_date))}
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                        <td className="p-4">{getRoleBadge(p.role)}</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => { setEditingItem({ ...p }); setActiveEditTab('general'); }} className="p-2 text-slate-400 hover:text-amber-600 bg-white rounded-lg shadow-sm border border-slate-100 transition-all hover:scale-110 active:scale-95">
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex gap-6">
                            <span>ONLINE 🟢</span>
                            <span>DATABASE: {profiles.length > 0 ? 'SYNCED' : 'NO DATA'}</span>
                            <button onClick={loadData} className="hover:text-blue-600 flex items-center gap-1">
                                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> REFRESH
                            </button>
                        </div>
                        <div>{sortedData.length} USERS LOADED</div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-[200] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <form onSubmit={handleUpdateProfile} className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic">עריכת משתמש 🏛️</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">{editingItem.email}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setEditingItem(null)} className="text-slate-300 hover:text-slate-900 text-3xl font-light">&times;</button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 p-2 bg-slate-100 border-b border-slate-200">
                            {[
                                { id: 'general', label: 'כללי', icon: <User size={16} /> },
                                { id: 'personal', label: 'אישי', icon: <Globe size={16} /> },
                                { id: 'academic', label: 'מקצועי', icon: <Briefcase size={16} /> },
                                { id: 'admin', label: 'אדמין', icon: <Lock size={16} /> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveEditTab(tab.id as any)}
                                    className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${activeEditTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'} `}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 overflow-y-auto min-h-[400px]">
                            {activeEditTab === 'general' && (
                                <div className="space-y-6 animate-in slide-in-from-left-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">שם מלא</label>
                                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={editingItem.full_name || ''} onChange={(e) => setEditingItem({ ...editingItem, full_name: e.target.value })} required />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="block text-[11px] font-black text-blue-600 uppercase tracking-widest text-right">הגדרות נייד</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] text-slate-400 mb-1">קידומת</label>
                                                    <select
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 font-bold outline-none cursor-pointer focus:border-blue-500/20 transition-all text-center"
                                                        value={editingItem.phone_prefix_id || ''}
                                                        onChange={(e) => setEditingItem({ ...editingItem, phone_prefix_id: e.target.value ? parseInt(e.target.value) : null })}
                                                    >
                                                        <option value="">בחר...</option>
                                                        {prefixes.map(p => <option key={p.id} value={p.id}>{p.prefix}</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] text-slate-400 mb-1">מספר נייד</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="7 ספרות"
                                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-blue-500/20 transition-all font-mono"
                                                        value={editingItem.phone_body || ''}
                                                        onChange={(e) => setEditingItem({ ...editingItem, phone_body: e.target.value })}
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">עיר מגורים</label>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">עיר מגורים</label>
                                            <div
                                                onClick={() => { setIsCityModalOpen(true); setCityModalSearch(''); }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none cursor-pointer hover:border-blue-500 hover:bg-white transition-all flex justify-between items-center group"
                                            >
                                                <span className={editingItem.city_id ? 'text-slate-900' : 'text-slate-400'}>
                                                    {editingItem.city_id ? (cities.find(c => c.id === editingItem.city_id)?.city_he || 'עיר לא מוכרת') : 'בחר עיר מהרשימה...'}
                                                </span>
                                                <Search size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* City Selection Modal */}
                            {isCityModalOpen && (
                                <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-100">
                                        <div className="p-6 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                                    <Globe className="text-blue-600" size={24} />
                                                    בחירת עיר מגורים
                                                </h3>
                                                <button onClick={() => setIsCityModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-800">
                                                    <XCircle size={24} />
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                                <input
                                                    type="text"
                                                    placeholder="הקלד שם עיר לחיפוש..."
                                                    autoFocus
                                                    className="w-full bg-white border border-slate-200 rounded-xl pr-12 pl-4 py-3 font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-lg"
                                                    value={cityModalSearch}
                                                    onChange={(e) => setCityModalSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="overflow-y-auto p-2 scrollbar-thin">
                                            {cities.filter(c => c.city_he.includes(cityModalSearch)).length === 0 ? (
                                                <div className="text-center py-10 text-slate-400">
                                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Search size={32} className="opacity-50" />
                                                    </div>
                                                    <p className="font-bold">לא נמצאו ערים תואמות ל-"{cityModalSearch}"</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-1">
                                                    {cities
                                                        .filter(c => c.city_he.includes(cityModalSearch))
                                                        .sort((a, b) => {
                                                            // Prioritize startsWith
                                                            const aStarts = a.city_he.startsWith(cityModalSearch);
                                                            const bStarts = b.city_he.startsWith(cityModalSearch);
                                                            if (aStarts && !bStarts) return -1;
                                                            if (!aStarts && bStarts) return 1;
                                                            return 0;
                                                        })
                                                        .slice(0, 5000) // Show up to 5000 matches to keep it fast
                                                        .map(city => (
                                                            <button
                                                                key={city.id}
                                                                onClick={() => {
                                                                    setEditingItem({ ...editingItem, city_id: city.id });
                                                                    setIsCityModalOpen(false);
                                                                }}
                                                                className={`p-4 rounded-xl text-right font-bold transition-all flex justify-between items-center group ${editingItem.city_id === city.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'hover:bg-slate-50 text-slate-700 border border-transparent'}`}
                                                            >
                                                                <span>{city.city_he}</span>
                                                                {editingItem.city_id === city.id && <CheckCircle size={20} className="text-blue-600" />}
                                                                {editingItem.city_id !== city.id && <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-blue-400 transition-colors" />}
                                                            </button>
                                                        ))}
                                                    {cities.filter(c => c.city_he.includes(cityModalSearch)).length > 100 && (
                                                        <div className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                            יש עוד תוצאות... נסה לדייק בחיפוש
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold">
                                            מציג {cities.length} ערים ויישובים
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeEditTab === 'personal' && (
                                <div className="space-y-6 animate-in slide-in-from-left-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-xs font-black text-slate-500 uppercase">תאריך לידה</label>
                                                {calculateAge(editingItem.birth_date) !== null && (
                                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100">
                                                        גיל נוכחי: {calculateAge(editingItem.birth_date)}
                                                    </span>
                                                )}
                                            </div>
                                            <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none" value={editingItem.birth_date || ''} onChange={(e) => setEditingItem({ ...editingItem, birth_date: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">מגדר</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none cursor-pointer" value={editingItem.gender_id || ''} onChange={(e) => setEditingItem({ ...editingItem, gender_id: e.target.value ? parseInt(e.target.value) : null })}>
                                                <option value="">בחר...</option>
                                                {genders.map(g => <option key={g.id} value={g.id}>{g.name_he}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">כתובת</label>
                                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none" value={editingItem.address || ''} onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeEditTab === 'academic' && (
                                <div className="space-y-6 animate-in slide-in-from-left-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">GitHub Profile</label>
                                        <input type="url" placeholder="https://github.com/username" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none text-blue-600 underline" value={editingItem.extensions?.github_url || ''} onChange={(e) => setEditingItem({ ...editingItem, extensions: { ...editingItem.extensions, github_url: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">ביוגרפיה / תיאור</label>
                                        <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none min-h-[120px]" value={editingItem.extensions?.bio || ''} onChange={(e) => setEditingItem({ ...editingItem, extensions: { ...editingItem.extensions, bio: e.target.value } })} />
                                    </div>
                                </div>
                            )}

                            {activeEditTab === 'admin' && (
                                <div className="space-y-6 animate-in slide-in-from-left-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">תפקיד מערכת</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none cursor-pointer" value={editingItem.role} onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}>
                                                <option value="student">תלמיד</option>
                                                <option value="teacher">מרצה</option>
                                                <option value="admin">מנהל</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">סטטוס גישה</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none cursor-pointer" value={editingItem.access_status} onChange={(e) => setEditingItem({ ...editingItem, access_status: e.target.value })}>
                                                <option value="active">פעיל</option>
                                                <option value="pending_approval">ממתין לאישור</option>
                                                <option value="denied">חסום / נדחה</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">הערות אדמין (פנימיות)</label>
                                            <textarea className="w-full bg-slate-50 border-amber-50 rounded-2xl px-5 py-4 font-bold outline-none min-h-[100px] border border-amber-100" value={editingItem.extensions?.notes || ''} placeholder="כתוב הערות ניהוליות כאן..." onChange={(e) => setEditingItem({ ...editingItem, extensions: { ...editingItem.extensions, notes: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-100 border-t border-slate-200 flex gap-4">
                            <button type="submit" disabled={isSaving} className="flex-grow bg-blue-600 text-white font-black py-5 rounded-[24px] shadow-xl hover:bg-blue-500 transition-all text-lg">
                                {isSaving ? 'שומר שינויים...' : 'עדכן פרופיל'}
                            </button>
                            <button type="button" onClick={() => setEditingItem(null)} className="px-10 text-slate-500 font-bold hover:bg-slate-200 rounded-[24px]">ביטול</button>
                        </div>
                    </form >
                </div >
            )
            }
        </div >
    );
}
