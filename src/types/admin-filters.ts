// Filter state types
export interface FilterState {
    search: string;
    roles: string[];
    statuses: string[];
    genders: number[];
    cities: number[];
    ageRange: [number, number] | null;
    dateRange: [Date | null, Date | null];
    missingCity: boolean;
    incompleteProfile: boolean;
}

// Sort state types
export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
    priority: number;
}

// Saved view types
export interface SavedView {
    id: string;
    user_id?: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    filters: FilterState;
    sorting: SortConfig[];
    is_default: boolean;
    is_public: boolean;
    created_at?: Date;
    updated_at?: Date;
}

// Preset view types
export interface PresetView {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    filters: Partial<FilterState>;
    sorting: SortConfig[];
}

// Available icons and colors
export const AVAILABLE_ICONS = [
    '👥', '🎓', '👨‍🏫', '⭐', '🔥', '📊', '🎯', '💼', '🌟', '📌'
] as const;

export const AVAILABLE_COLORS = [
    'blue', 'green', 'yellow', 'red', 'purple', 'pink', 'indigo', 'gray'
] as const;

export type ViewIcon = typeof AVAILABLE_ICONS[number];
export type ViewColor = typeof AVAILABLE_COLORS[number];

// Default filter state
export const DEFAULT_FILTERS: FilterState = {
    search: '',
    roles: [],
    statuses: [],
    genders: [],
    cities: [],
    ageRange: null,
    dateRange: [null, null],
    missingCity: false,
    incompleteProfile: false
};

// Preset views configuration
export const PRESET_VIEWS: PresetView[] = [
    {
        id: 'pending-approval',
        name: 'ממתינים לאישור',
        description: 'כל המשתמשים ממתינים לאישור',
        icon: '⏳',
        color: 'yellow',
        filters: { statuses: ['pending_approval'] },
        sorting: [{ field: 'created_at', direction: 'desc', priority: 1 }]
    },
    {
        id: 'new-this-week',
        name: 'הצטרפו השבוע',
        description: 'משתמשים שנרשמו ב-7 ימים אחרונים',
        icon: '🆕',
        color: 'green',
        filters: {
            dateRange: [
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                new Date()
            ]
        },
        sorting: [{ field: 'created_at', direction: 'desc', priority: 1 }]
    },
    {
        id: 'inactive-30',
        name: 'לא פעילים 30+ ימים',
        description: 'משתמשים שלא התחברו חודש',
        icon: '💤',
        color: 'gray',
        filters: {},
        sorting: [{ field: 'last_active_at', direction: 'asc', priority: 1 }]
    },
    {
        id: 'incomplete-profile',
        name: 'פרופיל לא מלא',
        description: 'משתמשים עם שדות חסרים',
        icon: '⚠️',
        color: 'red',
        filters: { incompleteProfile: true },
        sorting: [{ field: 'created_at', direction: 'desc', priority: 1 }]
    },
    {
        id: 'active-students',
        name: 'תלמידים פעילים',
        description: 'תלמידים עם סטטוס פעיל',
        icon: '🎓',
        color: 'blue',
        filters: { roles: ['student'], statuses: ['active'] },
        sorting: [{ field: 'full_name', direction: 'asc', priority: 1 }]
    },
    {
        id: 'teaching-staff',
        name: 'צוות הוראה',
        description: 'מרצים ומנהלים',
        icon: '👨‍🏫',
        color: 'purple',
        filters: { roles: ['teacher', 'admin'] },
        sorting: [{ field: 'role', direction: 'asc', priority: 1 }]
    }
];
