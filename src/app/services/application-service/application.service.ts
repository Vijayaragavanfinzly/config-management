import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private baseUrl = 'http://localhost:8080/api';
  constructor(private http:HttpClient) { }

  getAllApplications():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/application`);
  }
}
