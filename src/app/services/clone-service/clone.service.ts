import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloneService {

  private baseUrl = 'http://localhost:8080';
  constructor(private http:HttpClient) { }

  cloneTenants(selectedTenant1:string, selectedEnv1:string,selectedTenant2:string,selectedEnv2:string):Observable<any>{
    return this.http.put<any>(`${this.baseUrl}/clone/${selectedTenant1}/${selectedEnv1}/${selectedTenant2}/${selectedEnv2}`,null);
  }
}
