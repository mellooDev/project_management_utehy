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
export class PaymentListService extends BaseService {

  // private apiUrl = AppConstants.API_ORDER_BASE_URL+"api/";

  private baseUrl = "https://6752b14af3754fcea7b93eea.mockapi.io/api/list-data";

  constructor(private http: HttpClient,    private tokenStorage: TokenStorageService,
  ) {
    super();
  }


  getAll(): Observable<any> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(this.baseUrl,{headers});
  }

}
