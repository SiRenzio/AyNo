export type EventStatus = 'upcoming' | 'overdue' | 'completed' | 'cancelled';

export interface ManagedEvent {
    id: number;
    title: string;
    location: string | null;
    notes: string | null;
    starts_at: string;
    status: EventStatus;
    checklist_count: number;
    completed_checklist_count: number;
}

export type EventSort = 'date-asc' | 'date-desc' | 'title-asc' | 'title-desc';
export type EventView = 'list' | 'calendar';
