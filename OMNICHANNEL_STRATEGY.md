# 🌐 NxtG Omnichannel Architecture & UI/UX Strategy

מסמך זה מגדיר את העקרונות הארכיטקטוניים והממשקיים לפיתוח מערכת LMS רב-ערוצית, המיועדת לתמיכה מלאה בלקוחות Web, Desktop (WPF) ו-Mobile (MAUI).

---

## 🏛️ עקרונות הארכיטקטורה (Headless & API-First)

### 1. שרת מרכזי (Centralized Truth)
*   כל הלוגיקה העסקית והגישה למסד הנתונים מבוצעת דרך השרת (Supabase API).
*   הממשקים (Clients) הם "טיפשים" (Stateless) ומסתמכים על השרת לקבלת מצב הנתונים וביצוע פעולות.

### 2. תאימות חוצת-פלטפורמות (Cross-Platform Compatibility)
*   **Web:** Next.js 14 (Tailwind CSS).
*   **Desktop:** WPF / MAUI (C# .NET).
*   **Mobile:** MAUI (Android/iOS).
*   **Data Format:** כל התקשורת מתבצעת בפורמט JSON אחיד.

---

## 🖥️ מפרט Advanced Admin DataGrid

המערכת תכלול רכיב ניהול נתונים מתקדם התומך בסטנדרטים הבאים:

### 1. מצבי תצוגה (View Modes)
*   **Full Data View:** טבלה רחבה עם כל השדות, Sticky Headers, ו-Horizontal Scroll.
*   **Compact View:** תצוגה מצומצמת של שדות רלוונטיים (שם, תפקיד, טלפון).

### 2. דפוסי CRUD ואינטראקציה
*   **Context Menu:** תפריט לחיצה ימנית לביצוע פעולות מהירות.
*   **Action Column:** כפתור פעולות בצידי כל שורה.
*   **Double-Click:** עריכה מהירה בלחיצה כפולה.
*   **Bulk Actions:** בחירה מרובה וביצוע פעולות קבוצתיות.

### 3. חיפוש וסינון
*   **Column Filtering:** סינון ומיון מעל כל עמודה.
*   **Global Search:** חיפוש מבוסס AI או חיפוש טקסטואלי מהיר על כל השדות.

---

## 🤖 אינטגרציית AI ושיפורים עתידיים
*   שימוש ב-AI לזיהוי מקרי קצה (Edge Cases) בכל פלטפורמה.
*   אופטימיזציה של הנתונים הנשלחים לכל לקוח לפי סוג המכשיר (Device-Specific Optimization).
