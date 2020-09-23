const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  endpoint: 'http://10.252.3.67:8060',
  accessKeyId: '11111111111111111111',
  secretAccessKey: '1111111111111111111111111111111111111111',
  s3ForcePathStyle: true,
});

module.exports = s3;