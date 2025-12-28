export interface CourseRegistryItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    color: string;
    icon: string;
}

export const COURSE_REGISTRY: CourseRegistryItem[] = [
    {
        id: "python-master",
        slug: "python",
        title: "קורס Python",
        description: "65 שיעורים, 11 יחידות, מעבדת קוד אינטראקטיבית.",
        color: "blue",
        icon: "🐍"
    },
    {
        id: "csharp-intro",
        slug: "csharp",
        title: "קורס #C",
        description: "מבוא רב-שפתי עם מנוע הרצה מותאם.",
        color: "purple",
        icon: "🚀"
    },
    {
        id: "web-dev",
        slug: "web-dev",
        title: "קורס WEB",
        description: "בניית אתרים מודרניים עם HTML & CSS ותצוגה חיה.",
        color: "orange",
        icon: "🌐"
    }
];
