const Sidebar = () => {
    // השתמש במידע זמני עד שנחבר את הטעינה הדינמית מה-DB
    const placeholderSyllabus = {
        courseTitle: "מרכז הלמידה - NextGen",
        units: []
    };

    return (
        <div className="w-80 h-screen bg-slate-900 text-white flex flex-col border-l border-slate-800" dir="rtl">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold text-blue-400">{placeholderSyllabus.courseTitle}</h1>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
                <p className="text-slate-500 text-sm">בחר קורס מהתפריט הראשי כדי לראות את השיעורים.</p>
            </nav>

            <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
                ניהול תלמידים פעיל &copy; 2024
            </div>
        </div>
    );
};

export default Sidebar;
