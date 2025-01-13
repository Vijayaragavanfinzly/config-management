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

  editProperty(payload:any):Observable<any>{
    return this.http.put(`${this.baseUrl}/properties/inter-change`,payload);
  }

  compareEnvironments(selectedEnv1:string,selectedEnv2:string):Observable<any>{
    return this.http.get(`${this.baseUrl}/properties/compare-env/${selectedEnv1}/${selectedEnv2}`)
  }

  compareLiveEnvironments(selectedEnv1:string,selectedEnv2:string):Observable<any>{
    return this.http.get(`${this.baseUrl}/compare-live-config-server/${selectedEnv1}/${selectedEnv2}`)
  }


  liveComparison(env1:string,env2:string):Observable<any>{
    return this.http.get(`${this.baseUrl}/config-server/${env1}/${env2}`);
  }

  sync():Observable<any>{
    return this.http.post(`${this.baseUrl}/save`, {}, { responseType: 'text' as 'json' });
  }

  getAllEnvironments():Observable<any>{
    return this.http.get(`${this.baseUrl}/env`);
  }

  editInCompare(data:any):Observable<any>{
    return this.http.put(`${this.baseUrl}/edit`,data);
  }
}
