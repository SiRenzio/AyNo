import { DeviceEventEmitter } from 'react-native';
import { ApiError } from './api-error';
import { database, eraseDatabase, hashPassword, newSalt } from './local-database';

type Row = Record<string, any>;
const now = () => new Date().toISOString();
const data = (options: RequestInit) => (options.body ? JSON.parse(String(options.body)) : {});
const method = (options: RequestInit) => String(options.method ?? 'GET').toUpperCase();
const fail = (field: string, message: string): never => {
    throw new ApiError(message, 422, { [field]: [message] });
};
const userJson = (row: Row) => ({ id: row.id, name: row.name, username: row.username, email: row.email });

async function user() {
    const row = await (await database()).getFirstAsync<Row>('SELECT * FROM users LIMIT 1');
    if (!row) throw new ApiError('Please sign in to continue.', 401);
    return row;
}

async function ownedEvent(id: number) {
    const db = await database();
    const account = await user();
    const row = await db.getFirstAsync<Row>('SELECT * FROM events WHERE id = ? AND user_id = ?', id, account.id);
    if (!row) throw new ApiError('Event not found.', 404);
    return row;
}

async function summary(row: Row) {
    const db = await database();
    const counts = await db.getFirstAsync<Row>(
        'SELECT COUNT(*) total, COALESCE(SUM(is_completed), 0) done FROM checklist_items WHERE event_id = ?',
        row.id,
    );
    const reminders = await db.getFirstAsync<Row>("SELECT COUNT(*) total FROM reminders WHERE event_id = ? AND status = 'pending'", row.id);
    return {
        id: row.id,
        title: row.title,
        location: row.location ?? undefined,
        starts_at: row.starts_at,
        status: row.status === 'upcoming' && new Date(row.starts_at).getTime() < Date.now() ? 'overdue' : row.status,
        checklist_count: counts?.total ?? 0,
        completed_checklist_count: counts?.done ?? 0,
        pending_reminders_count: reminders?.total ?? 0,
    };
}

async function detail(row: Row) {
    const db = await database();
    return {
        ...(await summary(row)),
        notes: row.notes ?? undefined,
        checklist_items: (
            await db.getAllAsync<Row>('SELECT id, description, is_completed FROM checklist_items WHERE event_id = ? ORDER BY id', row.id)
        ).map((item) => ({ ...item, is_completed: !!item.is_completed })),
        reminders: await db.getAllAsync<Row>(
            'SELECT id, remind_at, status, offset_minutes FROM reminders WHERE event_id = ? ORDER BY remind_at',
            row.id,
        ),
    };
}

