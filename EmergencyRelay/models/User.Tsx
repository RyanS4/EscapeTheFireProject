import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  token: string;
  active: boolean;
}

export const isAdmin = (u?: Pick<User, 'role'> | null): u is User & { role: 'admin' } =>
  !!u && u.role === 'admin';

export const isStaff = (u?: Pick<User, 'role'> | null): u is User & { role: 'staff' } =>
  !!u && u.role === 'staff';

// Authentication/credential types
// NOTE: Do NOT store plain-text passwords on the client or inside the `User` object.
// Use `UserCredentials` for forms and transport (sent over TLS), and keep the
// server-side representation separate (with a hashed password).
export interface UserCredentials {
  email: string;
  password: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'staff';
}

// Server-side user record (never send `passwordHash` to clients)
export interface UserRecord extends User {
  // passwordHash should be produced by a secure hashing algorithm (bcrypt/argon2)
  // and stored only on the server.
  passwordHash: string;
}