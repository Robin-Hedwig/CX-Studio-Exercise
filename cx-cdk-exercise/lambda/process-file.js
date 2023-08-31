
const AWS = require('aws-sdk');
const textract = new AWS.Textract();
const dynamodb = new AWS.DynamoDB.DocumentClient();

//handler that uses AWS textract to process pdf, png, jpg files
exports.handler = async (event) => {
    try {
        console.log("Received event: ", JSON.stringify(event, null, 2));
        const bucket = event.Records[0].s3.bucket.name;
        const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

        const params = {
            DocumentLocation: {
                S3Object: {
                    Bucket: bucket,
                    Name: key,
                },
            },
            FeatureTypes: ["TABLES"], 
        };

        //starting the job to process the files
        console.log("Starting document analysis...");
        const startJob = await textract.startDocumentAnalysis(params).promise();
        const jobId = startJob.JobId;
        console.log('Started job with jobId:', jobId);

        let jobStatus = 'IN_PROGRESS';
        let result;
        //waiting for the job to complete- it has to either succeed or fail
        while (jobStatus === 'IN_PROGRESS') {
            console.log("Polling job status...");
            result = await textract.getDocumentAnalysis({ JobId: jobId }).promise();
            jobStatus = result.JobStatus;
            console.log('Current jobStatus:', jobStatus);
            if (jobStatus === 'IN_PROGRESS') {
                await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds before polling again
            }
        }

        //once it succeeds, dynamodb table is updated with same key(email id)
        if (jobStatus === 'SUCCEEDED') {
            console.log("Job completed. Extracting data...");
            const text = result.Blocks.filter(block => block.BlockType === 'LINE').map(block => block.Text).join(' ');
            const tables = result.Blocks.filter(block => block.BlockType === 'TABLE');

            const email = key.split('/')[0];

            const dbParams = {
                TableName: process.env.TABLE_NAME,
                Key: { email },
                UpdateExpression: 'set resume = :r, tables = :t',
                ExpressionAttributeValues: {
                    ':r': text,
                    ':t': JSON.stringify(tables),
                },
            };
            console.log('Updating DynamoDB with params:', dbParams);

            await dynamodb.update(dbParams).promise();

            console.log("Data extracted successfully and updated in DynamoDB!");

            return {
                statusCode: 200,
                body: JSON.stringify('Data extracted successfully and updated in DynamoDB!'),
            };
        } else {
            console.error("Job did not succeed. Status:", jobStatus);
            console.error("Result:", JSON.stringify(result, null, 2));
            throw new Error("Textract job did not succeed");
        }
    } catch (error) {
        console.error("Error processing document:", error);
        throw error;
    }
};