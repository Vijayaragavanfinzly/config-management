import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompareService {

  private baseUrl = 'http://localhost:8080';
  constructor(private http:HttpClient) { }

  compareTenants(selectedTenant1:string, selectedEnv1:string,selectedTenant2:string,selectedEnv2:string):Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/properties/compare/${selectedTenant1}/${selectedEnv1}/${selectedTenant2}/${selectedEnv2}`);
  }

  // editProperty(tenant:string,environment:string,propertyKey:string,propertyValue:string):Observable<any>{
  //   return this.http.put(`${this.baseUrl}/properties/inter-change/${tenant}/${environment}/${propertyKey}/${propertyValue}`,null);
  // }

  editProperty(payload:any):Observable<any>{
    return this.http.put(`${this.baseUrl}/properties/inter-change`,payload);
  }

  compareEnvironments(selectedEnv1:string,selectedEnv2:string):Observable<any>{
    return this.http.get(`${this.baseUrl}/properties/compare-env/${selectedEnv1}/${selectedEnv2}`)
  }
}
