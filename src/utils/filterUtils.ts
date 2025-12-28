import { FilterState, SortConfig, DEFAULT_FILTERS } from '@/types/admin-filters';

// Profile interface from admin page
interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    access_status: string;
    phone_prefix_id?: number | null;
    phone_body?: string;
    birth_date?: string;
    gender_id?: number | null;
    city_id?: number | null;
    address?: string;
    created_at: string;
    last_active_at?: string;
    extensions?: {
        bio?: string;
        notes?: string;
        github_url?: string;
        emergency_phone?: string;
    };
}

// Calculate age from birth date
function calculateAge(birthDate: string | undefined): number | null {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Check if profile is incomplete
function isProfileIncomplete(profile: Profile): boolean {
    return !profile.full_name ||
        !profile.email ||
        !profile.birth_date ||
        !profile.gender_id;
}

// Check if date is within range
function isWithinDateRange(date: string | undefined, range: [Date | null, Date | null]): boolean {
    if (!date) return false;
    const [start, end] = range;
    const checkDate = new Date(date);

    if (start && checkDate < start) return false;
    if (end && checkDate > end) return false;

    return true;
}

/**
 * Apply all filters to the profiles array
 */
export function applyFilters(profiles: Profile[], filters: FilterState): Profile[] {
    return profiles.filter(profile => {
        // Search filter (searches in name, email, phone)
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
                profile.full_name?.toLowerCase().includes(searchLower) ||
                profile.email?.toLowerCase().includes(searchLower) ||
                profile.phone_body?.includes(filters.search);

            if (!matchesSearch) return false;
        }

        // Role filter
        if (filters.roles.length > 0) {
            if (!filters.roles.includes(profile.role)) return false;
        }

        // Status filter
        if (filters.statuses.length > 0) {
            if (!filters.statuses.includes(profile.access_status)) return false;
        }

        // Gender filter
        if (filters.genders.length > 0) {
            if (!profile.gender_id || !filters.genders.includes(profile.gender_id)) {
                return false;
            }
        }

        // City filter
        if (filters.cities.length > 0) {
            if (!profile.city_id || !filters.cities.includes(profile.city_id)) {
                return false;
            }
        }

        // Age range filter
        if (filters.ageRange) {
            const age = calculateAge(profile.birth_date);
            if (age === null) return false;
            const [minAge, maxAge] = filters.ageRange;
            if (age < minAge || age > maxAge) return false;
        }

        // Date range filter (registration date)
        if (filters.dateRange[0] || filters.dateRange[1]) {
            if (!isWithinDateRange(profile.created_at, filters.dateRange)) {
                return false;
            }
        }

        // Missing city filter
        if (filters.missingCity) {
            if (profile.city_id) return false;
        }

        // Incomplete profile filter
        if (filters.incompleteProfile) {
            if (!isProfileIncomplete(profile)) return false;
        }

        return true;
    });
}

/**
 * Apply sorting to the profiles array
 */
export function applySorting(profiles: Profile[], sorting: SortConfig[]): Profile[] {
    if (sorting.length === 0) return profiles;

    return [...profiles].sort((a, b) => {
        // Sort by each config in priority order
        for (const config of sorting.sort((x, y) => x.priority - y.priority)) {
            let comparison = 0;

            switch (config.field) {
                case 'full_name':
                    comparison = (a.full_name || '').localeCompare(b.full_name || '', 'he');
                    break;

                case 'email':
                    comparison = (a.email || '').localeCompare(b.email || '');
                    break;

                case 'role':
                    const roleOrder = { admin: 1, teacher: 2, student: 3 };
                    comparison = (roleOrder[a.role as keyof typeof roleOrder] || 99) -
                        (roleOrder[b.role as keyof typeof roleOrder] || 99);
                    break;

                case 'created_at':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;

                case 'last_active_at':
                    const aTime = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
                    const bTime = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
                    comparison = aTime - bTime;
                    break;

                case 'age':
                    const aAge = calculateAge(a.birth_date) || 0;
                    const bAge = calculateAge(b.birth_date) || 0;
                    comparison = aAge - bAge;
                    break;

                case 'city':
                    comparison = (a.city_id || 0) - (b.city_id || 0);
                    break;

                default:
                    comparison = 0;
            }

            // Apply direction
            if (config.direction === 'desc') {
                comparison *= -1;
            }

            // If this level produced a difference, return it
            if (comparison !== 0) {
                return comparison;
            }
        }

        return 0;
    });
}

