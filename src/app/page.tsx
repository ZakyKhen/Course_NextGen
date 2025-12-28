export default function Home() {
    return (
        <div className="space-y-8 py-10">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                    מרכז הלמידה - NextGen
                </h1>
                <p className="mt-4 text-xl text-slate-600">
                    שיטת לימוד מודולרית, גנרית ומאובטחת.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <h2 className="text-2xl font-bold text-blue-600 mb-2">קורס Python</h2>
                    <p className="text-slate-600">65 שיעורים, 11 יחידות, מעבדת קוד אינטראקטיבית.</p>
                </div>

                <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                    <h2 className="text-2xl font-bold text-purple-600 mb-2">קורס #C</h2>
                    <p className="text-slate-600">מבוא רב-שפתי עם מנוע הרצה מותאם.</p>
                </div>

                <div className="p-6 border border-orange-200 rounded-2xl bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                    <h2 className="text-2xl font-bold text-orange-600 mb-2">קורס WEB</h2>
                    <p className="text-slate-600">בניית אתרים מודרניים עם HTML & CSS ותצוגה חיה.</p>
                </div>
            </div>

            <div className="bg-blue-600 text-white p-8 rounded-3xl shadow-xl shadow-blue-200">
                <h3 className="text-xl font-bold mb-4">מדוע ה-Boilerplate החדש?</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100 text-sm">
                    <li className="flex items-center gap-2">✅ הפרדת תוכן מממשק</li>
                    <li className="flex items-center gap-2">✅ הגנה על קוד ותוכן (שרת-לקוח)</li>
                    <li className="flex items-center gap-2">✅ תמיכה באופליין (PWA)</li>
                    <li className="flex items-center gap-2">✅ ניהול תלמידים מרכזי</li>
                </ul>
            </div>
        </div>
    )
}
