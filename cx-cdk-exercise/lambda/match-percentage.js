const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const keywords = body.keywords.split(',');
    const totalKeywords = keywords.length;

    const params = {
        TableName: process.env.TABLE_NAME,
    };

    try {
        const data = await dynamodb.scan(params).promise();
        const items = data.Items;

        for (const item of items) {
            let match = 0;
            for (const keyword of keywords) {
                if (item.resume.includes(keyword)) {
                    match++;
                }
            }
            const matchPercentage = (match * 100) / totalKeywords;
            const updateParams = {
                TableName: process.env.TABLE_NAME,
                Key: { email: item.email },
                UpdateExpression: 'set #matchPercentage = :matchPercentage',
                ExpressionAttributeNames: { '#matchPercentage': 'matchPercentage' },
                ExpressionAttributeValues: { ':matchPercentage': `${matchPercentage}%` },
            };
            await dynamodb.update(updateParams).promise();
        }
        return {
            statusCode: 200,
            body: JSON.stringify('match percentages updated'),
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error updating the match percentage'),
        };
    }
}
