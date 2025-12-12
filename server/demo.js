import crypto from "crypto"

// Function to generate a random secret
const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate secrets for JhuniCodes
console.log('ACCESS_TOKEN_SECRET:', generateSecret());
console.log('REFRESH_TOKEN_SECRET:', generateSecret());

// console.log('SESSION_SECRET:', generateSecret());
// console.log('RESET_TOKEN_SECRET:', generateSecret());
// console.log('NEXTAUTH_SECRET:', generateSecret());