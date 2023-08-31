const AWS=require('aws-sdk');
const dynamodb= new AWS.DynamoDB.DocumentClient();


exports.handler=async(event)=>{
    const params = {
        TableName: process.env.TABLE_NAME,
    };
    try{
        const data= await dynamodb.scan(params).promise();
        return{
            statusCode:200,
            body:JSON.stringify(data.Items),
        }

    }catch(error){
        console.error(error);
        return{
            statusCode:500,
            body:JSON.stringify('Error getting all the applicant details'),
        };
    }

}