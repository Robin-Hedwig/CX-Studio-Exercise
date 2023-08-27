import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CxExerciseStack extends cdk.Stack {
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
    

    //Granted the Lambda function read/write permissions to the S3 bucket
    bucket.grantReadWrite(handler);

    //Created an API Gateway
    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'File Upload Service',
      description: 'This service uploads files to an S3 bucket.',
    });

    //Created a resource and method for the API Gateway
    const upload = api.root.addResource('upload');
    const postMethod = upload.addMethod('POST', new apigateway.LambdaIntegration(handler));

    //the API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}
