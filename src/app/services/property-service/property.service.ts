import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Property } from '../../model/property.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private baseUrl = 'http://localhost:8080'

  constructor(private http:HttpClient) { }

  updateProperty(property: Property): Observable<string> {
    return this.http.put(`${this.baseUrl}/config-server`, property, { responseType: 'text' });
  }

  deleteProperty(id:number):Observable<string>{
    return this.http.delete(`${this.baseUrl}/config-server/${id}`,{responseType:'text'});
  }
}