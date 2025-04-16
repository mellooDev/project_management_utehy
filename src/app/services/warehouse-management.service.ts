import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseManagementService {

  private baseUrl = environment.dataManagement + 'api'

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  getAllPkgWarehouse(): Observable<any> {
    return this.http.get(`${this.baseUrl}/packageWH/list`)
  }

  getAllWarehouse(): Observable<any> {
    const url = `${this.baseUrl}/warehouse/get-all-by-current-customer`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers})
  }

  getPkgWarehouseById(id: any): Observable<any> {
    const url = `${this.baseUrl}/packageWH/${id}`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers})
  }

  createWarehouse(payload: any): Observable<any> {

    const url = `${this.baseUrl}/warehouse/create`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post<any>(url, payload, {headers})
  }

  getWarehouseOrderDetail(id: number): Observable<any> {
    const url = `${this.baseUrl}/warehouse/${id}`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers})
  }

  suspendWarehouse(id: number) {
    const url = `${this.baseUrl}/warehouse/suspend/${id}`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers})
  }

  unSuspendWarehouse(id: number) {
    const url = `${this.baseUrl}/warehouse/unsuspend/${id}`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers})
  }

  getTask(payload: any): Observable<any> {
    const url = `${this.baseUrl}/task`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post<any>(url, payload, {headers})
  }

  getDatabaseByUser(): Observable<any> {
    const url = `${this.baseUrl}/database/list`
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.get<any>(url, {headers});
  }
}
