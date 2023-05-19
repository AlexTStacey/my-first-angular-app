import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
  
@Injectable({
  providedIn: 'root'
})
export class GetCoursesService {
  private url = 'http://localhost:3000/api/courses';
   
  constructor(private httpClient: HttpClient) { }
  
  getCourses(){
    return this.httpClient.get(this.url);
  }
  
}