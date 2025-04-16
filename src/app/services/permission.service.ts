import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {BaseService} from "./base.service";

export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export interface IPermissionModel {
  id?: string;
  name?: string | null;
  code?: string | null;
  desc?: string | null;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends BaseService {

  private apiUrl = 'http://localhost:8081/api/src/';

  constructor(private http: HttpClient) {
    super();
  }

  getPermissions(dataTablesParameters: any): Observable<any> {
    const url = this.apiUrl + 'src-list';
    return this.http.post<any>(url, dataTablesParameters);
  }

  getPermission(id: number): Observable<any> {
    const url = this.apiUrl + id;
    return this.http.get<any>(url);
  }

  createPermission(user: IPermissionModel): Observable<IPermissionModel> {
    return this.http.post<IPermissionModel>(this.apiUrl, user);
  }

}
