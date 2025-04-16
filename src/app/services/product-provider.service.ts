import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IRoleModel} from './role.service';
import {BaseService} from "./base.service";
import {AppConstants} from "../utils/app.constants";
import { TokenStorageService } from './token-storage.service';


@Injectable({
  providedIn: 'root'
})
export class ProductProviderService extends BaseService {

  private apiUrl = AppConstants.API_ORDER_BASE_URL+"api/";

  constructor(private http: HttpClient,    private tokenStorage: TokenStorageService,
  ) {
    super();
  }

  getSearch(keyword:string, currentPage:number, perPage:number): Observable<any> {
    const url = AppConstants.API_PRODUCT_BASE_URL+"api/products/search?name="+keyword;

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url,{headers});
  }

  createPlan(data: any): Observable<any> {
    const token = this.tokenStorage.getToken();

    const url = this.apiUrl + 'plan';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    return this.http.post<any>(url, data, {headers});
  }

  updatePlan(data: any): Observable<any> {
    const token = this.tokenStorage.getToken();

    const url = this.apiUrl + 'plan';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });

    return this.http.put<any>(url, data, {headers});
  }

  getSearchOwner(keyword:string, currentPage:number, perPage:number): Observable<any> {
    const url = AppConstants.API_PRODUCT_BASE_URL+"api/private/products?name="+keyword;

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url,{headers});
  }
}
