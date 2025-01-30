import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CredentialServiceService {

  private baseUrl = 'http://localhost:8080';
  constructor(private http:HttpClient) { }

  getAllCredentials():Observable<any>{
    return this.http.get(`${this.baseUrl}/credentials`);
  }

  StoreCredential(payload:any):Observable<any>{
    return this.http.post(`${this.baseUrl}/credential`,payload);
  }

  updateCredential(payload:any):Observable<any>{
    return this.http.put(`${this.baseUrl}/credential`,payload);
  }

  deleteCredential(id:string):Observable<any>{
    return this.http.delete(`${this.baseUrl}/credential/${id}`);
  }
}
