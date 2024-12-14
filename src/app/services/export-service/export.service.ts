import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private http: HttpClient) { }
  private baseUrl = 'http://localhost:8080';



  exportProperties(tenant:string,environment:string): Observable<any> {
    return this.http.get(`${this.baseUrl}/exportProperties/${tenant}/${environment}`, { responseType: 'blob' });
  }

  exportSelectedProperties(tenant: string, environment: string, selectedIds: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/exportSelectedProperties/${tenant}/${environment}`, selectedIds , { responseType: 'blob' });
  }


}
