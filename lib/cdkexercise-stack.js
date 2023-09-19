const { Stack } = require('aws-cdk-lib');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const { Cors } = require('aws-cdk-lib/aws-apigateway');
const { Bucket } = require('aws-cdk-lib/aws-s3');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { Table, AttributeType } = require('aws-cdk-lib/aws-dynamodb');

class CdkexerciseStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create an S3 Bucket
    const s3Bucket = new Bucket(this, 'S3Bucket');

    // Create a DynamoDB Table
    const dynamoDBTable = new Table(this, 'DynamoDBTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    // Create a Lambda Function
    const lambdaFunction = new Function(this, 'LambdaFunction', {
      runtime: Runtime.PYTHON_3_8,
      handler: 'lambda.lambda_handler',
      code: Code.fromAsset('lambda'),
      environment: {
        S3_BUCKET_NAME: s3Bucket.bucketName,
        DYNAMODB_TABLE_NAME: dynamoDBTable.tableName,
      }
    });

    s3Bucket.grantReadWrite(lambdaFunction);
    dynamoDBTable.grantReadWriteData(lambdaFunction);

    // Create an S3 event trigger for the Lambda function
    lambdaFunction.addEventSource(new S3EventSource(s3Bucket, {
      events: [s3.EventType.OBJECT_CREATED], // Specify the event type
    }));

    // Create an API Gateway
    const api = new RestApi(this, 'CdkApi', {
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
    });

    // Add API Gateway method and integration to the Lambda Function
    const apiIntegration = new LambdaIntegration(lambdaFunction);
    const apiResource = api.root.addResource('upload');
    apiResource.addMethod('POST', apiIntegration);
  }
}

module.exports = { CdkexerciseStack };
