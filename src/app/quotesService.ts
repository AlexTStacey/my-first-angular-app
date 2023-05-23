import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as AWS from 'aws-sdk';
  
@Injectable({
  providedIn: 'root'
})
export class GetQuotesService {

  private url = this.fetchApitUrlFromStack();
    
  constructor(private httpClient: HttpClient) { };
  
  getQuotes(){
    return this.httpClient.get(this.url);
  }

  postQuote(data: any){
    return this.httpClient.post(this.url, data);
  }

  putQuote(id: any, data: any){
    return this.httpClient.put(this.url + "/" + id, data);
  }

  deleteQuote(id: any, data: any){
    return this.httpClient.delete(this.url + "/" + id, data);
  }

  fetchApitUrlFromStack(){
    const  cloudformation = new AWS.CloudFormation();
    let quotesApiUrl = "";

    cloudformation.describeStacks({StackName: 'CdkStack'}, (err, data) => {
      if (err){
        console.error("Failed to retrive stack outputs - " + err);
        quotesApiUrl = "";
      } else {
        //aws cloudformation --region eu-west-2 describe-stacks --stack-name CdkStack --query "Stacks[0].Outputs[?OutputKey=='quotesApiUrl']" --output text
        const stacksList = data?.Stacks;
        if(stacksList){
          for(let i = 0; stacksList?.length < i; i++){
            let apiUrl = stacksList[i].Outputs?.find(o => o.ExportName === 'quotesApiUrl');
            if(apiUrl && apiUrl.OutputValue){
              console.log(apiUrl.OutputKey);
              quotesApiUrl = apiUrl.OutputValue;
            }
          }
        } else {
          console.error("Failed to retrive stack outputs");
          quotesApiUrl = "";
        }
      }
    });

    return quotesApiUrl;
  }
  
}