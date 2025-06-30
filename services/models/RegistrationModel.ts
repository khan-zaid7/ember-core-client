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
    `INSERT INTO registrations (registration_id, user_id, person_name, age, gender, location_id, timestamp, synced, sync_status_message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      registration_id,
      user_id,
      person_name,
      age,
      gender,
      location_id,
      timestamp,
      0, // synced
      '' // sync_status_message
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

export const getAllRegistrations = () => {
  return db.getAllSync<{
    registration_id: string;
    person_name: string;
    synced: number;
    timestamp: string;
    gender: string;
  }>(
    `SELECT registration_id, person_name, synced, gender, timestamp FROM registrations ORDER BY timestamp DESC`
  );
};
