import { SavedView, FilterState, SortConfig } from '@/types/admin-filters';

const STORAGE_KEYS = {
    SAVED_VIEWS: 'admin_saved_views',
    DEFAULT_VIEW: 'admin_default_view',
    LAST_VIEW: 'admin_last_view',
    VIEW_HISTORY: 'admin_view_history'
} as const;

// Save a view to localStorage
export function saveViewToLocal(view: SavedView): void {
    try {
        const views = getSavedViewsFromLocal();
        const existingIndex = views.findIndex(v => v.id === view.id);

        if (existingIndex >= 0) {
            views[existingIndex] = { ...view, updated_at: new Date() };
        } else {
            views.push({ ...view, created_at: new Date(), updated_at: new Date() });
        }

        localStorage.setItem(STORAGE_KEYS.SAVED_VIEWS, JSON.stringify(views));
    } catch (error) {
        console.error('Failed to save view to localStorage:', error);
    }
}

// Get all saved views from localStorage
export function getSavedViewsFromLocal(): SavedView[] {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SAVED_VIEWS);
        if (!data) return [];

        const views = JSON.parse(data) as SavedView[];
        // Convert date strings back to Date objects
        return views.map(v => ({
            ...v,
            created_at: v.created_at ? new Date(v.created_at) : undefined,
            updated_at: v.updated_at ? new Date(v.updated_at) : undefined,
            filters: {
                ...v.filters,
                dateRange: v.filters.dateRange.map(d => d ? new Date(d) : null) as [Date | null, Date | null]
            }
        }));
    } catch (error) {
        console.error('Failed to get saved views from localStorage:', error);
        return [];
    }
}

// Delete a view from localStorage
export function deleteViewFromLocal(viewId: string): void {
    try {
        const views = getSavedViewsFromLocal();
        const filtered = views.filter(v => v.id !== viewId);
        localStorage.setItem(STORAGE_KEYS.SAVED_VIEWS, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete view from localStorage:', error);
    }
}

// Set default view
export function setDefaultView(viewId: string | null): void {
    try {
        if (viewId) {
            localStorage.setItem(STORAGE_KEYS.DEFAULT_VIEW, viewId);
        } else {
            localStorage.removeItem(STORAGE_KEYS.DEFAULT_VIEW);
        }
    } catch (error) {
        console.error('Failed to set default view:', error);
    }
}

// Get default view ID
export function getDefaultViewId(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEYS.DEFAULT_VIEW);
    } catch (error) {
        console.error('Failed to get default view:', error);
        return null;
    }
}

// Save last used view
export function saveLastView(filters: FilterState, sorting: SortConfig[]): void {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_VIEW, JSON.stringify({ filters, sorting }));
    } catch (error) {
        console.error('Failed to save last view:', error);
    }
}

// Get last used view
export function getLastView(): { filters: FilterState; sorting: SortConfig[] } | null {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.LAST_VIEW);
        if (!data) return null;

        const view = JSON.parse(data);
        return {
            ...view,
            filters: {
                ...view.filters,
                dateRange: view.filters.dateRange.map((d: string | null) => d ? new Date(d) : null) as [Date | null, Date | null]
            }
        };
    } catch (error) {
        console.error('Failed to get last view:', error);
        return null;
    }
}

// View history management (for undo functionality)
const MAX_HISTORY_SIZE = 10;

export function addToViewHistory(filters: FilterState, sorting: SortConfig[]): void {
    try {
        const history = getViewHistory();
        history.push({ filters, sorting, timestamp: new Date() });

        // Keep only last MAX_HISTORY_SIZE items
        if (history.length > MAX_HISTORY_SIZE) {
            history.shift();
        }

        localStorage.setItem(STORAGE_KEYS.VIEW_HISTORY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to add to view history:', error);
    }
}

export function getViewHistory(): Array<{ filters: FilterState; sorting: SortConfig[]; timestamp: Date }> {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.VIEW_HISTORY);
        if (!data) return [];

        const history = JSON.parse(data);
        return history.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
            filters: {
                ...item.filters,
                dateRange: item.filters.dateRange.map((d: string | null) => d ? new Date(d) : null) as [Date | null, Date | null]
            }
        }));
    } catch (error) {
        console.error('Failed to get view history:', error);
        return [];
    }
}

export function getPreviousView(): { filters: FilterState; sorting: SortConfig[] } | null {
    try {
        const history = getViewHistory();
        if (history.length < 2) return null;

        // Remove current view
        history.pop();
        // Get previous view
        const previous = history.pop();

        // Update history
        localStorage.setItem(STORAGE_KEYS.VIEW_HISTORY, JSON.stringify(history));

        return previous ? { filters: previous.filters, sorting: previous.sorting } : null;
    } catch (error) {
        console.error('Failed to get previous view:', error);
        return null;
    }
}

// Export view to JSON file
export function exportViewToJSON(view: SavedView): void {
    try {
        const dataStr = JSON.stringify(view, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-view-${view.name.replace(/\s+/g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to export view:', error);
    }
}

// Import view from JSON file
export function importViewFromJSON(file: File): Promise<SavedView> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const view = JSON.parse(content) as SavedView;

                // Validate required fields
                if (!view.name || !view.filters || !view.sorting) {
                    throw new Error('Invalid view file format');
                }

                // Generate new ID for imported view
                view.id = `imported-${Date.now()}`;
                view.created_at = new Date();
                view.updated_at = new Date();

                resolve(view);
            } catch (error) {
                reject(new Error('Failed to parse view file'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Clear all localStorage data
export function clearAllViewData(): void {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Failed to clear view data:', error);
    }
}
