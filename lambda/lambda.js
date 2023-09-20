const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME;

exports.lambdaHandler = async (event, context) => {
    try {
        // Extract information from the S3 event
        const record = event.Records[0];
        const bucket = record.s3.bucket.name;
        const objectKey = record.s3.object.key;

        // Read the content of the file from S3
        const response = await s3.getObject({ Bucket: bucket, Key: objectKey }).promise();
        const fileContent = response.Body.toString('utf-8');

        // Parse the file content (assuming it's JSON) and insert it into DynamoDB
        const data = JSON.parse(fileContent);

        // Create parameters for inserting data into DynamoDB
        const params = {
            TableName: TABLE_NAME,
            Item: data,
        };

        // Insert data into DynamoDB
        await dynamodb.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify('Data inserted into DynamoDB successfully'),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(`Error: ${error.message || 'Unknown error'}`),
        };
    }
};
