/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { generateKeyPairSync } = require('crypto');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileIfMissing(filePath, contents) {
  if (fs.existsSync(filePath)) {
    console.log(`exists: ${filePath}`);
    return;
  }
  fs.writeFileSync(filePath, contents, { encoding: 'utf8', flag: 'wx' });
  console.log(`wrote: ${filePath}`);
}

const root = path.resolve(__dirname, '..');
const keysDir = path.join(root, 'keys');
ensureDir(keysDir);

const privPath = path.join(keysDir, 'jwt_private.pem');
const pubPath = path.join(keysDir, 'jwt_public.pem');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

writeFileIfMissing(privPath, privateKey);
writeFileIfMissing(pubPath, publicKey);

console.log('');
console.log('JWT keys ready:');
console.log(`- ${privPath}`);
console.log(`- ${pubPath}`);
console.log('');
console.log('Set these in server/.env:');
console.log('JWT_PRIVATE_KEY_PATH=server/keys/jwt_private.pem');
console.log('JWT_PUBLIC_KEY_PATH=server/keys/jwt_public.pem');

