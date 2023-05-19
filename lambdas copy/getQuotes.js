
const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const MY_TABLE = process.env.MY_TABLE

exports.handler = async (event, context) => {

    //Array of quotes
    const quotes = [
    {
        quote: "And Rohan will answer",
        author: "Theoden",
    },
    {
        quote: "Boil' Em, Mash' Em, Stick them in a stew",
        author: "Samwise",
    },
    {
        quote: "What about secound breakfast?",
        author: "Pippin",
    },
    {
        quote: "Fly you fools!",
        author: "Gandalf",
    }
    ];

    let body;
    //Get the path from our event
    let path = event.resource;
    //Get the hhtp method for the event
    let httpMethod = event.httpMethod;
    let route = httpMethod.concat(" ").concat(path)
    let data = JSON.parse(event.body);

    try {
        switch(route){
            case "GET /quotes":
                body = await listQuotes();
                break;

            case "POST /quotes":
                body = await saveQuote(data);
                break;

            default:
                throw new Error("Unsupported Route: " + route);
    }

    } catch (error) {
        console.log(error);
        statusCode = 400;
        body = error;
    } finally {
        console.log(body);
        body = JSON.stringify(body);
    }
    
    return {
        isBase64Encoded: false,
        statusCode: 200,
        body: body,
        headers: { "Content-Type": "application/json" ,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"},
    };
}

//get a list of all the quotes
async function listQuotes() {
    const params = {
        TableName: MY_TABLE
    }
    return dynamo
        .scan(params)
        .promise()
        .then((data) => {
            return data.Items;
        });
}

//method to save the quote data
async function saveQuote(data) {
    const date = new Date();
    const time = date.getTime();

    //Create a quote object and use the time to create a unique ID
    const quote = {
        id: time.toString(),
        quote: data.quote,
        author: data.author
    }

    //Table params, using the quote we created as the time we will save to the DynamoDB
    const params = {
        TableName: MY_TABLE,
        Item: quote
    }


    //adding our data to the dynamoDB
    return dynamo
        .put(params)
        .promise()
        .then(() => {
            return quote;
        })

}
