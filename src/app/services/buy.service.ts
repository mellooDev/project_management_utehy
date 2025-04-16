import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IRoleModel} from './role.service';
import {BaseService} from "./base.service";
import {AppConstants} from "../utils/app.constants";
import { TokenStorageService } from './token-storage.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BuyService extends BaseService {

  private apiUrl = environment.billing +"/api/";// AppConstants.API_BASE_URL + '/api/user/';
  private apiPaymentUrl = environment.payment;
  private apiOrderUrl = environment.billing + '/api/'

  constructor(private http: HttpClient,    private tokenStorage: TokenStorageService,
  ) {
    super();
  }

  getPlanByProductId(id: number): Observable<any> {
    const url = this.apiUrl + "plan/product/"+ id;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get<any>(url,{headers});
  }

  getDetailOrder(id: number): Observable<any> {
    const url = this.apiOrderUrl + `order/${id}`
    const token = this.tokenStorage.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers})
  }


  createOrder(order: any): Observable<any> {
    const token = this.tokenStorage.getToken();

    const url = this.apiUrl + 'order';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.post<any>(url, order, {headers});
  }
  confirmOrder(orderId: number): Observable<any> {
    const token = this.tokenStorage.getToken();

    const url = this.apiUrl + 'order/' + orderId + '/confirm-purchase';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token,
      'Cookie': 'JSESSIONID=26F6F72925215943305706532D95B4F3'
    });

    return this.http.post<any>(url,null, {headers});
  }

  getPaymentStatus(orderId: number, paymentId:number): Observable<any> {
    const token = this.tokenStorage.getToken();

    const url = this.apiPaymentUrl + "/payment/status/"+paymentId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers});
  }

}
