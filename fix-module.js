const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace ALL <script> tags that have a src attribute but no type="module"
// This handles: <script src="...">, <script src="..." defer>, <script defer src="...">, etc.
html = html.replace(/<script(?![^>]*type=)(([^>]*?)src="([^"]*)"([^>]*?))>/g, '<script type="module"$1>');

fs.writeFileSync(htmlPath, html);

// Verify the fix worked
const result = fs.readFileSync(htmlPath, 'utf8');
const scriptTags = result.match(/<script[^>]*src[^>]*>/g) || [];
console.log('Patched script tags:');
scriptTags.forEach(tag => console.log('  ' + tag));

const unpatched = scriptTags.filter(t => !t.includes('type="module"'));
if (unpatched.length > 0) {
  console.error('WARNING: Some script tags were NOT patched:');
  unpatched.forEach(tag => console.error('  ' + tag));
  process.exit(1);
} else {
  console.log('All script tags have type="module" - OK');
}
