import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';

let pending: Promise<SQLite.SQLiteDatabase> | null = null;

export function database() {
    pending ??= SQLite.openDatabaseAsync('ayno.db').then(async (db) => {
        await db.execAsync(`
            PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;
            CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE COLLATE NOCASE, email TEXT UNIQUE COLLATE NOCASE, name TEXT, password_hash TEXT, password_salt TEXT);
            CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, location TEXT, notes TEXT, starts_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'upcoming', completed_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
            CREATE TABLE IF NOT EXISTS checklist_items (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, description TEXT NOT NULL, is_completed INTEGER NOT NULL DEFAULT 0, FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE);
            CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER NOT NULL, offset_minutes INTEGER NOT NULL, remind_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', channel TEXT NOT NULL DEFAULT 'local_push', read_at TEXT, FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE);
            CREATE INDEX IF NOT EXISTS events_user_starts ON events(user_id, starts_at);
            CREATE INDEX IF NOT EXISTS reminders_due ON reminders(remind_at, status);
        `);
        return db;
    });
    return pending;
}

export const newSalt = () => Crypto.randomUUID();
export const hashPassword = (password: string, salt: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);

export async function eraseDatabase() {
    const db = await database();
    await db.runAsync('DELETE FROM users');
}
