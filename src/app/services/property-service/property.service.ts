import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Property } from '../../model/property.interface';
import { Observable } from 'rxjs';
import { AddProperty } from '../../model/add.property.interface';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private baseUrl = 'http://localhost:8080/api'

  constructor(private http:HttpClient) { }

  getTenantProperties(tenant:string,environment:string):Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/${tenant}/${environment}`);
  }

  addProperty(property:AddProperty):Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/tenant-env-configuration`, property);  
  }

  updateProperty(property: any): Observable<any> {
    return this.http.put(`${this.baseUrl}`, property);
  }

  deleteProperty(id:string):Observable<any>{
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
