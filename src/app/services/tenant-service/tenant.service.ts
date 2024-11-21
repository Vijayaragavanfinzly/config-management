import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tenant } from '../../model/tenant.interface';
import { Environment } from '../../model/environment.interface';
import { Property } from '../../model/property.interface';

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  private baseUrl = 'http://localhost:8080'

  constructor(private http:HttpClient) { }

  getAllTenants():Observable<Tenant[]>{
    return this.http.get<Tenant[]>(`${this.baseUrl}/tenants`);
  }

  getTenantEnvironments(tenant:string):Observable<Environment[]>{
    return this.http.get<Environment[]>(`${this.baseUrl}/tenant/${tenant}`);
  }
  getTenantProperties(tenant:string,environment:string):Observable<Property[]>{
    return this.http.get<Property[]>(`${this.baseUrl}/tenant-env-properties/${tenant}/${environment}`);
  }
}
