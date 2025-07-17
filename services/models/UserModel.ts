// services/models/UserModel.ts

import { generateUUID } from '@/utils/generateUUID';
import { db } from '../db';
import * as FileSystem from 'expo-file-system';
// Removed all bcrypt and expo-random imports and related code

const allowedRoles = ['admin', 'fieldworker', 'volunteer', 'coordinator'];

// Define the User interface for better type safety
interface User {
  user_id: string; // user_id is now required for server-provided data
  name: string;
  email: string;
  password: string; // This will now represent plain text password if stored locally as such
  role: string;
  phone_number: string | null;
  image_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  synced: number; // 0 for false, 1 for true
  // Add any other fields your backend user object might return
  reset_token?: string | null;
  token_expire?: string | null;
  sync_status_message?: string | null;
}

export const insertUserOffline = async (user: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone_number?: string;
}) => {
  const name = user.name?.trim();
  const email = user.email?.toLowerCase().trim();
  const password = user.password; // This is the plain-text password
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

  // Store password as plain text
  const storedPassword = password;

  // Insert into users
  db.runSync(
    `INSERT INTO users (user_id, name, email, password, phone_number, role, created_at, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      name,
      email,
      storedPassword, // <<< STORE PLAIN TEXT PASSWORD
      phone_number,
      role,
      created_at,
      updated_at,
      0,
    ] as (string | number | null)[]
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
    ] as (string | number)[]
  );

  return user_id;
};

export const loginUserOffline = async (form: { email: string, password: string }) => {
  const trimmedEmail = form.email.trim().toLowerCase();
  const trimmedPassword = form.password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Email and password are required');
  }
  console.log(trimmedPassword);

  // Fetch user by email
  const user = db.getFirstSync<User>(
    `SELECT * FROM users WHERE email = ?`,
    [trimmedEmail]
  );

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare plain text password directly
  const passwordMatch = trimmedPassword === user.password;

  if (!passwordMatch) {
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
  phone_number?: string;
  image_uri?: string;
  location?: string;
  password?: string;
}) => {
  const { user_id } = user;

  const name = user.name?.trim();
  const email = user.email?.toLowerCase().trim();
  const phone_number = user.phone_number?.trim() || null;
  const role = user.role?.toLowerCase();
  let image_url: string | null = null;
  const location = user.location;
  const newPassword = user.password; // Get the new password if provided

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

  if (user.image_uri) {
    try {
      image_url = await saveImageLocally(user.image_uri);
    } catch (err) {
      console.warn('❌ Failed to save image locally:', err);
    }
  }

  const updated_at = new Date().toISOString();

  let passwordUpdateClause = '';
  let storedNewPassword = null;
  if (newPassword !== undefined && newPassword !== null && newPassword !== '') {
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }
    // Store new password as plain text
    storedNewPassword = newPassword;
    passwordUpdateClause = ', password = ?';
  }

  const updateClauses: string[] = [];
  const updateValues: (string | number | null)[] = [];

  updateClauses.push('name = ?'); updateValues.push(name);
  updateClauses.push('email = ?'); updateValues.push(email);
  updateClauses.push('phone_number = ?'); updateValues.push(phone_number);
  updateClauses.push('role = ?'); updateValues.push(role);
  updateClauses.push('image_url = ?'); updateValues.push(image_url);
  updateClauses.push('updated_at = ?'); updateValues.push(updated_at);
  updateClauses.push('synced = 0');

  if (passwordUpdateClause) {
    updateClauses.push('password = ?');
    updateValues.push(storedNewPassword); // <<< STORE PLAIN TEXT PASSWORD
  }
  if (location !== undefined) {
    updateClauses.push('location = ?');
    updateValues.push(location);
  }

  db.runSync(
    `UPDATE users SET ${updateClauses.join(', ')} WHERE user_id = ?`,
    [...updateValues, user_id] as (string | number | null)[]
  );

  db.runSync(
    `UPDATE sessions
         SET name = ?, email = ?, phone_number = ?, role = ?, created_at = datetime('now')
         WHERE key = 'auth_session' AND user_id = ?`,
    [name, email, phone_number, role, user_id] as (string | null)[]
  );

  db.runSync(
    `INSERT INTO sync_queue (sync_id, entity_type, entity_id, status, retry_count, created_by)
         VALUES (?, 'user', ?, 'pending', 0, ?)`,
    [generateUUID(), user_id, user_id] as (string | number)[]
  );

  return true;
};

export const getUserById = (user_id: string) => {
  return db.getFirstSync<User>(`SELECT * FROM users WHERE user_id = ?`, [user_id]);
};

export const getUserByEmail = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  return db.getFirstSync<User>(`SELECT * FROM users WHERE email = ?`, [normalizedEmail]);
};

export const updateUserPassword = async (email: string, newPassword: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const updated_at = new Date().toISOString();

  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  // Store new password as plain text
  const storedNewPassword = newPassword;

  const result = db.runSync(
    `UPDATE users SET password = ?, updated_at = ?, synced = 0 WHERE email = ?`,
    [storedNewPassword, updated_at, normalizedEmail] as (string | number)[] // <<< STORE PLAIN TEXT PASSWORD
  );

  if (result.changes === 0) {
    throw new Error('User not found or password not updated');
  }

  const user = getUserByEmail(normalizedEmail);
  if (user) {
    db.runSync(
      `INSERT INTO sync_queue (sync_id, entity_type, entity_id, status, retry_count, created_by)
             VALUES (?, 'user', ?, 'pending', 0, ?)`,
      [generateUUID(), user.user_id, user.user_id] as (string | number)[]
    );
  }

  return result.changes > 0;
};

export const getAllFieldworkers = (): { user_id: string; name: string; phone_number: string }[] => {
  return db.getAllSync(
    `SELECT user_id, name, phone_number FROM users WHERE role = ?`,
    ['fieldworker']
  );
};

export const reconcileUserAfterServerUpdate = async (serverUserData: User) => {
  const { user_id, email, password, name, phone_number, role, created_at, updated_at, image_url, location } = serverUserData;

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhoneNumber = phone_number?.trim() || null;
  const normalizedName = name?.trim();
  const normalizedRole = role?.toLowerCase();
  const normalizedLocation = location?.trim() || null;
  const normalizedImageUrl = image_url?.trim() || null;

  const localUser = db.getFirstSync<User>(`SELECT * FROM users WHERE email = ?`, [normalizedEmail]);

  if (localUser) {
    console.log(`🔄 Reconciling existing local user ${localUser.user_id} with server data for email: ${normalizedEmail}`);

    const oldLocalUserId = localUser.user_id;

    const updateClauses: string[] = [];
    const updateValues: (string | number | null)[] = [];

    updateClauses.push('user_id = ?'); updateValues.push(user_id);
    updateClauses.push('name = ?'); updateValues.push(normalizedName);
    updateClauses.push('email = ?'); updateValues.push(normalizedEmail);
    // IMPORTANT: Assuming 'password' from serverUserData is a HASHED password
    // and you want to store this HASHED version when reconciling from the server.
    updateClauses.push('password = ?'); updateValues.push(password);
    updateClauses.push('role = ?'); updateValues.push(normalizedRole);
    updateClauses.push('phone_number = ?'); updateValues.push(normalizedPhoneNumber);
    updateClauses.push('image_url = ?'); updateValues.push(normalizedImageUrl);
    updateClauses.push('location = ?'); updateValues.push(normalizedLocation);
    updateClauses.push('created_at = ?'); updateValues.push(created_at);
    updateClauses.push('updated_at = ?'); updateValues.push(updated_at);
    updateClauses.push('synced = 1');

    db.runSync(
      `UPDATE users SET ${updateClauses.join(', ')} WHERE user_id = ?`,
      [...updateValues, oldLocalUserId] as (string | number | null)[]
    );
    console.log(`✅ Local user ${oldLocalUserId} updated and synced to server ID ${user_id}.`);

    if (oldLocalUserId !== user_id) {
      console.log(`Updating sync_queue for user_id change: ${oldLocalUserId} -> ${user_id}`);
      db.runSync(
        `UPDATE sync_queue SET entity_id = ?, created_by = ? WHERE entity_id = ? AND entity_type = 'user'`,
        [user_id, user_id, oldLocalUserId]
      );
      console.log(`✅ Sync queue and other user-related entities updated to new user_id: ${user_id}`);
    }

  } else {
    console.log(`➕ Inserting new local user from server data for email: ${normalizedEmail}`);
    db.runSync(
      `INSERT INTO users (user_id, name, email, password, phone_number, role, created_at, updated_at, image_url, location, synced)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        normalizedName,
        normalizedEmail,
        password, // Server password is still expected to be hashed
        normalizedPhoneNumber,
        normalizedRole,
        created_at,
        updated_at,
        normalizedImageUrl,
        normalizedLocation,
        1,
      ] as (string | number | null)[]
    );
    console.log(`✅ New local user ${user_id} inserted from server data.`);
  }
};