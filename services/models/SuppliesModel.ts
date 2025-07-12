import { generateUUID } from '@/utils/generateUUID';
import { db } from '../db';

export const insertSupplyOffline = (form: {
  userId: string;
  itemName: string;
  quantity: string;
  expiryDate: string;
  locationId: string;
  timestamp: string;
}) => {
  const supply_id = generateUUID();
  const user_id = form.userId.trim();
  const item_name = form.itemName.trim();
  const quantity = Number(form.quantity);
  const expiry_date = form.expiryDate.trim();
  const location_id = form.locationId;
  const timestamp = form.timestamp;

  if (!user_id || !item_name || !quantity || !expiry_date || !location_id || !timestamp) {
    throw new Error('All required fields must be filled');
  }

  // Optional: check for duplicate
  const exists = db.getFirstSync<{ supply_id: string }>(
    `SELECT supply_id FROM supplies WHERE supply_id = ?`,
    [supply_id]
  );
  if (exists) {
    throw new Error('A supply with this ID already exists locally');
  }

  db.runSync(
    `INSERT INTO supplies (supply_id, user_id, item_name, quantity, expiry_date, location_id, timestamp, synced, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      supply_id,
      user_id,
      item_name,
      quantity,
      expiry_date,
      location_id,
      timestamp,
      0, // synced
      '' // status
    ]
  );

  db.runSync(
    `INSERT INTO sync_queue (sync_id, entity_type, entity_id, status, retry_count, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      generateUUID(),
      'supply',
      supply_id,
      'pending',
      0,
      user_id
    ]
  );

  return supply_id;
};

export const getAllSupplies = (userId: string) => {
  return db.getAllSync<{
    supply_id: string;
    item_name: string;
    quantity: number;
    expiry_date: string;
    location_id: string;
    timestamp: string;
    synced: number;
    status: string;
  }>(
    `SELECT supply_id, item_name, quantity, expiry_date, location_id, timestamp, synced, status FROM supplies WHERE user_id = ? ORDER BY timestamp DESC`,
    [userId]
  );
};