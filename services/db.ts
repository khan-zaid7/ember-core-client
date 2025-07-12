import { openDatabaseSync } from 'expo-sqlite';

export const db = openDatabaseSync('ember_core.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone_number TEXT,
      role TEXT NOT NULL,
      reset_token TEXT,
      token_expire TEXT,
      created_at TEXT,
      location TEXT,
      updated_at TEXT,
      image_url TEXT,
      synced INTEGER DEFAULT 0,
      sync_status_message TEXT
    );

    CREATE TABLE IF NOT EXISTS registrations (
      registration_id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      person_name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      location_id TEXT,
      timestamp TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 0,
      sync_status_message TEXT
    );

    CREATE TABLE IF NOT EXISTS supplies (
      supply_id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      quantity INTEGER,
      expiry_date TEXT,
      location_id TEXT,
      timestamp TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 0,
      status TEXT,
      sync_status_message TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      task_id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT,
      priority TEXT,
      created_by TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 0,
      sync_status_message TEXT
    );

    CREATE TABLE IF NOT EXISTS task_assignments (
      assignment_id TEXT PRIMARY KEY NOT NULL,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      assigned_at TEXT,
      status TEXT,
      feedback TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 0,
      sync_status_message TEXT
    );

    CREATE TABLE IF NOT EXISTS locations (
      location_id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      latitude REAL,
      longitude REAL,
      added_at TEXT,
      description TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 0,
      sync_status_message TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      alert_id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT,
      location_id TEXT,
      description TEXT,
      priority TEXT,
      timestamp TEXT,
      updated_at TEXT,
      sent_via TEXT,
      synced INTEGER DEFAULT 0,
      sync_status_message TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      sync_id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      status TEXT,
      retry_count INTEGER DEFAULT 0,
      last_attempt_at TEXT,
      created_by TEXT,
    conflict_field TEXT,     
      latest_data TEXT,
      updated_at TEXT     
    );

    CREATE TABLE IF NOT EXISTS sessions (
      key TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT,
      email TEXT,
      role TEXT,
      phone_number TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      notification_id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      message TEXT NOT NULL,
      type TEXT,
      entity_type TEXT,
      entity_id TEXT,
      received_at TEXT,
      read INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 0,
      sync_status_message TEXT,
      archived INTEGER DEFAULT 0,
      updated_at TEXT
    );
  `);
};

export const verifyTables = () => {
  const result = db.getAllSync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`
  );
};

export const resetDatabase = () => {
  const tables = [
    'users',
    'registrations',
    'supplies',
    'tasks',
    'task_assignments',
    'locations',
    'alerts',
    'sync_queue',
    'sessions',
    'notifications',
  ];

  db.execSync(
    tables
      .map(table => `DROP TABLE IF EXISTS ${table};`)
      .join('\n')
  );

  console.log('🗑️ All tables dropped.');

  // Optional: re-initialize the schema
  initDatabase();
  console.log('✅ Database reset and re-initialized.');
};
