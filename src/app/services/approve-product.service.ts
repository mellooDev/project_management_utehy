import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '../utils/app.constants';
import { Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { url } from 'inspector';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApproveProductService {

  private apiUrl =  environment.dataCatalog +  '/api/';
  private apiPlanUrl = AppConstants.API_ORDER_BASE_URL + 'api/';
  private storedRequestId: number;

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {
  }

  getProdRequest(currentPage: number, perPage: number, sortDesc: boolean, filter?: string): Observable<any> {
    const url = this.apiUrl + 'private/product/request'
    let params = new HttpParams()
      .set('currentPage', currentPage.toString())
      .set('perPage', perPage.toString())
      .set('sortDesc', sortDesc.toString())

    if (filter?.trim()) {
      params = params.set('filter', filter)
    }

    const token = this.tokenStorage.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {params, headers})
  }

  getPlanProduct(productId: number): Observable<any> {
    const url = this.apiPlanUrl + `plan/product/${productId}`
    return this.http.get<any>(url);
  }

  setRequestId(id: number) {
    this.storedRequestId = id;
  }

  getRequestId(): number {
    return this.storedRequestId;
  }

  getProductDetail(requestProdId: number): Observable<any> {
    const url = this.apiUrl + `private/product/${requestProdId}`

    const token = this.tokenStorage.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.get(url, {headers})
  }

  rejectProduct(requestId: number, payload: { approval: string, description?: string }): Observable<any> {
    const url = this.apiUrl + `private/product/${requestId}/approval`;
    // const params = {
    //   approval: approval,
    //   description: description
    // };
    const token = this.tokenStorage.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.post(url, payload, {headers})
  }
}
