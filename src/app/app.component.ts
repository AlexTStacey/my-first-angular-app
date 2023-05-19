import { Component } from '@angular/core';
import { GetQuotesService } from './quotesService';


interface Quote {
  quote: String;
  author: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-first-angular-app';
  quotes: any;
  quoteUpdateSelect: any;
  updateQuote: any;
  constructor(private apiService: GetQuotesService) {};

  ngOnInit() {
    this.apiService.getQuotes().subscribe( response => {
      this.quotes = response;
    });
  }

  onClickSubmit(form: any, formData: any){
    console.log(formData);
    const quote : Quote = {quote : formData.quote, author: formData.author};
    console.log(quote);
    this.apiService.postQuote(quote).subscribe(response => { console.log(response)});
    this.apiService.getQuotes().subscribe( response => {
      this.quotes = response;
    });
    form.reset();
  }

  onSubmittedUpdateQuote(form : any, formData: any){
    const quote: Quote = {quote : formData.quoteField, author: formData.authorField};
    this.apiService.putQuote(formData.quoteSelectedId, quote).subscribe(response => { console.log(response)});
    this.apiService.getQuotes().subscribe( response => {
      this.quotes = response;
    });
    form.reset();
  }

  onSubmittedDeleteQuote(form : any, formData: any){
    const quote: Quote = {quote : formData.quoteField, author: formData.authorField};
    this.apiService.deleteQuote(formData.quoteSelectedId, quote).subscribe(response => { console.log(response)});
    this.apiService.getQuotes().subscribe( response => {
      this.quotes = response;
    });
    form.reset();
  }
    

  

}
