const AWS = require('aws-sdk');
const express = require('express');
const multer = require('multer');

const app = express();
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const { email, name, phoneNumber, gender, disability, visaStatus } = req.body;

  const dbParams = {
    TableName: process.env.TABLE_NAME,
    Item: {
      email,
      name,
      phoneNumber,
      gender,
      disability,
      visaStatus,
      resume: ''
    },
  };

  //updating dynamodb table with user details recieved along with the file as form data
  try {
    await dynamodb.put(dbParams).promise();

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${email}/${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    
    //uploading file to s3
    try {
      await s3.upload(params).promise();

      res.status(200).send('File uploaded successfully and data stored in DynamoDB');
    } catch (err) {
      const deleteParams = {
        TableName: process.env.TABLE_NAME,
        Key: { email },
      };

      //deleting the dynamodb entry if the upload failed
      await dynamodb.delete(deleteParams).promise();

      res.status(500).send('File upload failed, data rolled back from DynamoDB');
    }
  } catch (err) {
    res.status(500).send('Data save failed, file not uploaded');
  }
});


module.exports = app;