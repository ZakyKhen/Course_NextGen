import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const MasterLayout = ({ children }: LayoutProps) => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
            {/* Dynamic Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-white">
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                יחידה 1: יסודות
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg">
                                ניהול משתמש
                            </button>
                        </div>
                    </div>
                </header>

                <article className="max-w-4xl mx-auto p-8 lg:p-12 prose prose-slate prose-blue prose-lg">
                    {children}
                </article>
            </main>
        </div>
    );
};

export default MasterLayout;
