const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const getContentType = (file) => {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'application/javascript';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
};

const uploadDirectory = async (directoryPath, bucketName) => {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
      Bucket: bucketName,
      Key: file,
      Body: fileStream,
      ContentType: getContentType(file),
    };

    try {
      await s3.upload(uploadParams).promise();
      console.log(`Uploaded ${file} to ${bucketName}`);
    } catch (error) {
      console.error(`Failed to upload ${file}:`, error);
    }
  }
};

const buildDir = path.resolve(__dirname, 'dist');
const bucketName = process.env.AWS_BUCKET_NAME;

if (fs.existsSync(buildDir)) {
  uploadDirectory(buildDir, bucketName)
    .then(() => console.log('Deployment complete!'))
    .catch((error) => console.error('Deployment failed:', error));
} else {
  console.error(
    `Build directory "${buildDir}" not found. Run "npm run build" first.`
  );
}
