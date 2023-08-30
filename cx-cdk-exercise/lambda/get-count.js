const AWS =require('aws-sdk');
const dynamodb=new AWS.DynamoDB.DocumentClient();

exports.handler= async(event)=>{
    const params = {
        TableName: process.env.TABLE_NAME,
        Select: "COUNT"
    };
               
    try{
        const data=await dynamodb.scan(params).promise();
        return{
            statusCode:200,
            body:JSON.stringify(data.Count),
        };
    }catch(error){
        console.error(error);
        return{
            statusCode:500,
            body:JSON.stringify('Error getting item Count'),
        };
    }
};