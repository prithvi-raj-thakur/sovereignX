import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: connectionString && !connectionString.includes('localhost')
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 5000,
});

// Memory fallback store in case Neon DB is unreachable during local testing
interface MemoryUser {
  id: number;
  email: string;
  name: string;
  password?: string;
  google_id?: string;
  avatar_url?: string;
  is_verified: boolean;
  created_at: Date;
}

interface MemoryOtp {
  id: number;
  email: string;
  otp: string;
  expires_at: Date;
  created_at: Date;
}

export const memoryStore = {
  users: [] as MemoryUser[],
  otps: [] as MemoryOtp[],
  nextUserId: 1,
  nextOtpId: 1,
};

let useMemoryStore = false;

export async function initDb() {
  try {
    console.log('[DB] Connecting to Neon PostgreSQL...');
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255),
        google_id VARCHAR(255),
        avatar_url TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create otps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('✅ [DB] Neon PostgreSQL tables initialized successfully.');
  } catch (error: any) {
    console.warn('⚠️ [DB] Could not connect to Neon PostgreSQL database:', error?.message || error);
    console.warn('⚠️ [DB] Falling back to in-memory database store for smooth execution.');
    useMemoryStore = true;
  }
}

// User repository functions that handle both Postgres and Memory Store
export const UserRepo = {
  async findByEmail(email: string) {
    if (useMemoryStore) {
      return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
    try {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      return res.rows[0] || null;
    } catch {
      return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async createUser(data: { email: string; name: string; password?: string; google_id?: string; avatar_url?: string; is_verified?: boolean }) {
    if (useMemoryStore) {
      const newUser: MemoryUser = {
        id: memoryStore.nextUserId++,
        email: data.email,
        name: data.name,
        password: data.password,
        google_id: data.google_id,
        avatar_url: data.avatar_url,
        is_verified: data.is_verified ?? true,
        created_at: new Date(),
      };
      memoryStore.users.push(newUser);
      return newUser;
    }
    try {
      const res = await pool.query(
        `INSERT INTO users (email, name, password, google_id, avatar_url, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.email, data.name, data.password || null, data.google_id || null, data.avatar_url || null, data.is_verified ?? true]
      );
      return res.rows[0];
    } catch (error) {
      console.warn('[DB Error] Falling back to memory store for createUser');
      const newUser: MemoryUser = {
        id: memoryStore.nextUserId++,
        email: data.email,
        name: data.name,
        password: data.password,
        google_id: data.google_id,
        avatar_url: data.avatar_url,
        is_verified: data.is_verified ?? true,
        created_at: new Date(),
      };
      memoryStore.users.push(newUser);
      return newUser;
    }
  },

  async updateUser(id: number, data: Partial<MemoryUser>) {
    if (useMemoryStore) {
      const index = memoryStore.users.findIndex(u => u.id === id);
      if (index !== -1) {
        memoryStore.users[index] = { ...memoryStore.users[index], ...data };
        return memoryStore.users[index];
      }
      return null;
    }
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.name !== undefined) { setClause.push(`name = $${idx++}`); values.push(data.name); }
      if (data.password !== undefined) { setClause.push(`password = $${idx++}`); values.push(data.password); }
      if (data.google_id !== undefined) { setClause.push(`google_id = $${idx++}`); values.push(data.google_id); }
      if (data.avatar_url !== undefined) { setClause.push(`avatar_url = $${idx++}`); values.push(data.avatar_url); }
      if (data.is_verified !== undefined) { setClause.push(`is_verified = $${idx++}`); values.push(data.is_verified); }

      values.push(id);
      const res = await pool.query(
        `UPDATE users SET ${setClause.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      return res.rows[0];
    } catch {
      const index = memoryStore.users.findIndex(u => u.id === id);
      if (index !== -1) {
        memoryStore.users[index] = { ...memoryStore.users[index], ...data };
        return memoryStore.users[index];
      }
      return null;
    }
  }
};

// OTP repository functions
export const OtpRepo = {
  async saveOtp(email: string, otp: string, expiresAt: Date) {
    if (useMemoryStore) {
      // Remove old OTPs for this email
      memoryStore.otps = memoryStore.otps.filter(o => o.email.toLowerCase() !== email.toLowerCase());
      const newOtp: MemoryOtp = {
        id: memoryStore.nextOtpId++,
        email,
        otp,
        expires_at: expiresAt,
        created_at: new Date(),
      };
      memoryStore.otps.push(newOtp);
      return newOtp;
    }
    try {
      await pool.query('DELETE FROM otps WHERE LOWER(email) = LOWER($1)', [email]);
      const res = await pool.query(
        `INSERT INTO otps (email, otp, expires_at)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [email, otp, expiresAt]
      );
      return res.rows[0];
    } catch {
      memoryStore.otps = memoryStore.otps.filter(o => o.email.toLowerCase() !== email.toLowerCase());
      const newOtp: MemoryOtp = {
        id: memoryStore.nextOtpId++,
        email,
        otp,
        expires_at: expiresAt,
        created_at: new Date(),
      };
      memoryStore.otps.push(newOtp);
      return newOtp;
    }
  },

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const now = new Date();
    if (useMemoryStore) {
      const found = memoryStore.otps.find(
        o => o.email.toLowerCase() === email.toLowerCase() && o.otp === otp && o.expires_at > now
      );
      if (found) {
        memoryStore.otps = memoryStore.otps.filter(o => o.id !== found.id);
        return true;
      }
      return false;
    }
    try {
      const res = await pool.query(
        `SELECT * FROM otps WHERE LOWER(email) = LOWER($1) AND otp = $2 AND expires_at > $3 ORDER BY id DESC LIMIT 1`,
        [email, otp, now]
      );
      if (res.rows.length > 0) {
        await pool.query('DELETE FROM otps WHERE id = $1', [res.rows[0].id]);
        return true;
      }
      return false;
    } catch {
      const found = memoryStore.otps.find(
        o => o.email.toLowerCase() === email.toLowerCase() && o.otp === otp && o.expires_at > now
      );
      if (found) {
        memoryStore.otps = memoryStore.otps.filter(o => o.id !== found.id);
        return true;
      }
      return false;
    }
  }
};
