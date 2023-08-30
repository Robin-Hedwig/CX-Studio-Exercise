import { Template } from 'aws-cdk-lib/assertions';
import * as CxCdkExercise from '../lib/cx-cdk-exercise-stack';
import * as cdk from 'aws-cdk-lib';
 

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
  