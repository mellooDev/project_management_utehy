import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IRoleModel} from './role.service';
import {BaseService} from "./base.service";
import {AppConstants} from "../utils/app.constants";
import { TokenStorageService } from './token-storage.service';
import {environment} from "../../environments/environment";


export class getListRequest {
  searchKey?: null | string;
  pageNumber?: null | number;
}

export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export interface IUserModel {
  created_at?: string;
  email: string;
  id: string;
  username?: string;
  last_login_at?: null | string;
  name?: string;
  phone?: null |  string ;
  status?: null | string;
  password?: string;
  roles?: IRoleModel[];
  role?: string;
}

export interface IPasswordUpdateModel {
  status?: any;
  password: string;
  new_password: string;
  retype_password: string;
}

export interface IUserUpdateModel {
  userId?: null | string;

  username?: null | string;

  fullname?: null | string;

  phone?: null | string;

  email?: null | string;

  roles?: null | any;

  status?: null | string;
}

export class FormAddUser {
  kind: number //1-personal 2-company
  cardId: string //cccd-personal mst-company
  address: string
  phone: string
  website: string
}

export interface IProfileDetail {
  // kind: number;
  fullName?: string;
  address: string;
  email?: string;
  phone: string;
  tax?: string;
  cardId: string;
  website: string;
  isPersonal?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {

  private apiUrl = AppConstants.API_BASE_URL + '/api/user/';

  // private userDetailUrl = AppConstants.API_BASE_URL;

  private userDetailUrl = environment.authen;


  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {
    super();
  }

  getUsers(dataTablesParameters: any): Observable<any> {
    const url = this.apiUrl + 'users-list';
    return this.http.post<any>(url, dataTablesParameters);
  }

  getUserUpdate(id: number): Observable<any> {
    const url = this.apiUrl + id;
    return this.http.get<any>(url);
  }

  getUser(id: number): Observable<IUserModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IUserModel>(url);
  }

  getCurrentUser(): Observable<any | undefined> {
    const url = this.apiUrl + 'get-user' ;
    return this.http.get<any>(url);
  }

  getProfileUser(id: number): Observable<any> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get(`${this.userDetailUrl}/api/customer/` + id, {headers})
  }

  createUser(user: IUserUpdateModel): Observable<IUserUpdateModel> {
    const url = this.apiUrl + 'create';
    return this.http.post<IUserUpdateModel>(url, user);
  }

  updateUser(user: IUserUpdateModel): Observable<IUserUpdateModel> {
    const url = this.apiUrl + 'update';
    return this.http.post<IUserUpdateModel>(url, user);
  }

  updateProfile(profile: IProfileDetail, id: number): Observable<IProfileDetail> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post<IProfileDetail>(`${this.userDetailUrl}/customer/${id}/add-info`, profile, {headers});
  }

  deleteUser(id: number): Observable<void> {
    const url = this.apiUrl + id;
    return this.http.delete<void>(url);
  }

  changePassword(password: IPasswordUpdateModel): Observable<IPasswordUpdateModel> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.put<IPasswordUpdateModel>(`${this.userDetailUrl}/customer/password`, password, {headers})
  }

  addInfo(customerId: number, formAddUser: FormAddUser, token: string): Observable<any> {
    const url = AppConstants.API_BASE_URL + `customer/${customerId}/add-info`
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    return this.http.post<any>(url, Object.assign(formAddUser), {headers});
  }

  uploadImage(imageFile: File, imageKey: string, customerId: number, token: string): Observable<any> {
    const url = AppConstants.API_BASE_URL + `customer/${customerId}/add-image`;
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name);
    formData.append('image_key', imageKey);
    return this.http.post<any>(url, formData, {headers});
  }


  registerProvider(token: string) {
    const url = AppConstants.API_BASE_URL + `customer/register`;
    const headers = new HttpHeaders().set('Authorization', `${token}`);

    return this.http.post<any>(url, null, {headers})
  }
}
