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


export interface Location {
  location_id: string;
  user_id: string;
  name: string;
  type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  added_at: string;
  updated_at: string;
  description?: string | null;
  synced: number;
  sync_status_message?: string | null;
  [key: string]: any;
}

export const reconcileLocationAfterServerUpdate = async (serverLocationData: Location) => {
  const {
    location_id,
    user_id,
    name,
    type = null,
    latitude = null,
    longitude = null,
    added_at,
    updated_at,
    description = null,
    sync_status_message = null,
  } = serverLocationData;

  const localLocation = db.getFirstSync<Location>(
    `SELECT * FROM locations WHERE location_id = ?`,
    [location_id]
  );

  if (localLocation) {
    if (new Date(localLocation.updated_at) > new Date(updated_at)) {
      console.log(`⚠️ Local location ${location_id} is newer than server data. Skipping update.`);
      return;
    }

    db.runSync(
      `UPDATE locations SET
        user_id = ?,
        name = ?,
        type = ?,
        latitude = ?,
        longitude = ?,
        added_at = ?,
        updated_at = ?,
        description = ?,
        synced = 1,
        sync_status_message = ?
       WHERE location_id = ?`,
      [
        user_id,
        name.trim(),
        type,
        latitude,
        longitude,
        added_at,
        updated_at,
        description?.trim() || null,
        sync_status_message,
        location_id,
      ]
    );

    console.log(`✅ Local location ${location_id} updated and marked synced.`);

    // Uncomment if your system tracks ID changes and you want to map old->new IDs
    /*
    if (localLocation.location_id !== location_id) {
      const mappingSuccess = await handleIdMapping('location', localLocation.location_id, location_id);
      if (mappingSuccess) {
        console.log(`✅ ID mapping for location ${localLocation.location_id} -> ${location_id} completed successfully.`);
      } else {
        console.error(`❌ ID mapping for location ${localLocation.location_id} -> ${location_id} failed.`);
      }
    }
    */
  } else {
    db.runSync(
      `INSERT INTO locations (
        location_id, user_id, name, type, latitude, longitude, added_at, updated_at, description, synced, sync_status_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        location_id,
        user_id,
        name.trim(),
        type,
        latitude,
        longitude,
        added_at,
        updated_at,
        description?.trim() || null,
        1, // synced
        sync_status_message,
      ]
    );

    console.log(`➕ New local location ${location_id} inserted from server data.`);
  }
};