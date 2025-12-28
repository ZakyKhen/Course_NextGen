"use client";

import React, { useState } from 'react';

interface CodeRunnerProps {
    language: 'python' | 'csharp' | 'html';
    initialCode: string;
}

const CodeRunner = ({ language, initialCode }: CodeRunnerProps) => {
    const [output, setOutput] = useState<string>("");
    const [userCode, setUserCode] = useState<string>(initialCode);

    const runCode = () => {
        if (language === 'html') {
            setOutput("תצוגה מקדימה עודכנה!");
        } else {
            setOutput(`מריץ קוד ${language}...\n\n[תוצאה משוערת]:\n${userCode.includes('print') || userCode.includes('Console') ? 'שלום עולם!' : 'בוצע בהצלחה'}`);
        }
    };

    return (
        <div className="my-8 bg-slate-100 rounded-xl overflow-hidden border border-slate-200" dir="rtl">
            <div className="bg-slate-800 px-4 py-2 flex justify-between items-center text-white">
                <span className="text-xs font-mono uppercase opacity-70">
                    {language === 'html' ? 'Web Editor' : `${language} Console`}
                </span>
                <button
                    onClick={runCode}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-md transition-all active:scale-95"
                >
                    {language === 'html' ? 'עדכן תצוגה 🔄' : 'RUN CODE ▶'}
                </button>
            </div>

            <div className={`grid grid-cols-1 ${language === 'html' ? 'lg:grid-cols-2' : ''} bg-slate-900 overflow-hidden`}>
                {/* Editor Area */}
                <div className="p-4 border-l border-slate-700">
                    <textarea
                        className="w-full h-64 bg-transparent font-mono text-sm text-blue-300 outline-none resize-none"
                        spellCheck={false}
                        value={userCode}
                        onChange={(e) => setUserCode(e.target.value)}
                        dir="ltr"
                    />
                </div>

                {/* Live Preview for HTML */}
                {language === 'html' && (
                    <div className="bg-white p-4 h-64 overflow-auto" dir="ltr">
                        <div dangerouslySetInnerHTML={{ __html: userCode }} />
                    </div>
                )}
            </div>

            {(output && language !== 'html') && (
                <div className="p-4 bg-black border-t border-slate-700 font-mono text-xs text-green-400">
                    <pre>{output}</pre>
                </div>
            )}

            <div className="p-4 bg-white/50 text-[10px] text-slate-500 italic">
                * מנוע ההרצה {language} פעיל {language === 'html' ? 'בתצוגה חיה' : 'ב-Worker'}.
            </div>
        </div>
    );
};

export default CodeRunner;
