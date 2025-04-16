import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {IPermissionModel} from './permission.service';
import {IUserModel} from './user.service';
import {environment} from "../../environments/environment";
import {BaseService} from "./base.service";
import {AppConstants} from "../utils/app.constants";

export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export interface IRoleModel {
  id: string;
  code?: null | string;
  name?: null | string;
  desc?: null | string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  permissions?: IPermissionModel[];
  users?: IUserModel[];
}

export interface IRoleUpdateModel {
  id?: null | string;

  code?: null | string;

  name?: null | string;

  desc?: null | string;

  status?: null | string;

  srcList?: ISrcActionModel[];

}

export interface ISrcActionModel {
  srcCode?: null | string;
  lstAction?: any[];
}


@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService {

  private apiRoleUrl = AppConstants.API_BASE_URL + '/api/role/';
  private apiSrcUrl = AppConstants.API_BASE_URL + '/api/src/';

  constructor(private http: HttpClient) {
    super();
  }


  getRoles(dataTablesParameters?: any): Observable<any> {
    const url = this.apiRoleUrl + 'roles-list';
    return this.http.post<any>(url, dataTablesParameters);
  }

  getSrcs(dataTablesParameters?: any): Observable<any> {
    const url = this.apiSrcUrl + 'src-list';
    return this.http.post<any>(url, dataTablesParameters);
  }

  getRole(id: number): Observable<IRoleModel> {
    const url = this.apiRoleUrl + id;
    return this.http.get<IRoleModel>(url);
  }

  createRole(role: IRoleUpdateModel): Observable<IRoleUpdateModel> {
    const url = this.apiRoleUrl + 'create'
    return this.http.post<IRoleUpdateModel>(url, role);
  }

  updateRole(role: IRoleUpdateModel): Observable<IRoleUpdateModel> {
    const url = this.apiRoleUrl + 'update'
    return this.http.post<IRoleUpdateModel>(url, role);
  }
}
