const fs = require('fs');

const reader = fs.createReadStream('./123');

reader.on('data', (chunk) => {
  console.log(chunk);
});
