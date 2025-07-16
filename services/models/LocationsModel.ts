import { db } from '../db';
import { generateUUID } from '@/utils/generateUUID';

export const upsertLocationOffline = (form: {
  userId: string;
  name: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  addedAt: string;
  description?: string;
}): string => {
  if (!form.userId || !form.name || !form.addedAt) {
    throw new Error('userId, name, and addedAt are required');
  }

  // Check existing location for user with type 'user'
  const existing = db.getFirstSync<{ location_id: string }>(
    `SELECT location_id FROM locations WHERE user_id = ? AND type = 'user'`,
    [form.userId]
  );

  if (existing && existing.location_id) {
    // Update existing location
    db.runSync(
      `UPDATE locations SET
        latitude = ?,
        longitude = ?,
        updated_at = ?,
        description = ?
      WHERE location_id = ?`,
      [
        form.latitude ?? null,
        form.longitude ?? null,
        form.addedAt,
        form.description?.trim() || null,
        existing.location_id,
      ]
    );

    return existing.location_id;
  } else {
    // Insert new location
    const location_id = generateUUID();
    db.runSync(
      `INSERT INTO locations (
        location_id, user_id, name, type, latitude, longitude, added_at, description, updated_at, synced, sync_status_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        location_id,
        form.userId,
        form.name.trim(),
        form.type?.trim() || null,
        form.latitude ?? null,
        form.longitude ?? null,
        form.addedAt,
        form.description?.trim() || null,
        form.addedAt,
        0,
        '',
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
        form.userId,
      ]
    );

    return location_id;
  }
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
  if (!userId) return null;
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

export const getLocationById = (location_id: string) => {
  return db.getFirstSync(
    'SELECT * FROM locations WHERE location_id = ?',
    [location_id]
  );
};
