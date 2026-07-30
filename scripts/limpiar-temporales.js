const fs = require('fs');
const path = require('path');

const carpeta = path.join(__dirname, '..', 'assets', 'uploads', 'temporales');

for (const archivo of fs.readdirSync(carpeta)) {
  fs.unlinkSync(path.join(carpeta, archivo));
}

console.log('Temporales limpiados.');
