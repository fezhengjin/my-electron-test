const workerpool = require('workerpool');
const path = require('path');
const fs = require('fs');
const s3 = require('./s3');

// a deliberately inefficient implementation of the fibonacci sequence
function download(file, folder) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(folder, file);

    if (file && file.endsWith('/')) {
      fs.mkdirSync(filepath);
      resolve(filepath);
    } else {
      s3.getObject({
        Bucket: 'bucket-zj',
        Key: file,
      }, function(err, data) {
        if (err) reject(err);
        else {
          // resolve(filepath);
          fs.writeFile(filepath, data.Body, err => {
            if (err) reject(err);
            else resolve(filepath);
          });
        }
      });
    }
  });
}

// create a worker and register public functions
workerpool.worker({
  download: download,
});