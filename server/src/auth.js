// Real admin auth, replacing the old hardcoded admin1/admin789 check that
// used to live entirely in the frontend (anyone could read it straight out
// of the JS bundle, and it never actually protected the PUT endpoint).
//
// The admin account lives in the AdminUser table (see schema.prisma and
// prisma/create-admin.js) — just one row for now, but a real table instead
// of an env var means the password can be changed via the DB without
// editing server/.env or restarting the server.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

const TOKEN_LIFETIME = '8h';

// POST /api/auth/login — checks the submitted credentials against the
// AdminUser table and, if they match, returns a signed JWT the frontend
// stores and sends back on future admin requests (see requireAuth below).
export async function login(req, res) {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const admin = await prisma.adminUser.findUnique({ where: { username } });

  // bcrypt.compare against a real hash if we found one, or against a dummy
  // hash if we didn't — comparing against *something* either way keeps a
  // wrong-username request taking roughly as long as a wrong-password one,
  // so a script probing for valid usernames can't tell them apart by timing.
  const passwordMatches = await bcrypt.compare(
    password,
    admin?.passwordHash ?? '$2a$10$invalidsaltinvalidsaltinvalidsaltinvalidsa'
  );

  if (!admin || !passwordMatches) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  // The token's payload just marks "this is the admin" — there's no role
  // system to encode since there's only one account. jwt.sign signs it with
  // JWT_SECRET so requireAuth can later verify it wasn't tampered with (a
  // client can't forge a valid token without knowing the secret).
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_LIFETIME,
  });

  res.json({ token });
}

// Middleware that protects admin-only routes (currently just the PUT
// endpoint). Expects "Authorization: Bearer <token>" on the request —
// without a valid token, the request never reaches the route handler.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    // Covers both a tampered/invalid signature and a token past its 8h expiry.
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
