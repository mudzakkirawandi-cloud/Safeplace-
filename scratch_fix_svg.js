const fs = require('fs');
let data = fs.readFileSync('public/images/logo-safeplace-icon.svg', 'utf8');
data = data.replace('viewBox="0 0 2880 2879.999992" height="3840"', 'viewBox="0 0 2880 1600" height="2133"');
fs.writeFileSync('public/images/logo-safeplace-icon.svg', data);
console.log('Done');
