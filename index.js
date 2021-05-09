require('dotenv').config()

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const getMimeTypeFor = require('./ExtensionMimeMap');

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

    const extension = "." + fromFilePath.split('.').pop();

    const uploadParams = {
      Bucket: bucketName,
      Key: toBucketPath,
      Body: fileStream,
      ContentType: getMimeTypeFor(extension)
    };

    s3.upload (uploadParams, function (err, data) {
      if (err) {
        return reject(err);
      }
      console.log(`Uploaded : ${fromFilePath} to ${bucketName}:${toBucketPath}`, uploadParams.ContentType)
      resolve(data);
    });
  });
}

const getAllFilesInDirRecursively = (dirPath) => {
  return new Promise((resolve) => {
    fs.readdir(dirPath, async (error, directFilesInDir) => {
      const files = [];
      const dir = [];
      for(let file of directFilesInDir){
        const absolutePath = path.join(dirPath, file);
        const isDir = fs.statSync(absolutePath).isDirectory();
        isDir ? dir.push(absolutePath) : files.push(absolutePath);
      }
      const nestedFiles = await Promise.all(dir.map(getAllFilesInDirRecursively));
      const allRecursiveFiles = nestedFiles.reduce((all, files) => {
        return [
          ...all,
          ...files
        ]
      }, [])
      resolve([...files, ...allRecursiveFiles])
    });
  });
}

const uploadPathToBucket = async (bucketName, fromDirPath, toBucketPath) => {
  const allFiles = await getAllFilesInDirRecursively(fromDirPath);
  return Promise.all(allFiles.map((absoluteFilePath) => {
    const relativePath = path.relative(fromDirPath, absoluteFilePath);
    const pathInBucket = path.join(toBucketPath, relativePath);
    return uploadFile(bucketName, absoluteFilePath, pathInBucket);
  }));
};

(async() => {
  // const buckets = await getBuckets();
  // console.log({buckets});
  //
  const bucketName = 'nishants.in';
  // const fromFilePath = path.join(__dirname, "sample-files", "file2.txt");
  // const toBucketPath = "____/sample-uploads/file3.txt";
  // await uploadFile(bucketName, fromFilePath, toBucketPath);

  const toBucketPath = "____/sample-uploads/out-4";

  const formDirPath = '/Users/dawn/projects/hello-nextjs/out';
  const createdFiles = await uploadPathToBucket(bucketName, formDirPath, toBucketPath);
  console.log({createdFiles})
})();

