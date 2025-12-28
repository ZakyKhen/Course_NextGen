# 🏗️ NextGen LMS - Project Roadmap & Requirements

מלווה פרויקט זה משמש כ"מצפן" לבניית פלטפורמת ה-LMS עבור Zaky. כל סיום משימה יסומן כאן כדי לשמור על סדר ודינמיות.

---

## 🔘 טבלת מעקב ביצועים (Project Checklist)

| קטגוריה | דרישה | סטטוס | הערות |
| :--- | :--- | :---: | :--- |
| **Infrastructure** | הקמת שלד Next.js 14 + Tailwind | ✅ | בוצע |
| **Infrastructure** | מבנה היררכי לקורסים (Python/Web/C#) | ✅ | בוצע |
| **Infrastructure** | סילבוס מבוזר (syllabus.json לכל קורס) | ✅ | בוצע |
| **Database** | חיבור Supabase DB + הגדרת טבלאות | ✅ | בוצע - מודל LMS שלם |
| **Omnichannel** | תמיכה ב-API אחיד ל-Web, WPF, MAUI | ⏳ | מתוכנן |
| **Admin UI** | דשבורד מבוסס DataGrid (Full/Compact) | ⏳ | בפיתוח |
| **Admin UI** | אינטראקציות CRUD (קליק ימני, דאבל קליק) | ⏳ | מתוכנן |
| **Auth** | מערכת תפקידים (Admin, Teacher, Student) | ⏳ | מתוכנן |
| **UI/UX** | ניהול מצבי יום/לילה (Dark Mode) | ⏳ | מתוכנן |
| **Core** | תצוגה חיה ל-CodeRunner (Web Preview) | ✅ | בוצע בסיסית |
| **Core** | מנוע מבחני הבנה וקוויזים | ⏳ | דורש אפיון |
| **Admin** | דשבורד ניהול (Zero-Code Management) | ⏳ | מתוכנן |
| **DevOps** | גיבוי היברידי ל-GitHub | ✅ | מוגדר מקומית |

---

## 🛠️ פירוט דרישות המערכת

### 1. דרישות טכניות (Technical)
- **Database Scalability:** שימוש ב-PostgreSQL לניהול אלפי תלמידים.
- **Security:** RLS (Row Level Security) להגנה על מידע אישי.
- **Performance:** אופטימיזציה של תמונות ושימוש ב-Server Components למהירות מקסימלית.
- **Storage:** ניהול קבצים מאובטח לתלמידים ולחומרי לימוד.

### 2. דרישות אפליקציה (Application)
- **Zero-Code Hub:** הוספת קורס/שיעור בלחיצת כפתור מה-Admin.
- **Theming:** שינוי צבעי מותג וגופנים דרך הגדרות מערכת.
- **Offline Ready:** תמיכה ב-PWA לעבודה ללא אינטרנט רציף.
- **State Persistence:** שמירת מצב עורך הקוד והתקדמות בכל רגע.

### 3. דרישות ניהול (Management)
- **Multitenancy:** הפרדה בין תכני מורים שונים (אם יידרש בעתיד).
- **Analytics:** מעקב התנהגות תלמידים (זמן בדף, ניסיונות הרצת קוד).
- **Communication:** מערכת התראות פנימית (Notifications).

### 4. דרישות איכות (QA)
- **Auto-Tests:** בדיקות יחידה למנועי הרצת הקוד.
- **Accessibility:** הנגשה מלאה בתקן WCAG 2.1.
- **Logging:** תיעוד שגיאות בזמן אמת (Error Tracking).

---

## 📅 אבני דרך להמשך (Milestones)
1. **שלב א':** חיבור Supabase והטמעת מערכת התחברות (Auth) עם תפקידים.
2. **שלב ב':** בניית ה-LMS Dashboard למורה ותלמיד.
3. **שלב ג':** מנוע המבחנים המשובץ ב-MDX.
4. **שלב ד':** עיצוב יוקרתי סופי, מצב לילה ו-Branding.
