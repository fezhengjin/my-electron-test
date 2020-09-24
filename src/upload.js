const workerpool = require('workerpool');
const path = require('path');
const fs = require('fs');
const s3 = require('./s3');

// a deliberately inefficient implementation of the fibonacci sequence
function upload(file, folder) {
  return new Promise((resolve, reject) => {
    const data = fs.readFileSync(path.join(__dirname, '../test', file));
    const filepath = [folder, file].join('/');
    s3.putObject({
      Body: data,
      Bucket: 'bucket-zj',
      Key: filepath,
    }, function(err, data) {
      if (err) reject(err);
      else resolve(filepath);
    });
  });
}

// create a worker and register public functions
workerpool.worker({
  upload: upload,
});