// 📁 services/models/SessionModel.ts
import { db } from '../db';
import { AuthUser } from '@/context/AuthContext';

const SESSION_KEY = 'auth_session';

export const getSessionFromDB = (): AuthUser | null => {
  const row = db.getFirstSync<AuthUser>(
    `SELECT user_id, name, email, phone_number, role
     FROM sessions
     WHERE key = ? AND created_at >= datetime('now', '-24 hours')`,
    [SESSION_KEY]
  );
  return row || null;
};

export const saveSessionToDB = (user: AuthUser) => {
  console.log('📤 Attempting to save session with values:', {
    key: SESSION_KEY,
    user_id: user?.user_id,
    name: user?.name,
    email: user?.email,
    phone_number: user?.phone_number,
    role: user?.role,
  });

  db.runSync(`DELETE FROM sessions WHERE key = ?`, [SESSION_KEY]);

  db.runSync(
    `INSERT INTO sessions (key, user_id, name, email, phone_number, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      SESSION_KEY,
      user?.user_id ?? 'MISSING_USER_ID',
      user?.name ?? 'MISSING_NAME',
      user?.email ?? 'MISSING_EMAIL',
      user?.phone_number ?? '',
      user?.role ?? 'MISSING_ROLE'
    ]
  );

  const confirmed = db.getFirstSync<AuthUser>(
    `SELECT user_id, name, email, phone_number, role FROM sessions WHERE key = ?`,
    [SESSION_KEY]
  );

  console.log('✅ Confirmed saved session:', confirmed);
};

export const removeSessionFromDB = () => {
  db.runSync(`DELETE FROM sessions WHERE key = ?`, [SESSION_KEY]);
};


export const refreshSession = async (setUser: (user: AuthUser | null) => void) => {
  try {
    const session = await getSessionFromDB();
    if (session) {
      setUser(session);
    }
  } catch (err) {
    console.error('⚠️ Failed to refresh session:', err);
  }
};