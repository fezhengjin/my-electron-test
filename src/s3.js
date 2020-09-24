const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  endpoint: 'http://10.252.3.67:8060',
  accessKeyId: 'B94DEX477JAEGLDXCPI2',
  secretAccessKey: 'Ph9LTJvjQrnKRZVkvVjremP5d9Mxu6W0pBeKhyfk',
  s3ForcePathStyle: true,
});

module.exports = s3;