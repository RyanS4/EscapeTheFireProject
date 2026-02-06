const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Use a lightweight pure-JS embedded DB to avoid native build issues.
const nedb = require('nedb-promises');
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'users.db');

function openDb() {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const users = nedb.create({ filename: DB_FILE, autoload: true });
  // ensure index on email
  users.ensureIndex({ fieldName: 'email', unique: true }).catch(() => {});
  return users;
}

async function migrateFromJson(users) {
  const jsonFile = path.join(__dirname, '../data/users.json');
  try {
    if (!fs.existsSync(jsonFile)) return;
    const raw = fs.readFileSync(jsonFile, 'utf8');
    const rows = JSON.parse(raw || '[]');
    for (const u of rows) {
      try {
        await users.insert({
          id: u.id,
          email: u.email,
          password_hash: u.password_hash,
          roles: u.roles || ['staff'],
          status: u.status || 'active',
          created_at: u.created_at || new Date().toISOString(),
          session: u.session || null,
        });
      } catch (e) {
        // ignore insert conflict (already migrated)
      }
    }
  } catch (e) {
    console.warn('Migration from JSON failed:', e && e.message);
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}
function verifyPassword(password, stored) {
  if (!stored) return false;
  const [salt, hashHex] = stored.split(':');
  const derived = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hashHex, 'hex'), derived);
}

const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

// Initialize DB (NeDB) and migrate JSON data
const db = openDb();
(async () => { await migrateFromJson(db); })();

// Admin creates a user
// Admin creates a user
app.post('/admin/users/create', async (req, res) => {
  const { email, password, roles } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email_and_password_required' });
  const normalized = String(email).trim().toLowerCase();
  try {
    const existing = await db.findOne({ email: normalized });
    if (existing) return res.status(409).json({ error: 'email_exists' });
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const password_hash = hashPassword(password);
    const doc = {
      id,
      email: normalized,
      password_hash,
      roles: roles || ['staff'],
      status: 'active',
      created_at: new Date().toISOString(),
      session: null,
    };
    await db.insert(doc);
    res.status(201).json({ id, email: normalized, roles: doc.roles });
  } catch (e) {
    console.error('Create user failed', e && e.message);
    return res.status(500).json({ error: 'create_failed' });
  }
});

// Public login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing' });
  const normalized = String(email).trim().toLowerCase();
  const row = await db.findOne({ email: normalized, status: 'active' });
  if (!row) return res.status(401).json({ error: 'invalid_credentials' });
  if (!verifyPassword(password, row.password_hash)) return res.status(401).json({ error: 'invalid_credentials' });
  const token = crypto.randomBytes(24).toString('hex');
  await db.update({ id: row.id }, { $set: { session: token } });
  res.json({ token, user: { id: row.id, email: row.email, roles: row.roles } });
});

// Simple endpoint to check token
app.get('/auth/me', async (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'no_auth' });
  const token = auth.replace(/^Bearer\s+/, '');
  const row = await db.findOne({ session: token });
  if (!row) return res.status(401).json({ error: 'invalid' });
  res.json({ id: row.id, email: row.email, roles: row.roles });
});

// Admin deletes a user by id
async function userFromToken(req) {
  const auth = req.headers && req.headers['authorization'];
  if (!auth) return null;
  const token = String(auth).replace(/^Bearer\s+/, '');
  try {
    const u = await db.findOne({ session: token });
    return u || null;
  } catch (e) { return null; }
}

app.delete('/admin/users/:id', async (req, res) => {
  const { id } = req.params || {};
  if (!id) return res.status(400).json({ error: 'missing_id' });
  const caller = await userFromToken(req);
  if (!caller || !Array.isArray(caller.roles) || !caller.roles.includes('admin')) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const info = await db.remove({ id }, { multi: false });
  if (!info || info === 0) return res.status(404).json({ error: 'not_found' });
  res.status(204).send();
});

// Admin list users (simple listing for admin UI)
app.get('/admin/users', async (req, res) => {
  const caller = await userFromToken(req);
  if (!caller || !Array.isArray(caller.roles) || !caller.roles.includes('admin')) {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    const rows = await db.find({});
    // return limited fields
    const out = rows.map(r => ({ id: r.id, email: r.email, roles: r.roles, status: r.status }));
    res.json(out);
  } catch (e) {
    console.error('List users failed', e && e.message);
    res.status(500).json({ error: 'list_failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server listening ${PORT}`));
