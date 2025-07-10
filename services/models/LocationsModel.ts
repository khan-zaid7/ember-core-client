import { db } from '../db';
import { generateUUID } from '@/utils/generateUUID';

export const insertLocationOffline = (form: {
  userId: string;
  name: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  addedAt: string;
  description?: string;
}) => {
  const location_id = generateUUID();
  const user_id = form.userId.trim();
  const name = form.name.trim();
  const type = form.type?.trim() || null;
  const latitude = form.latitude ?? null;
  const longitude = form.longitude ?? null;
  const added_at = form.addedAt;
  const description = form.description?.trim() || null;
  const updated_at = added_at;

  // Basic validation
  if (!user_id || !name || !added_at) {
    throw new Error('Required fields: userId, name, and addedAt must be filled');
  }

  // Check for duplicates by name and user
  const exists = db.getFirstSync<{ location_id: string }>(
    `SELECT location_id FROM locations WHERE user_id = ? AND name = ?`,
    [user_id, name]
  );

  if (exists) {
    throw new Error('Location with this name already exists for this user');
  }

  // Insert into locations
  db.runSync(
    `INSERT INTO locations (
      location_id, user_id, name, type, latitude, longitude, added_at, description, updated_at, synced, sync_status_message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      location_id,
      user_id,
      name,
      type,
      latitude,
      longitude,
      added_at,
      description,
      updated_at,
      0, // synced
      '' // sync_status_message
    ]
  );

  // Insert into sync queue
  db.runSync(
    `INSERT INTO sync_queue (sync_id, entity_type, entity_id, status, retry_count, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      generateUUID(),
      'location',
      location_id,
      'pending',
      0,
      user_id
    ]
  );

  return location_id;
};

export const getAllLocations = () => {
  return db.getAllSync<{
    location_id: string;
    name: string;
    type: string | null;
    latitude: number | null;
    longitude: number | null;
    added_at: string;
    synced: number;
  }>(
    `SELECT location_id, name, type, latitude, longitude, added_at, synced
     FROM locations
     ORDER BY added_at DESC`
  );
};

export const getUserLocation = (userId: string) => {
  return db.getFirstSync<{
    location_id: string;
    name: string;
    type: string | null;
    latitude: number | null;
    longitude: number | null;
    added_at: string;
    description: string | null;
  }>(
    `SELECT location_id, name, type, latitude, longitude, added_at, description
     FROM locations
     WHERE user_id = ?
     ORDER BY added_at DESC
     LIMIT 1`,
    [userId]
  );
};
