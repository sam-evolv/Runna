const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf8');
const fixed = html.replace(
  /<script src="\/_expo\/static\/js\/web\//g,
  '<script type="module" src="/_expo/static/js/web/'
);
fs.writeFileSync('dist/index.html', fixed);
console.log('Script tags patched to type=module');
