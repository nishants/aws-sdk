source: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-creating-buckets.html

cloudfront: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFront.html



# AWS Sdk



- Add sdk to project

  ```
  yarn add aws-sdk
  ```

  

- Create sdks instance

  ```
  const AWS = require('aws-sdk');
  
  const myRegion = 'ap-south-1';
  
  // Set region
  AWS.config.update({region: myRegion});
  
  // Crate instance of sdk 
  s3 = new AWS.S3({apiVersion: '2006-03-01'});
  
  ```

  

- Create user if not already exists : https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html

  > Create permissions (give S3/Cloudfront access)
  >
  > Create users group with the permissions
  >
  > Create new user and add to the user group.
  >
  > Generate an access key and secret to user in client.



- **Setup credentials**

  > You can set the system level configuration :https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html
  >
  > I personally prefer that it should be well defined how to get access keys when you look at code. So I prefer having them in env variables: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html
  >
  > We need two env vars : 
  >
  > ```
  > AWS_ACCESS_KEY_ID
  > AWS_SECRET_ACCESS_KEY
  > ```
  > 
  >
  > Setup env variables
  >
  > ```bash
  > yarn add dotenv
  > ```
  >
  >  
  >
  > Create `.env` file with credentials
  >
  > ```properties
  > AWS_ACCESS_KEY_ID=GKAKAFAKEQ2BGEYJZXXX
  > AWS_SECRET_ACCESS_KEY=GKAKAFAKEQ2BGEYJZXXXRDmb/Ev2BGEYJZXXX
  > ```
  >
  >  
  >
  > Now add this line at the entrypoint of our client (first line of index.js)
  >
  > ```
  > require('dotenv').config()
  > 
  > 
  > 
  > ```
  >
  >  
  >
  > Use credentials from env variables
  >
  > ```
  > AWS.config.credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID
  > AWS.config.credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  > ```
  >
  >  
  >
  > ```
  > AWS_ACCESS_KEY_ID=AKIAXZHOHQ2BGEYJZ4GS
  > AWS_SECRET_ACCESS_KEY=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
  > 
  > ```



- **List buckets**

  ```javascript
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
  
  
  (async() => {
    const buckets = await getBuckets();
    console.log({buckets});
  })();
  ```

  

- Upload file to s3

  ```javascript
  
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
  ```

  

- Create function to read all files recursively in a dir

  ```javascript
  
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
        const nestedFiles = await Promise.all(dir.map(getAllFiles));
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
  ```

  

- Now create a function to upload all files to S3 from a dir : 

  ```javascript
  const uploadPathToBucket = async (bucketName, fromDirPath, toBucketPath) => {
    const allFiles = await getAllFilesInDirRecursively(fromDirPath);
    return Promise.all(allFiles.map((absoluteFilePath) => {
      const relativePath = path.relative(fromDirPath, absoluteFilePath);
      const pathInBucket = path.join(toBucketPath, relativePath);
      return uploadFile(bucketName, absoluteFilePath, pathInBucket);
    }));
  };
  ```



- Getting mime types from : https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

  ```javascript
  const toArray = (collection) => {
  	const array = [];
    [].push.apply(array, collection);
    return array;
  };
  
  rows = toArray(document.getElementsByClassName("standard-table")[0].rows).slice(1)
  
  map = {};
  
  rows.forEach((row) => {
    const cells = toArray(row.cells);
    const extensions =  cells[0].innerText;
    const mimeType = cells[2].innerText;
    extensions.split("\n").forEach((ext) => {
      map[ext.trim()] = mimeType.trim()
    })
  })
  
  document.getElementsByClassName("standard-table")[0].rows
  
  ```





- Save the list of mime types in `ExtensionMimeMap.js`

  ```javascript
  const map = {
    ".aac": "audio/aac",
    ".abw": "application/x-abiword",
    ".arc": "application/x-freearc",
    ".avi": "video/x-msvideo",
    ".azw": "application/vnd.amazon.ebook",
    ".bin": "application/octet-stream",
    ".bmp": "image/bmp",
    ".bz": "application/x-bzip",
    ".bz2": "application/x-bzip2",
    ".csh": "application/x-csh",
    ".css": "text/css",
    ".csv": "text/csv",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".eot": "application/vnd.ms-fontobject",
    ".epub": "application/epub+zip",
    ".gz": "application/gzip",
    ".gif": "image/gif",
    ".htm": "text/html",
    ".html": "text/html",
    ".ico": "image/vnd.microsoft.icon",
    ".ics": "text/calendar",
    ".jar": "application/java-archive",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".jsonld": "application/ld+json",
    ".mid": "audio/midi",
    ".midi": "audio/midi",
    ".mjs": "text/javascript",
    ".mp3": "audio/mpeg",
    ".cda": "application/x-cdf",
    ".mp4": "video/mp4",
    ".mpeg": "video/mpeg",
    ".mpkg": "application/vnd.apple.installer+xml",
    ".odp": "application/vnd.oasis.opendocument.presentation",
    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".oga": "audio/ogg",
    ".ogv": "video/ogg",
    ".ogx": "application/ogg",
    ".opus": "audio/opus",
    ".otf": "font/otf",
    ".png": "image/png",
    ".pdf": "application/pdf",
    ".php": "application/x-httpd-php",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".rar": "application/vnd.rar",
    ".rtf": "application/rtf",
    ".sh": "application/x-sh",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tar": "application/x-tar",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".ts": "video/mp2t",
    ".ttf": "font/ttf",
    ".txt": "text/plain",
    ".vsd": "application/vnd.visio",
    ".wav": "audio/wav",
    ".weba": "audio/webm",
    ".webm": "video/webm",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xhtml": "application/xhtml+xml",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xml": "application/xml",
    ".xul": "application/vnd.mozilla.xul+xml",
    ".zip": "application/zip",
    ".3gp": "video/3gpp",
    ".3g2": "video/3gpp2",
    ".7z": "application/x-7z-compressed"
  }
  
  module.exports = (ext) => map[ext]; 
  ```



- Now update our code

  ```diff
    const path = require('path');
  + const getMimeTypeFor = require('./ExtensionMimeMap');
    ...
    
    const uploadFile = async (bucketName, fromFilePath, toBucketPath) => {
    ...
  + const extension = "." + fromFilePath.split('.').pop();
  
    const uploadParams = {
        Bucket: bucketName,
        Key: toBucketPath,
        Body: fileStream,
  +     ContentType: getMimeTypeFor(extension)
    };
  ```

  

