// 📁 services/models/SessionModel.ts
import { db } from '../db';
import { AuthUser } from '@/context/AuthContext';

const SESSION_KEY = 'auth_session';

export const getSessionFromDB = (): AuthUser | null => {
  const row = db.getFirstSync<AuthUser>(
    `SELECT user_id, name, email, role FROM sessions WHERE key = ? AND created_at >= datetime('now', '-24 hours')`,
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
    role: user?.role,
  });

  db.runSync(`DELETE FROM sessions WHERE key = ?`, [SESSION_KEY]);

  db.runSync(
    `INSERT INTO sessions (key, user_id, name, email, role, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [
      SESSION_KEY,
      user?.user_id ?? 'MISSING_USER_ID',
      user?.name ?? 'MISSING_NAME',
      user?.email ?? 'MISSING_EMAIL',
      user?.role ?? 'MISSING_ROLE'
    ]
  );

  const confirmed = db.getFirstSync<AuthUser>(
    `SELECT user_id, name, email, role FROM sessions WHERE key = ?`,
    [SESSION_KEY]
  );

  console.log('✅ Confirmed saved session:', confirmed);
};



export const removeSessionFromDB = () => {
  db.runSync(`DELETE FROM sessions WHERE key = ?`, [SESSION_KEY]);
};
