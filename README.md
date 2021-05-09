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

  

- 