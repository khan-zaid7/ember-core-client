import { generateUUID } from '@/utils/generateUUID';
import { db } from '../db';

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
