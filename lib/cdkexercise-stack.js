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
      code: Code.fromAsset('lambda'), // Path to your Lambda code
      environment: {
        S3_BUCKET_NAME: s3Bucket.bucketName,
        DYNAMODB_TABLE: dynamoDBTable.tableName,
        API_KEY: 'b5c7aefe-8f8e-472e-856e-c2914e4b04e9',
      },
    });

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
