const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');

// Patch ALL script tags with src to include type="module"
// This handles any Expo export format
const fixed = html
  .replace(/<script src="/g, '<script type="module" src="')
  .replace(/<script defer src="/g, '<script type="module" defer src="')
  .replace(/<script src="(.*?)" defer>/g, '<script type="module" src="$1" defer>');

fs.writeFileSync('dist/index.html', fixed);
console.log('Script tags patched to type=module');
