import { generateUUID } from '@/utils/generateUUID';
import { db } from '../db';
import * as FileSystem from 'expo-file-system';
import { getSessionFromDB } from './SessionModel';

const allowedRoles = ['admin', 'fieldworker', 'volunteer', 'coordinator'];


export const insertUserOffline = (user: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone_number: string;
}) => {
    const name = user.name?.trim();
    const email = user.email?.toLowerCase().trim();
    const password = user.password;
    const phone_number = user.phone_number?.trim() || null;
    const role = user.role?.toLowerCase();

    // Validation (mirroring backend logic)
    if (!name || !email || !password || !role) {
        throw new Error('All required fields must be filled');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format.`');
    }

    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    if (!allowedRoles.includes(role)) {
        throw new Error(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
    }

    const phoneRegex = /^[0-9\-\+]{9,15}$/;
    if (phone_number && !phoneRegex.test(phone_number)) {
        throw new Error('Invalid phone number format');
    }

    // Check for duplicate email
    const existing = db.getFirstSync<{ user_id: string }>(
        `SELECT user_id FROM users WHERE email = ?`,
        [email]
    );
    if (existing) {
        throw new Error('A user with this email already exists locally');
    }

    const user_id = generateUUID();
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    // Insert into users
    db.runSync(
        `INSERT INTO users (user_id, name, email, password, phone_number, role, created_at, updated_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            name,
            email,
            password,
            phone_number,
            role,
            created_at,
            updated_at,
            0,
        ]
    );

    // Add to sync queue
    db.runSync(
        `INSERT INTO sync_queue (sync_id, entity_type, entity_id, status, retry_count, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [
            generateUUID(),
            'user',
            user_id,
            'pending',
            0,
            user_id
        ]
    );

    return user_id;
};

export const loginUserOffline = (form: { email: string, password: string }) => {
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedPassword = form.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Email and password are required');
    }

    const user = db.getFirstSync<any>(
        `SELECT * FROM users WHERE email = ? AND password = ?`,
        [trimmedEmail, trimmedPassword]
    );

    if (!user) {
        throw new Error('Invalid credentials');
    }

    return user;
};

export const saveImageLocally = async (imageUri: string): Promise<string> => {
  if (!imageUri.startsWith('file://')) {
    console.warn('⚠️ Skipping image copy — not a local file:', imageUri);
    return imageUri;
  }

  const folderPath = FileSystem.documentDirectory + 'uploads/';
  const extension = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
  const fileName = `${generateUUID()}.${extension}`;
  const newPath = folderPath + fileName;

  const folderInfo = await FileSystem.getInfoAsync(folderPath);
  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
  }

  await FileSystem.copyAsync({ from: imageUri, to: newPath });
  return newPath;
};

export const updateUserOffline = async (user: {
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone_number: string;
  image_uri?: string;
  location?: string;
}) => {
  const { user_id } = user;

  const name = user.name?.trim();
  const email = user.email?.toLowerCase().trim();
  const phone_number = user.phone_number?.trim() || null;
  const role = user.role?.toLowerCase();
  let image_url: string | null = null;
  const location = user.location;

  if (!user_id || !name || !email || !role) {
    throw new Error('All required fields must be filled');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  if (!emailRegex.test(email)) throw new Error('Invalid email format');
  if (!allowedRoles.includes(role)) throw new Error('Invalid role');

  const phoneRegex = /^[0-9\-\+]{9,15}$/;
  if (phone_number && !phoneRegex.test(phone_number)) {
    throw new Error('Invalid phone number format');
  }

  const duplicate = db.getFirstSync<{ user_id: string }>(
    `SELECT user_id FROM users WHERE email = ? AND user_id != ?`,
    [email, user_id]
  );
  if (duplicate) throw new Error('Another user with this email already exists');

  // 🔥 Save image locally if provided
  if (user.image_uri) {
    try {
      image_url = await saveImageLocally(user.image_uri);
    } catch (err) {
      console.warn('❌ Failed to save image locally:', err);
    }
  }

  const updated_at = new Date().toISOString();

  // Update with location if provided
  if (location !== undefined) {
    db.runSync(
      `UPDATE users
       SET name = ?, email = ?, phone_number = ?, role = ?, image_url = ?, updated_at = ?, synced = 0, location = ?
       WHERE user_id = ?`,
      [name, email, phone_number, role, image_url, updated_at, location, user_id]
    );
  } else {
    db.runSync(
      `UPDATE users
       SET name = ?, email = ?, phone_number = ?, role = ?, image_url = ?, updated_at = ?, synced = 0
       WHERE user_id = ?`,
      [name, email, phone_number, role, image_url, updated_at, user_id]
    );
  }

  db.runSync(
    `UPDATE sessions
     SET name = ?, email = ?, phone_number = ?, role = ?, created_at = datetime('now')
     WHERE key = 'auth_session' AND user_id = ?`,
    [name, email, phone_number, role, user_id]
  );

  // Always add a new sync queue entry for updates
  db.runSync(
    `INSERT INTO sync_queue (sync_id, entity_type, entity_id, status, retry_count, created_by)
     VALUES (?, 'user', ?, 'pending', 0, ?)`,
    [generateUUID(), user_id, user_id]
  );

  return true;
};

export const getUserById = (user_id: string) => {
  return db.getFirstSync<any>(`SELECT * FROM users WHERE user_id = ?`, [user_id]);
};

export const getAllFieldworkers = (): { user_id: string; name: string; phone_number: string }[] => {
  return db.getAllSync(
    `SELECT user_id, name, phone_number FROM users WHERE role = ?`,
    ['fieldworker']
  );
};
