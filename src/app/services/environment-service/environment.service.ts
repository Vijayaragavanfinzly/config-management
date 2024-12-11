import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../model/environment.interface';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {

  private baseUrl = 'http://localhost:8080'
  constructor(private http:HttpClient) { }

  getAllEnvironments():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/environments`);
  }

}
