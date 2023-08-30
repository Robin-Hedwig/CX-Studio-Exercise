import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';


export class CxCdkExerciseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   //Created an S3 bucket -> server-side encryption enabled and versioning enabled
   const bucket = new s3.Bucket(this, 'Bucket', {
    versioned: true,
    encryption: s3.BucketEncryption.S3_MANAGED,
  });

  //Created a Lambda function
  const handler = new lambda.Function(this, 'Handler', {
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('lambda'),
    handler: 'file-upload.handler',
    environment: {
      BUCKET_NAME: bucket.bucketName,
    },
  });

  //Created a DynamoDB table
  const table = new dynamodb.Table(this, 'Table', {
    partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    encryption: dynamodb.TableEncryption.AWS_MANAGED,
    replicationRegions: ['us-west-2'],
    removalPolicy: cdk.RemovalPolicy.DESTROY //i m using this to delete db once done, in a redundant application, it will not be there 
  });

  

  //Granted the Lambda function read/write permissions to the S3 bucket
  bucket.grantReadWrite(handler);

  //Granted the Lambda function read/write permissions to the DynamoDB table
  table.grantReadWriteData(handler);

  //Passed the table name to the Lambda function
  handler.addEnvironment('TABLE_NAME', table.tableName);

  //Created an API Gateway
  const api = new apigateway.RestApi(this, 'Api', {
    restApiName: 'File Upload Service',
    description: 'This service uploads files to an S3 bucket.',
    binaryMediaTypes: ['multipart/form-data'],
});


  //Created a resource and method for the API Gateway
  const upload = api.root.addResource('upload');
  const postMethod = upload.addMethod('POST', new apigateway.LambdaIntegration(handler));

  //the API Gateway URL
  new cdk.CfnOutput(this, 'ApiUrl', {
    value: api.url,
  });

  //Created a Lambda function to process the uploaded file
  const processFileHandler = new lambda.Function(this, 'ProcessFileHandler', {
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('lambda'),
    handler: 'process-file.handler',
    environment: {
        TABLE_NAME: table.tableName,
    },
    timeout: cdk.Duration.seconds(900),
    memorySize: 1024,
});

  //Granted the Lambda function read permissions to the S3 bucket
  bucket.grantRead(processFileHandler);

  processFileHandler.addToRolePolicy(new iam.PolicyStatement({
    actions: ['textract:*'],
    resources: ['*'],
}));

  processFileHandler.addToRolePolicy(new iam.PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [bucket.bucketArn + '/*'],
  }));
  
  //Granted the Lambda function read/write permissions to the DynamoDB table
  table.grantReadWriteData(processFileHandler);

  //Added an event notification to the S3 bucket
  bucket.addEventNotification(
    s3.EventType.OBJECT_CREATED,
    new s3notifications.LambdaDestination(processFileHandler)
);
  

}
}
