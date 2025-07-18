// models/registrationModel.ts
import { generateUUID } from '@/utils/generateUUID';
import { db } from '../db';

export const insertRegistrationOffline = (form: {
  userId: string;
  fullName: string;
  age: string;
  gender: string;
  locationId: string;
  timestamp: string;
}) => {
  const registration_id = generateUUID();
  const user_id = form.userId.trim();
  const person_name = form.fullName.trim();
  const age = Number(form.age);
  const gender = form.gender.trim();
  // TODO: make it dynamic
  const location_id = 1;
  const timestamp = form.timestamp;

  // Basic validation
  if (!user_id || !person_name || !gender || !location_id || !timestamp || isNaN(age)) {
    throw new Error('All required fields must be filled');
  }

  // Optional: check for duplicate
  const exists = db.getFirstSync<{ registration_id: string }>(
    `SELECT registration_id FROM registrations WHERE registration_id = ?`,
    [registration_id]
  );

  if (exists) {
    throw new Error('A registration with this ID already exists locally');
  }

  // Insert into registrations
  db.runSync(
    `INSERT INTO registrations (registration_id, user_id, person_name, age, gender, location_id, timestamp, synced, sync_status_message, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      registration_id,
      user_id,
      person_name,
      age,
      gender,
      location_id,
      timestamp,
      0, // synced
      '', // sync_status_message
      new Date().toISOString() // updated_at
    ]
  );

  // Add to sync queue
  db.runSync(
    `INSERT INTO sync_queue (sync_id, entity_type, entity_id, status, retry_count, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      generateUUID(),
      'registration',
      registration_id,
      'pending',
      0,
      user_id
    ]
  );

  return registration_id;
};

// models/registrationModel.ts

export const getAllRegistrations = (userId: string) => {
  return db.getAllSync<{
    registration_id: string;
    person_name: string;
    synced: number;
    timestamp: string;
    gender: string;
  }>(
    `SELECT registration_id, person_name, synced, gender, timestamp FROM registrations WHERE user_id = ? ORDER BY timestamp DESC`,
    [userId]
  );
};

export const getRegistrationById = (registration_id: string) => {
  return db.getFirstSync(
    'SELECT * FROM registrations WHERE registration_id = ?',
    [registration_id]
  );
};

import { handleIdMapping } from '../sync/syncQueueProcessor'; // adjust path

export interface Registration {
  registration_id: string;
  user_id: string;
  person_name: string;
  age: number;
  gender: string;
  location_id: number;
  timestamp: string;
  synced: number;
  sync_status_message?: string | null;
  updated_at: string;
  [key: string]: any;
}

export const reconcileRegistrationAfterServerUpdate = async (serverRegistrationData: Registration) => {
  const {
    registration_id,
    user_id,
    person_name,
    age,
    gender,
    location_id,
    timestamp,
    updated_at,
    sync_status_message = null,
  } = serverRegistrationData;

  // Find local registration by registration_id
  const localRegistration = db.getFirstSync<Registration>(
    `SELECT * FROM registrations WHERE registration_id = ?`,
    [registration_id]
  );

  if (localRegistration) {
    // If local updated_at is newer, you might want to skip or handle conflict here
    if (new Date(localRegistration.updated_at) > new Date(updated_at)) {
      console.log(`⚠️ Local registration ${registration_id} is newer than server data. Skipping update.`);
      return;
    }

    // Update local registration with server data
    db.runSync(
      `UPDATE registrations SET 
        user_id = ?, person_name = ?, age = ?, gender = ?, location_id = ?, timestamp = ?, 
        updated_at = ?, synced = 1, sync_status_message = ?
       WHERE registration_id = ?`,
      [
        user_id,
        person_name,
        age,
        gender,
        location_id,
        timestamp,
        updated_at,
        sync_status_message,
        registration_id,
      ]
    );

    console.log(`✅ Local registration ${registration_id} updated and marked synced.`);

    // Uncomment and implement if your system might change IDs on server side and you track old IDs locally
    /*
    if (localRegistration.registration_id !== registration_id) {
      const mappingSuccess = await handleIdMapping('registration', localRegistration.registration_id, registration_id);
      if (mappingSuccess) {
        console.log(`✅ ID mapping for registration ${localRegistration.registration_id} -> ${registration_id} completed successfully.`);
      } else {
        console.error(`❌ ID mapping for registration ${localRegistration.registration_id} -> ${registration_id} failed.`);
      }
    }
    */
  } else {
    // Insert new registration locally
    db.runSync(
      `INSERT INTO registrations (
        registration_id, user_id, person_name, age, gender, location_id, timestamp, updated_at, synced, sync_status_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        registration_id,
        user_id,
        person_name,
        age,
        gender,
        location_id,
        timestamp,
        updated_at,
        1, // synced
        sync_status_message,
      ]
    );
    console.log(`➕ New local registration ${registration_id} inserted from server data.`);
  }
};