/**
 * Apply both filters and sorting
 */
export function applyFiltersAndSorting(
    profiles: Profile[],
    filters: FilterState,
    sorting: SortConfig[]
): Profile[] {
    const filtered = applyFilters(profiles, filters);
    const sorted = applySorting(filtered, sorting);
    return sorted;
}

/**
 * Check if filters are active (different from default)
 */
export function hasActiveFilters(filters: FilterState): boolean {
    return (
        filters.search !== DEFAULT_FILTERS.search ||
        filters.roles.length > 0 ||
        filters.statuses.length > 0 ||
        filters.genders.length > 0 ||
        filters.cities.length > 0 ||
        filters.ageRange !== null ||
        filters.dateRange[0] !== null ||
        filters.dateRange[1] !== null ||
        filters.missingCity !== DEFAULT_FILTERS.missingCity ||
        filters.incompleteProfile !== DEFAULT_FILTERS.incompleteProfile
    );
}

/**
 * Get count of active filters
 */
export function getActiveFilterCount(filters: FilterState): number {
    let count = 0;

    if (filters.search) count++;
    if (filters.roles.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.genders.length > 0) count++;
    if (filters.cities.length > 0) count++;
    if (filters.ageRange) count++;
    if (filters.dateRange[0] || filters.dateRange[1]) count++;
    if (filters.missingCity) count++;
    if (filters.incompleteProfile) count++;

    return count;
}

/**
 * Generate URL query string from filters and sorting
 */
export function filtersToQueryString(filters: FilterState, sorting: SortConfig[]): string {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.roles.length) params.set('roles', filters.roles.join(','));
    if (filters.statuses.length) params.set('statuses', filters.statuses.join(','));
    if (filters.genders.length) params.set('genders', filters.genders.join(','));
    if (filters.cities.length) params.set('cities', filters.cities.join(','));
    if (filters.ageRange) params.set('ageRange', filters.ageRange.join('-'));
    if (filters.dateRange[0]) params.set('dateFrom', filters.dateRange[0].toISOString());
    if (filters.dateRange[1]) params.set('dateTo', filters.dateRange[1].toISOString());
    if (filters.missingCity) params.set('missingCity', 'true');
    if (filters.incompleteProfile) params.set('incompleteProfile', 'true');

    if (sorting.length) {
        params.set('sort', sorting.map(s => `${s.field}:${s.direction}:${s.priority}`).join('|'));
    }

    return params.toString();
}

/**
 * Parse URL query string to filters and sorting
 */
export function queryStringToFilters(queryString: string): { filters: FilterState; sorting: SortConfig[] } {
    const params = new URLSearchParams(queryString);

    const filters: FilterState = {
        search: params.get('search') || '',
        roles: params.get('roles')?.split(',').filter(Boolean) || [],
        statuses: params.get('statuses')?.split(',').filter(Boolean) || [],
        genders: params.get('genders')?.split(',').map(Number).filter(Boolean) || [],
        cities: params.get('cities')?.split(',').map(Number).filter(Boolean) || [],
        ageRange: params.get('ageRange') ? params.get('ageRange')!.split('-').map(Number) as [number, number] : null,
        dateRange: [
            params.get('dateFrom') ? new Date(params.get('dateFrom')!) : null,
            params.get('dateTo') ? new Date(params.get('dateTo')!) : null
        ],
        missingCity: params.get('missingCity') === 'true',
        incompleteProfile: params.get('incompleteProfile') === 'true'
    };

    const sorting: SortConfig[] = params.get('sort')
        ? params.get('sort')!.split('|').map(s => {
            const [field, direction, priority] = s.split(':');
            return { field, direction: direction as 'asc' | 'desc', priority: Number(priority) };
        })
        : [];

    return { filters, sorting };
}
