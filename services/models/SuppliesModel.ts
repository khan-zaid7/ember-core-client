import { generateUUID } from '@/utils/generateUUID';
import { db } from '../db';

export const insertSupplyOffline = (form: {
  userId: string;
  itemName: string;
  quantity: string;
  expiryDate: string;
  locationId: string;
  timestamp: string;
  barcode?: string;
  sku?: string;
}) => {
  const supply_id = generateUUID();
  const user_id = form.userId.trim();
  const item_name = form.itemName.trim();
  const quantity = Number(form.quantity);
  const expiry_date = form.expiryDate.trim();
  const location_id = form.locationId;
  const timestamp = form.timestamp;
  const barcode = form.barcode?.trim();
  const sku = form.sku?.trim();

  if (!user_id || !item_name || !quantity || !expiry_date || !location_id || !timestamp) {
    throw new Error('All required fields must be filled');
  }
  
  // Check for duplicate barcode if provided
  if (barcode) {
    const existingBarcode = db.getFirstSync<{ supply_id: string }>(
      `SELECT supply_id FROM supplies WHERE barcode = ? AND supply_id != ?`,
      [barcode, supply_id]
    );
    if (existingBarcode) {
      throw new Error('A supply with this barcode already exists');
    }
  }
  
  // Check for duplicate SKU if provided
  if (sku) {
    const existingSku = db.getFirstSync<{ supply_id: string }>(
      `SELECT supply_id FROM supplies WHERE sku = ? AND supply_id != ?`,
      [sku, supply_id]
    );
    if (existingSku) {
      throw new Error('A supply with this SKU already exists');
    }
  }

  // Optional: check for duplicate
  const exists = db.getFirstSync<{ supply_id: string }>(
    `SELECT supply_id FROM supplies WHERE supply_id = ?`,
    [supply_id]
  );
  if (exists) {
    throw new Error('A supply with this ID already exists locally');
  }

  const now = new Date().toISOString();
  
  db.runSync(
    `INSERT INTO supplies (supply_id, user_id, item_name, quantity, expiry_date, location_id, timestamp, updated_at, synced, status, barcode, sku)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      supply_id,
      user_id,
      item_name,
      quantity,
      expiry_date,
      location_id,
      timestamp,
      now, // updated_at
      0, // synced
      '', // status
      barcode || null, // barcode
      sku || null // sku
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

interface Supply {
  supply_id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  expiry_date: string;
  location_id: string;
  timestamp: string;
  updated_at?: string;
  synced: number;
  status: string;
  barcode?: string;
  sku?: string;
  sync_status_message?: string;
  [key: string]: any; // For any other fields
}

export const getSupplyById = (supply_id: string): Supply | null => {
  const supply = db.getFirstSync<Supply>(
    'SELECT * FROM supplies WHERE supply_id = ?',
    [supply_id]
  );
  
  // Ensure updated_at field is present
  if (supply && !supply.updated_at) {
    // Use timestamp as fallback or current timestamp if that's missing too
    supply.updated_at = supply.timestamp || new Date().toISOString();
  }
  
  return supply;
};