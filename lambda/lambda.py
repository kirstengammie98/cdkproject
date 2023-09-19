import os
import json
import boto3

s3_bucket_name = os.environ['S3_BUCKET_NAME']
table_name = os.environ['DYNAMODB_TABLE_NAME']

s3_client = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    try:
        # Extract information from the S3 event
        bucket = event['Records'][0]['s3']['bucket']['name']
        object_key = event['Records'][0]['s3']['object']['key']
        
        # Read the content of the file from S3
        response = s3_client.get_object(Bucket=bucket, Key=object_key)
        file_content = response['Body'].read().decode('utf-8')
        
        # Parse the file content (assuming it's JSON) and insert it into DynamoDB
        data = json.loads(file_content)
        
        table = dynamodb.Table(table_name)

        # Insert data into DynamoDB
        table.put_item(Item=data)

        return {
            'statusCode': 200,
            'body': json.dumps('Data inserted into DynamoDB successfully')
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }