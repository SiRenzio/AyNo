export type User = { id: number; name: string; email: string; timezone?: string };
export type ChecklistItem = { id: number; description: string; is_completed: boolean };
export type Reminder = { id: number; remind_at: string; status: string; offset_minutes: number };
export type EventSummary = { id: number; title: string; location?: string; starts_at: string; status: string; checklist_count: number; completed_checklist_count: number; pending_reminders_count: number };
export type EventDetail = EventSummary & { notes?: string; checklist_items: ChecklistItem[]; reminders: Reminder[] };
