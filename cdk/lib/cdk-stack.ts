import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { BlockPublicAccess, Bucket, BucketAccessControl, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import { join } from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    //create dynamoDB table
    const table = new Table(this, 'quotes-tbl', {
      partitionKey: {name: 'id', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    
    const websiteBucket = new Bucket(this, 'AngularAppBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

   
    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset('../dist/my-first-angular-app')], 
      destinationBucket: websiteBucket
    });

    
    new cdk.CfnOutput(this, 'URL', {
      description: 'The url of the website',
      value: websiteBucket.bucketWebsiteUrl
    });

    //Create and API to get some static data (see quote example and populate my webpage)
    const handlerFunction = new Function(this , 'quotesHandler', {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset(join(__dirname,'../lambdas')),
      handler: 'getQuotes.handler',
      environment: {
        MY_TABLE: table.tableName //passing the table name and an env variable
      }
    });

    //grant permissions for the handler function
    table.grantReadWriteData(handlerFunction);

    websiteBucket.grantReadWrite(handlerFunction);

     //Need to add a policy to our handler function
     handlerFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:*'],
        resources: ['*'] //'s3:PutObject, 's3:GetObject'
      })
    );

     //Creating the API - using api gateway
     const api = new RestApi(this, 'quotes-api', {
      description: "Quotes ApI",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS
      }
    });

    new TableViewer(this, 'tableviewer', {
      title: "quote Table",
      table: table
    });

    const handlerIntergration = new LambdaIntegration(handlerFunction);

    //creating a main path for our api, we acccess the data cia paths in the API so need to define one here
    const mainPath = api.root.addResource("quotes");

    mainPath.addMethod("GET",handlerIntergration); //get all

    //other methods
    mainPath.addMethod("POST", handlerIntergration); //post a quote

  }
}