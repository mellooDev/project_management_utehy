import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoleModel } from './role.service';
import { BaseService } from "./base.service";
import { AppConstants } from "../utils/app.constants";
import { TokenStorageService } from './token-storage.service';


@Injectable({
  providedIn: 'root'
})
export class BuyedService extends BaseService {

  private apiUrl = AppConstants.API_ORDER_BASE_URL + "api/";

  private baseUrl = AppConstants.API_PRODUCT_BASE_URL + "api/product";

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService,
  ) {
    super();
  }
  getSearch(keyword: string, productType: string, planType: string, currentPage: number, perPage: number): Observable<any> {
    const url = this.apiUrl + "order?currentPage=" + currentPage + "&perPage=" + perPage + "&sortDesc=true" + "&filter=productName=" + keyword + ";productProviderName=" + keyword + ";productType=" + productType + ";planType=" + planType;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, { headers });
  }

  getTable(id: number): Observable<any> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    const url = `${this.baseUrl}`
    return this.http.get(`${this.baseUrl}/${id}/items`, { headers })
  }

  extendPackage(payload: any): Observable<any> {
    const url = this.apiUrl + 'order/extends';

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.post<any>(url, payload, {headers})
  }

}
