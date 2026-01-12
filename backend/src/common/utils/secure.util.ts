import * as crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this';

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

function createShortHash(input: string | number): string {
  const hash = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(input.toString())
    .digest('hex');
  // Take first 8 characters for shorter hash
  return hash.substring(0, 8);
}

export function encodeId(id: number): string {
  try {
    if (!id || typeof id !== 'number') {
      throw new Error('Invalid ID provided');
    }

    // Convert to base62 for shorter representation
    const base62Id = toBase62(id);

    // Create a short hash for verification
    const hash = createShortHash(id);

    // Combine base62 ID with short hash (separated by a delimiter)
    const encoded = `${base62Id}-${hash}`;

    return encoded;
  } catch (error) {
    console.error('Error encoding ID:', error);
    throw new Error('Failed to encode ID');
  }
}

export function decodeId(encodedId: string): number {
  try {
    if (!encodedId || typeof encodedId !== 'string') {
      throw new Error('Invalid encoded ID provided');
    }

    // Split the encoded ID
    const parts = encodedId.split('-');
    if (parts.length !== 2) {
      throw new Error('Invalid encoded ID format');
    }

    const [base62Id, providedHash] = parts;

    // Decode from base62
    const originalId = fromBase62(base62Id);

    // Verify the hash
    const expectedHash = createShortHash(originalId);
    if (providedHash !== expectedHash) {
      throw new Error('Invalid encoded ID - hash verification failed');
    }

    return originalId;
  } catch (error) {
    console.error('Error decoding ID:', error);
    throw new Error('Failed to decode ID');
  }
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
