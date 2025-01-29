import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParamStoreServiceService {

  private baseUrl = 'http://localhost:8080/aws';

  constructor(private http:HttpClient) { }

  getAllTenants():Observable<any>{
    return this.http.get(`${this.baseUrl}/parameter-store/tenants`);
  }

  getEnvironmentsForTenant(tenant:string):Observable<any>{
    return this.http.get(`${this.baseUrl}/parameter-store/env/${tenant}`);
  }

  getPropertiesForTenantAndEnvironment(tenant:string,environment:string):Observable<any>{
    return this.http.get(`${this.baseUrl}/parameter-store/${tenant}/${environment}`);
  }
}
