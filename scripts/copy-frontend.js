const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'frontend', 'dist');
const dest = path.join(__dirname, '..', 'backend', 'public');

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true });
}
fs.cpSync(src, dest, { recursive: true });
console.log(`Copied frontend/dist -> backend/public`);
