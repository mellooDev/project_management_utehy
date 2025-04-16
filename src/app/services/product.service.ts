import {Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {AppConstants} from "../utils/app.constants";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {RequestBody} from "../models/base";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { TokenStorageService } from "./token-storage.service";

@Injectable({
  providedIn: 'root'
})

export class ProductService extends BaseService{
  private apiUrl = environment.dataCatalog+'/';

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {
    super();
  }

  getListProducts(keyword: string) {
    return this.http.get<any>(this.apiUrl+'api/products/search?name='+keyword)
  }

  getDetailProduct(id: number) {
    return this.http.get<any>(this.apiUrl+"api/product/" + id)
  }

  getListProductByCategory(categoryId: number) {
    return this.http.get<any>(this.apiUrl+"api/category/" + categoryId + "/products")
  }

  search(keyword: string){
    return this.http.get<any>(this.apiUrl+'api/products/search?name=' + keyword)
  }
  getDetailProductItems(id: number) {
    return this.http.get<any>(this.apiUrl+"api/product/" + id+"/items")
  }
  getCategories() {
    return this.http.get<any>(this.apiUrl+"api/categories/detail")
  }

  getDeliveryMethods() {
    return this.http.get<any>(this.apiUrl+"api/deliveries")
  }

  checkSubscriptionsUserProduct(userId: number,productId: number) {
    return this.http.get<any>(environment.billing+"/internal/subscriptions?userId="+userId+"&productId="+productId)
  }

  getImageInfo(id: number) {
    return this.http.get<any>(this.apiUrl+"api/product/image/" + id)
  }

  getListVersion(id: number): Observable<any> {
    const url = this.apiUrl + `api/private/product/list-version/${id}`;

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.get(url, {headers});
  }

  createNewVersion(payload: any): Observable<any> {
    const url = this.apiUrl + `api/private/product/new-version`;

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.post(url, payload, {headers});
  }

  setBusinessVersion(versionId: number) {
    const url = this.apiUrl + `api/private/product/business-version/${versionId}`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.put(url, {headers});
  }
}
