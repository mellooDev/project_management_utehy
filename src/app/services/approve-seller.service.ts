import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IRoleModel} from './role.service';
import {BaseService} from "./base.service";
import {AppConstants} from "../utils/app.constants";
import { TokenStorageService } from './token-storage.service';
import {environment} from "../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class ApproveSellerService extends BaseService {

  private apiUrl = AppConstants.API_ORDER_BASE_URL+"api/";
  private baseUrl = "https://67594e3d60576a194d143d7e.mockapi.io/api/phe-duyet/1";

  constructor(private http: HttpClient,    private tokenStorage: TokenStorageService,
  ) {
    super();
  }

  getDetail() {
    return this.http.get(`${this.baseUrl}`);
  }

  getSearch(): Observable<any> {
    const url = environment.authen + '/admin/customer/registers'
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url,{headers});
  }
  getImage(id: number): Observable<any> {
    const token = this.tokenStorage.getToken();

    const url = environment.authen + "/admin/customer/"+id+"/images";
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.get<any>(url, {headers});
  }

  doApprove(id: number): Observable<any> {
    const token = this.tokenStorage.getToken();

    const url = environment.authen + "/admin/customer/"+id+"/approve";
    const headers = new HttpHeaders({
      'Authorization': token
    });

  // Specify observe as 'response' and responseType as 'text'
  return this.http.post(url, {}, {
    headers,
    observe: 'response',   // Observe the full response (including status, headers)
    responseType: 'text'    // Ensure the response is treated as plain text
  });  }

  doReject(id: number, note:string): Observable<any> {
    const token = this.tokenStorage.getToken();

    const url = environment.authen + "/admin/customer/"+id+"/reject";
    const headers = new HttpHeaders({
      'Authorization': token
    });
     // Create a FormData instance
     const formData = new FormData();
     formData.append('note', note); // Add the file to the form data
  // Specify observe and responseType
  // Specify observe as 'response' and responseType as 'text'
  return this.http.post(url, formData, {
    headers,
    observe: 'response',   // Observe the full response (including status, headers)
    responseType: 'text'    // Ensure the response is treated as plain text
  });
  }


}
