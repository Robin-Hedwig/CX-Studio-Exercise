import { Template } from 'aws-cdk-lib/assertions';
import * as CxCdkExercise from '../lib/cx-cdk-exercise-stack';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


test('S3 Bucket Created With Encryption', () => {
  const app = new cdk.App();
  const stack = new CxCdkExercise.CxCdkExerciseStack(app, 'MyTestStack');

  const assert = Template.fromStack(stack);
  assert.resourceCountIs('AWS::S3::Bucket', 1);
  assert.hasResourceProperties('AWS::S3::Bucket', {
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256',
          },
        },
      ],
    },
  });
});

test('S3 Bucket Created With Versioning', () => {
  const app = new cdk.App();
  const stack = new CxCdkExercise.CxCdkExerciseStack(app, 'MyTestStack');

  const assert = Template.fromStack(stack);
  assert.resourceCountIs('AWS::S3::Bucket', 1);
  assert.hasResourceProperties('AWS::S3::Bucket', {
    VersioningConfiguration: {
      Status: 'Enabled',
    },
  });
});

test('API Gateway Created', () => {
  const app = new cdk.App();
  const stack = new CxCdkExercise.CxCdkExerciseStack(app, 'MyTestStack');

  const assert = Template.fromStack(stack);
  assert.resourceCountIs('AWS::ApiGateway::RestApi', 1);
});

test('DynamoDB Table Created', () => {
  const app = new cdk.App();
  const stack = new CxCdkExercise.CxCdkExerciseStack(app, 'MyTestStack');

  const assert = Template.fromStack(stack);
  assert.resourceCountIs('AWS::DynamoDB::Table', 1);
  assert.hasResourceProperties('AWS::DynamoDB::Table', {
    AttributeDefinitions: [
      {
        AttributeName: 'email',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'email',
        KeyType: 'HASH',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });
});

test('Lambda Functions Created', () => {
  const app = new cdk.App();
  const stack = new CxCdkExercise.CxCdkExerciseStack(app, 'MyTestStack');

  const assert = Template.fromStack(stack);
  assert.resourceCountIs('AWS::Lambda::Function', 3);
  assert.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs14.x',
    Handler: 'file-upload.handler',
    Environment: {
      Variables: {
        BUCKET_NAME: {
          Ref: 'Bucket83908E77',
        },
        TABLE_NAME: {
          Ref: 'TableCD117FA1',
        },
      },
    },
  });
});