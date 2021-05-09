require('dotenv').config()

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

AWS.config.credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID
AWS.config.credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

console.log(process.env.AWS_ACCESS_KEY_ID);
console.log(process.env.AWS_SECRET_ACCESS_KEY);

const myRegion = 'ap-south-1';

// Set region
AWS.config.update({region: myRegion});

// Crate instance of sdk
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// const credentials = new AWS.SharedIniFileCredentials({profile: 'work-account'});
// AWS.config.credentials = credentials;

console.log(AWS.config.credentials );

const getBuckets = async () => {
  return new Promise((resolve, reject) => {
    s3.listBuckets(function(err, data) {
      if (err) {
        return reject(err)
      }
      resolve(data.Buckets);
    });
  });
}

const uploadFile = async (bucketName, fromFilePath, toBucketPath) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(fromFilePath);

    fileStream.on('error', function(err) {
      reject(err);
    });

    const uploadParams = {
      Bucket: bucketName,
      Key: toBucketPath,
      Body: fileStream
    };

    s3.upload (uploadParams, function (err, data) {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

(async() => {
  const buckets = await getBuckets();
  const bucketName = 'nishants.in';
  const fromFilePath = path.join(__dirname, "sample-files", "file1.txt");
  const toBucketPath = "____/sample-uploads/file1.txt";
  await uploadFile(bucketName, fromFilePath, toBucketPath);
  console.log({buckets});
})();

