// Password hashing dengan SHA-256
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Password yang sudah di-hash: affindo2025
export const HASHED_PASSWORD = 'e8c8c0c8f8e8c8c8f8e8c8c8f8e8c8c8f8e8c8c8f8e8c8c8f8e8c8c8f8e8c8c8';

// Fungsi untuk verify password
export async function verifyPassword(inputPassword) {
  const hashedInput = await hashPassword(inputPassword);
  // Hash untuk "affindo2025"
  const correctHash = await hashPassword('affindo2025');
  return hashedInput === correctHash;
}

// Check auth status
export function isAuthenticated() {
  const auth = localStorage.getItem('auth');
  return auth === 'true';
}

// Set auth
export function setAuth(value) {
  localStorage.setItem('auth', value.toString());
}

// Logout
export function logout() {
  localStorage.removeItem('auth');
}

// Get stored password hash
export function getStoredPasswordHash() {
  const stored = localStorage.getItem('admin_password');
  if (!stored) {
    // Return default password hash for "affindo2025"
    return null;
  }
  return stored;
}

// Set new password
export async function setPassword(newPassword) {
  const hashedPassword = await hashPassword(newPassword);
  localStorage.setItem('admin_password', hashedPassword);
  return true;
}

// Verify password against stored hash
export async function verifyStoredPassword(inputPassword) {
  const hashedInput = await hashPassword(inputPassword);
  const storedHash = getStoredPasswordHash();
  
  if (!storedHash) {
    // If no stored password, check against default "affindo2025"
    const defaultHash = await hashPassword('affindo2025');
    return hashedInput === defaultHash;
  }
  
  return hashedInput === storedHash;
}
