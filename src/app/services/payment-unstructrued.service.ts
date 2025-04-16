import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentUnstructruedService {

  private baseUrl = "http://localhost:3000/package";

  constructor(private http: HttpClient) { }

  getAll(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getDetail(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
