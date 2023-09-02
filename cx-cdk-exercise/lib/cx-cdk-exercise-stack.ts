import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';


export class CxCdkExerciseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //vpc to make the lambda functions highly available across multiple az'z
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 3,
      cidr: '10.0.0.0/16',
    });

    //S3 bucket to store resume of applicants-> server-side encryption enabled and versioning enabled
    const bucket = new s3.Bucket(this, 'Bucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    //lambda function to upload the resume to the S3
    const fileUploadHandler = new lambda.Function(this, 'fileUploadHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'file-upload.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      vpc: vpc,
    });

    //Created a DynamoDB table
    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      replicationRegions: ['us-west-2', 'us-east-2'],
      removalPolicy: cdk.RemovalPolicy.DESTROY //i m using this to delete db once done, in a redundant application, it will not be there 
    });



    //Granted the Lambda function read/write permissions to the S3 bucket
    bucket.grantReadWrite(fileUploadHandler);

    //Granted the Lambda function read/write permissions to the DynamoDB table
    table.grantReadWriteData(fileUploadHandler);

    //Passed the table name to the Lambda function
    fileUploadHandler.addEnvironment('TABLE_NAME', table.tableName);

    //Created an API Gateway
    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'File Upload Service',
      description: 'This service uploads files to an S3 bucket.',
      binaryMediaTypes: ['multipart/form-data'],
    });


    //Created a resource and method for the API Gateway to upload resume and other user data
    const upload = api.root.addResource('upload');
    const postMethod = upload.addMethod('POST', new apigateway.LambdaIntegration(fileUploadHandler));

    //this Lambda function is to process the uploaded resume
    const processFileHandler = new lambda.Function(this, 'ProcessFileHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'process-file.handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
      vpc: vpc,
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

    //an event notification to the S3 bucket to trigger next lambda once resume is uploaded
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(processFileHandler)
    );

    //a lambda function to get number of applicants for the job
    const getCountHandler = new lambda.Function(this, 'GetCountHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'get-count.handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
      vpc: vpc,
    });

    table.grantReadData(getCountHandler);

    //a resource to get the number of applicants applied for the job
    const getCount = api.root.addResource('get-count');
    const getCountMethod = getCount.addMethod('GET', new apigateway.LambdaIntegration(getCountHandler));

    //this lambda is to return details of applicant, this lambda is for admin page to see and validate candidates
    const getAllApplicantsHandler = new lambda.Function(this, 'getAllApplicantsHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'get-all-applicants.handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
      vpc: vpc,
    });

    table.grantReadData(getAllApplicantsHandler);

    //this resourse is to get details of all the applicants for the job
    const getAllApplicants = api.root.addResource('get-all-applicants');
    const getAllMethod = getAllApplicants.addMethod('GET', new apigateway.LambdaIntegration(getAllApplicantsHandler));

    //resourse to update the status of the applicant( Shortlisted, Withdrawn or any)
    const updateStatusHandler = new lambda.Function(this, 'updateStatusHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'update-status.handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
      vpc: vpc,
    });

    //granted write permission to update the table
    table.grantReadWriteData(updateStatusHandler);

    //creating a resourse to call the lambda from endpoint
    const updateStatus = api.root.addResource('update-status');
    const updateStatusMethod = updateStatus.addMethod('POST', new apigateway.LambdaIntegration(updateStatusHandler));

    //resourse to find resume match percentage when admin sends keywords to match with resume
    const matchPercentageHandler =new lambda.Function(this,'matchPercentageHandler',{
      runtime:lambda.Runtime.NODEJS_14_X,
      code:lambda.Code.fromAsset('lambda'),
      handler:'match-percentage.handler',
      environment:{
        TABLE_NAME:table.tableName,
      },
      vpc:vpc,
    });

    //granting write permissiton to update match percentage to the table
    table.grantReadWriteData(matchPercentageHandler);

    //created an api gateway resourse to access the lambda
    const matchPercent=api.root.addResource('match-percentage');
    const matchPercentMethod=matchPercent.addMethod('POST', new apigateway.LambdaIntegration(matchPercentageHandler));

  }
}
