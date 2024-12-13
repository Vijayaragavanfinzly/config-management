import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Property } from '../../model/property.interface';

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  private baseUrl = 'http://localhost:8080'

  constructor(private http:HttpClient) { }

  getAllTenants():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/tenants`);
  }

  getTenantEnvironments(tenant:string):Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/tenants/${tenant}`);
  }

  addNewTenantWithEnvironment(payload:any):Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/tenant-env`,payload);
  }
  addNewTenant(payload:any):Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/tenant`,payload);

  }
}
