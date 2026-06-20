const fs = require('fs');
let data = fs.readFileSync('public/images/logo-safeplace-icon.svg', 'utf8');
data = data.replace(/<svg[^>]+>/, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" zoomAndPan="magnify" viewBox="940 800 1000 1000" height="1000" preserveAspectRatio="xMidYMid meet" version="1.0">');
fs.writeFileSync('public/images/logo-safeplace-icon.svg', data);
console.log('Done');
