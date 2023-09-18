const { Stack, Duration } = require('aws-cdk-lib/core');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');
const { Bucket } = require('aws-cdk-lib/aws-s3');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { Table, AttributeType } = require('aws-cdk-lib/aws-dynamodb');
const { Role, ServicePrincipal, PolicyStatement } = require('aws-cdk-lib/aws-iam');

class CdkProjectStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create an IAM role for your Lambda function
    const lambdaRole = new Role(this, 'LambdaExecutionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    // Define permissions for the Lambda role (example: S3 and DynamoDB permissions)
    lambdaRole.addToPolicy(new PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: ['arn:aws:s3:::S3Bucket/*'],
    }));

    // Create an S3 Bucket
    const s3Bucket = new Bucket(this, 'S3Bucket');

    // Create a Lambda Function
    const lambdaFunction = new Function(this, 'LambdaFunction', {
      runtime: Runtime.PYTHON_3_8,
      handler: 'lambda.handler',
      code: Code.fromAsset('lambda'), // Path to your Lambda code
      environment: {
        S3_BUCKET_NAME: s3Bucket.bucketName,
      },
      role: lambdaRole, // Attach the Lambda role to the Lambda function
    });

    // Create a DynamoDB Table
    const dynamoDBTable = new Table(this, 'DynamoDBTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    // Create an API Gateway
    const apiGatewayRole = new Role(this, 'APIGatewayExecutionRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    });

    // Define permissions for API Gateway (example: invoke Lambda)
    apiGatewayRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['lambda:InvokeFunction'],
      resources: [lambdaFunction.functionArn], // Replace with your Lambda function ARN
    }));

    const api = new RestApi(this, 'CdkApi', {
      deployOptions: {
        stageName: 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      role: apiGatewayRole, // Attach the role to the API Gateway
    });

    // Add API Gateway method and integration to the Lambda Function
    const apiIntegration = new LambdaIntegration(lambdaFunction);
    const apiResource = api.root.addResource('upload');
    apiResource.addMethod('POST', apiIntegration);

    // Grant permissions for Lambda to interact with S3 and DynamoDB
    s3Bucket.grantReadWrite(lambdaFunction);
    dynamoDBTable.grantReadWriteData(lambdaFunction);
  }
}

module.exports = { CdkProjectStack };
