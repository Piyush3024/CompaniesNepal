import crypto from "crypto";

// Function to generate a random secret
const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

import Hashids from "hashids";

const salt = "your_super_secret_salt"; // Use environment variable in production
const hashids = new Hashids(salt, 10); // min length of hash = 10

// Encode integer to hash
export const hashId = (id) => {
  return hashids.encode(id);
};

// Decode hash back to original integer
export const decodeHashId = (hashedId) => {
  const decoded = hashids.decode(hashedId);
  return decoded.length ? decoded[0] : null;
};

// Generate secrets for JhuniCodes
console.log('ACCESS_TOKEN_SECRET:', generateSecret());
// console.log('HASH_ID:', hashId());
// console.log('PASSWORD_RESET_SECRET:', generateSecret());
// console.log('SESSION_SECRET:', generateSecret());
// console.log('RESET_TOKEN_SECRET:', generateSecret());
// console.log('NEXTAUTH_SECRET:', generateSecret());

// console.log("ENC_SECRET_KEY:", generateSecret());

;