export async function localApi<T>(rawPath: string, options: RequestInit = {}): Promise<T> {
    const db = await database();
    const path = rawPath.split('?')[0];
    const verb = method(options);
    const body = data(options);

    if (path === '/register' && verb === 'POST') {
        const username = String(body.username ?? '')
            .trim()
            .toLowerCase();
        const email = String(body.email ?? '')
            .trim()
            .toLowerCase();
        if (await db.getFirstAsync('SELECT id FROM users LIMIT 1')) fail('username', 'An account already exists on this device.');
        if (username.length < 3) fail('username', 'Username must contain at least 3 characters.');
        if (!/^\S+@\S+\.\S+$/.test(email)) fail('email', 'Enter a valid email address.');
        if (String(body.password ?? '').length < 8) fail('password', 'Password must contain at least 8 characters.');
        if (body.password !== body.password_confirmation) fail('password_confirmation', 'The passwords do not match.');
        const salt = newSalt();
        const result = await db.runAsync(
            'INSERT INTO users (id, username, email, name, password_hash, password_salt) VALUES (1, ?, ?, ?, ?, ?)',
            username,
            email,
            username,
            await hashPassword(body.password, salt),
            salt,
        );
        const account = await db.getFirstAsync<Row>('SELECT * FROM users WHERE id = ?', result.lastInsertRowId || 1);
        return { token: 'local-device-session', user: userJson(account!) } as T;
    }
    if (path === '/login' && verb === 'POST') {
        const login = String(body.login ?? '')
            .trim()
            .toLowerCase();
        const account = await db.getFirstAsync<Row>('SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?', login, login);
        if (!account || (await hashPassword(String(body.password ?? ''), account.password_salt)) !== account.password_hash)
            fail('login', 'The provided credentials are incorrect.');
        return { token: 'local-device-session', user: userJson(account!) } as T;
    }
    if (path === '/logout') return { message: 'Signed out.' } as T;
    if (path === '/me') return { user: userJson(await user()) } as T;
    if (path === '/account' && verb === 'DELETE') {
        await eraseDatabase();
        DeviceEventEmitter.emit('notificationsChanged');
        return { message: 'Account deleted.' } as T;
    }

    const account = await user();
    if (path === '/profile' && verb === 'PATCH') {
        const name = String(body.name ?? '').trim();
        const email = String(body.email ?? '')
            .trim()
            .toLowerCase();
        if (!name) fail('name', 'Name is required.');
        if (!/^\S+@\S+\.\S+$/.test(email)) fail('email', 'Enter a valid email address.');
        await db.runAsync('UPDATE users SET name = ?, email = ? WHERE id = ?', name, email, account.id);
        return { user: userJson({ ...account, name, email }) } as T;
    }
    if (path === '/templates') return { templates: [] } as T;
    if (path === '/events' && verb === 'GET') {
        const rows = await db.getAllAsync<Row>('SELECT * FROM events WHERE user_id = ? ORDER BY updated_at DESC', account.id);
        return { events: await Promise.all(rows.map(summary)) } as T;
    }
    if (path === '/dashboard') {
        const rows = await db.getAllAsync<Row>('SELECT * FROM events WHERE user_id = ? ORDER BY starts_at', account.id);
        const events = await Promise.all(rows.map(summary));
        const upcoming = events.filter((e) => e.status === 'upcoming');
        const completed = events.filter((e) => e.status === 'completed').reverse();
        return {
            statistics: {
                total: events.length,
                upcoming: upcoming.length,
                overdue: events.filter((e) => e.status === 'overdue').length,
                completed: completed.length,
            },
            upcoming_events: upcoming.slice(0, 4),
            completed_events: completed.slice(0, 4),
        } as T;
    }
    if (path === '/events' && verb === 'POST') {
        const title = String(body.title ?? '').trim();
        const starts = new Date(body.starts_at);
        if (!title) fail('title', 'Title is required.');
        if (starts.getTime() <= Date.now()) fail('starts_at', 'Event time must be in the future.');
        const stamp = now();
        let id = 0;
        await db.withTransactionAsync(async () => {
            id = (
                await db.runAsync(
                    'INSERT INTO events (user_id, title, location, notes, starts_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    account.id,
                    title,
                    body.location ?? null,
                    body.notes ?? null,
                    starts.toISOString(),
                    stamp,
                    stamp,
                )
            ).lastInsertRowId;
            for (const item of body.checklist_items ?? [])
                await db.runAsync('INSERT INTO checklist_items (event_id, description) VALUES (?, ?)', id, String(item).trim());
            for (const offset of body.reminder_offsets ?? []) {
                const due = new Date(starts.getTime() - Number(offset) * 60000);
                if (due.getTime() > Date.now())
                    await db.runAsync(
                        'INSERT INTO reminders (event_id, offset_minutes, remind_at) VALUES (?, ?, ?)',
                        id,
                        Number(offset),
                        due.toISOString(),
                    );
            }
        });
        return { event: await detail(await ownedEvent(id)) } as T;
    }

    const eventRoute = path.match(/^\/events\/(\d+)$/);
    if (eventRoute) {
        const event = await ownedEvent(Number(eventRoute[1]));
        if (verb === 'GET') return { event: await detail(event) } as T;
        if (verb === 'DELETE') {
            await db.runAsync('DELETE FROM events WHERE id = ?', event.id);
            return { message: 'Event deleted.' } as T;
        }
        if (verb === 'PATCH') {
            const starts = new Date(body.starts_at);
            await db.runAsync(
                'UPDATE events SET title=?, location=?, notes=?, starts_at=?, updated_at=? WHERE id=?',
                String(body.title).trim(),
                body.location ?? null,
                body.notes ?? null,
                starts.toISOString(),
                now(),
                event.id,
            );
            for (const reminder of await db.getAllAsync<Row>("SELECT * FROM reminders WHERE event_id=? AND status='pending'", event.id)) {
                const due = new Date(starts.getTime() - reminder.offset_minutes * 60000);
                await db.runAsync(
                    'UPDATE reminders SET remind_at=?, status=? WHERE id=?',
                    due.toISOString(),
                    due.getTime() > Date.now() ? 'pending' : 'cancelled',
                    reminder.id,
                );
            }
            return { event: await detail(await ownedEvent(event.id)) } as T;
        }
    }
    const statusRoute = path.match(/^\/events\/(\d+)\/status$/);
    if (statusRoute && verb === 'PATCH') {
        const event = await ownedEvent(Number(statusRoute[1]));
        await db.runAsync(
            'UPDATE events SET status=?, completed_at=?, updated_at=? WHERE id=?',
            body.status,
            body.status === 'completed' ? now() : null,
            now(),
            event.id,
        );
        await db.runAsync(
            "UPDATE reminders SET status='cancelled', read_at=COALESCE(read_at, ?) WHERE event_id=? AND status='pending'",
            now(),
            event.id,
        );
        return { message: 'Event updated.' } as T;
    }

    const addItem = path.match(/^\/events\/(\d+)\/checklist-items$/);
    if (addItem && verb === 'POST') {
        const event = await ownedEvent(Number(addItem[1]));
        const description = String(body.description).trim();
        const result = await db.runAsync('INSERT INTO checklist_items (event_id, description) VALUES (?, ?)', event.id, description);
        return { checklist_item: { id: result.lastInsertRowId, description, is_completed: false } } as T;
    }
    const itemRoute = path.match(/^\/checklist-items\/(\d+)$/);
    if (itemRoute && verb === 'PATCH') {
        await db.runAsync('UPDATE checklist_items SET is_completed=? WHERE id=?', body.is_completed ? 1 : 0, Number(itemRoute[1]));
        return { message: 'Checklist updated.' } as T;
    }
    const addReminder = path.match(/^\/events\/(\d+)\/reminders$/);
    if (addReminder && verb === 'POST') {
        const event = await ownedEvent(Number(addReminder[1]));
        const offset = Number(body.offset_minutes);
        const due = new Date(new Date(event.starts_at).getTime() - offset * 60000);
        if (due.getTime() <= Date.now()) fail('offset_minutes', 'Reminder time must be in the future.');
        const result = await db.runAsync(
            'INSERT INTO reminders (event_id, offset_minutes, remind_at) VALUES (?, ?, ?)',
            event.id,
            offset,
            due.toISOString(),
        );
        return { reminder: { id: result.lastInsertRowId, offset_minutes: offset, remind_at: due.toISOString(), status: 'pending' } } as T;
    }
    const reminderRoute = path.match(/^\/reminders\/(\d+)$/);
    if (reminderRoute && verb === 'DELETE') {
        await db.runAsync('DELETE FROM reminders WHERE id=?', Number(reminderRoute[1]));
        return { message: 'Reminder deleted.' } as T;
    }

    if (path === '/push-reminders') {
        const rows = await db.getAllAsync<Row>(
            "SELECT r.id,r.remind_at,e.id event_id,e.title,e.location FROM reminders r JOIN events e ON e.id=r.event_id WHERE e.user_id=? AND e.status='upcoming' AND r.status='pending' AND r.remind_at>?",
            account.id,
            now(),
        );
        return {
            reminders: rows.map((r) => ({ id: r.id, remind_at: r.remind_at, event: { id: r.event_id, title: r.title, location: r.location } })),
        } as T;
    }
    if (path === '/notifications' && verb === 'GET') {
        const rows = await db.getAllAsync<Row>(
            'SELECT r.*,e.id event_id,e.title,e.location,e.starts_at,e.status event_status FROM reminders r JOIN events e ON e.id=r.event_id WHERE e.user_id=? AND r.remind_at<=? ORDER BY r.remind_at DESC',
            account.id,
            now(),
        );
        return {
            notifications: rows.map((r) => ({
                id: r.id,
                remind_at: r.remind_at,
                status: r.event_status === 'completed' || new Date(r.starts_at).getTime() < Date.now() ? 'completed' : r.status,
                channel: r.channel,
                read_at: r.read_at,
                event: { id: r.event_id, title: r.title, location: r.location, starts_at: r.starts_at, status: r.event_status },
            })),
        } as T;
    }
    if (path === '/notifications/read' && verb === 'PATCH') {
        const ids: number[] = body.ids ?? [];
        if (ids.length) await db.runAsync(`UPDATE reminders SET read_at=? WHERE id IN (${ids.map(() => '?').join(',')})`, now(), ...ids);
        else await db.runAsync('UPDATE reminders SET read_at=? WHERE remind_at<=?', now(), now());
        return { message: 'Notifications marked read.' } as T;
    }
    if (path === '/notifications' && verb === 'DELETE') {
        const ids: number[] = body.ids ?? [];
        if (ids.length) await db.runAsync(`DELETE FROM reminders WHERE id IN (${ids.map(() => '?').join(',')})`, ...ids);
        return { message: 'Notifications deleted.' } as T;
    }
    const notification = path.match(/^\/notifications\/(\d+)$/);
    if (notification) {
        if (verb === 'DELETE') await db.runAsync('DELETE FROM reminders WHERE id=?', Number(notification[1]));
        else await db.runAsync('UPDATE reminders SET status=? WHERE id=?', body.status, Number(notification[1]));
        return { message: 'Notification updated.' } as T;
    }
    throw new ApiError(`Unsupported local operation: ${verb} ${path}`, 404);
}
