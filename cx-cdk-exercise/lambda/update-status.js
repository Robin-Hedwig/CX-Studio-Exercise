const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const { email, status } = JSON.parse(event.body);

    const params = {
        TableName: process.env.TABLE_NAME,
        Key: { email },
        UpdateExpression: 'set #status=:status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status },
    };

    try {
        await dynamodb.update(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify('updated the status for ' + email + ' as ' + status),
        };

    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error updating the status'),
        };
    }
};