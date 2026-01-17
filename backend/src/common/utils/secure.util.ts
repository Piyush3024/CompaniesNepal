import * as crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this';

// Derive a 32-byte key from the secret for AES-256
function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(SECRET_KEY).digest();
}

/**
 * Encrypts an ID using AES-256-GCM for secure, unpredictable encoding
 * @param id - The numeric ID to encode
 * @returns Encrypted ID as a hex string
 */
export function encodeId(id: number): string {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new Error('Invalid ID provided');
    }

    // Generate a random initialization vector (IV)
    const iv = crypto.randomBytes(12); // 12 bytes for GCM mode

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);

    // Encrypt the ID
    const idBuffer = Buffer.from(id.toString(), 'utf8');
    const encrypted = Buffer.concat([cipher.update(idBuffer), cipher.final()]);

    // Get the authentication tag
    const authTag = cipher.getAuthTag();

    // Combine IV + encrypted data + auth tag and convert to hex
    const combined = Buffer.concat([iv, encrypted, authTag]);

    return combined.toString('hex');
  } catch (error) {
    console.error('Error encoding ID:', error);
    throw new Error('Failed to encode ID');
  }
}

/**
 * Decrypts an encoded ID back to the original numeric ID
 * @param encodedId - The hex-encoded encrypted ID
 * @returns The original numeric ID
 * @throws Error if the encoded ID is invalid or tampered with
 */
export function decodeId(encodedId: string): number {
  try {
    if (!encodedId || typeof encodedId !== 'string') {
      throw new Error('Invalid encoded ID provided');
    }

    // Convert from hex to buffer
    const combined = Buffer.from(encodedId, 'hex');

    // Extract components
    // IV: 12 bytes, Auth Tag: 16 bytes (last), Encrypted data: everything in between
    if (combined.length < 29) {
      // 12 (IV) + 1 (min data) + 16 (tag)
      throw new Error('Invalid encoded ID format');
    }

    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(combined.length - 16);
    const encrypted = combined.subarray(12, combined.length - 16);

    // Create decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      getEncryptionKey(),
      iv,
    );
    decipher.setAuthTag(authTag);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    // Convert back to number
    const idString = decrypted.toString('utf8');
    const id = parseInt(idString, 10);

    if (isNaN(id) || id <= 0) {
      throw new Error('Decoded ID is not a valid number');
    }

    return id;
  } catch (error) {
    if (error instanceof Error) {
      // Provide more specific error messages
      if (
        error.message.includes('Unsupported state') ||
        error.message.includes('auth') ||
        error.message.includes('tag')
      ) {
        throw new Error('Invalid or tampered encoded ID');
      }
      if (error.message.includes('Invalid encoded ID')) {
        throw error;
      }
    }
    console.error('Error decoding ID:', error);
    throw new Error('Invalid encoded ID format');
  }
}

/**
 * Legacy base62 encoding - kept for backward compatibility if needed
 */
const BASE62_CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function toBase62(num: number): string {
  if (num === 0) return '0';

  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

function fromBase62(str: string): number {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE62_CHARS.indexOf(char);
    if (value === -1) {
      throw new Error('Invalid base62 character');
    }
    result = result * 62 + value;
  }
  return result;
}

export function simpleEncodeId(id: number): string {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid ID provided');
    }
    return toBase62(id);
  } catch (error) {
    console.error('Error encoding ID:', error);
    throw new Error('Failed to encode ID');
  }
}

export function simpleDecodeId(encodedId: string): number {
  try {
    if (!encodedId || typeof encodedId !== 'string') {
      throw new Error('Invalid encoded ID provided');
    }
    return fromBase62(encodedId);
  } catch (error) {
    console.error('Error decoding ID:', error);
    throw new Error('Failed to decode ID');
  }
}
