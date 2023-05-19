import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
  
@Injectable({
  providedIn: 'root'
})
export class GetQuotesService {
  private url = 'https://svg3dximc5.execute-api.eu-west-2.amazonaws.com/prod/quotes';
   
  constructor(private httpClient: HttpClient) { }
  
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
  
}