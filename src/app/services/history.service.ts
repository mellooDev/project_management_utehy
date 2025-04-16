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
export class HistoryService extends BaseService {

  private apiUrl = AppConstants.API_ORDER_BASE_URL + "api/";

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService,
  ) {
    super();
  }

  getSearch(keyword: string, currentPage: number, perPage: number): Observable<any> {
    // const url = this.apiPaymentUrl + "api/order?currentPage="+currentPage+"&perPage="+perPage+"&filter="+keyword+"&sortDesc=true";
    const url = this.apiUrl + "order?currentPage=" + currentPage + "&perPage=" + perPage + "&sortDesc=true" + "&filter=productName=" + keyword;

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, { headers });
  }

  getDetailOrder(id: number) {
    return this.http.get<any>(this.apiUrl + "order/" + id)
  }

}
