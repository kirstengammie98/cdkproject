import json
import boto3
import os
import uuid
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table_name = os.environ['DYNAMODB_TABLE_NAME']
s3_bucket_name = os.environ['S3_BUCKET_NAME']

def lambda_handler(event, context):
    try:
        # Generate a unique ID for the uploaded file
        file_id = str(uuid.uuid4())
        
        # Retrieve the uploaded file from the request body
        uploaded_file = event['body']  # Assuming the file content is in the request body
        
        # Generate a unique object key for the file
        s3_object_key = f'{file_id}.json'
        
        # Upload the file content to S3
        s3.put_object(Bucket=s3_bucket_name, Key=s3_object_key, Body=uploaded_file)
        
        # Insert data into DynamoDB, including the file ID and S3 object key
        data = {
            'id': file_id,
            's3_object_key': s3_object_key,
            'timestamp': str(event['requestContext']['requestTimeEpoch'])
        }
        
        table = dynamodb.Table(table_name)
        
        # Insert data into DynamoDB
        table.put_item(Item=data)
        
        return {
            'statusCode': 200,
            'body': json.dumps('File uploaded and data inserted into DynamoDB successfully')
        }
    
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }
