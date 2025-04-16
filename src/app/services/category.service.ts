/*
 *  Catalog Service
 * Author: AnhNTL
 * Date: 22/11/2024 10:12
 * */
import {Injectable} from "@angular/core";
import {BaseService} from "./base.service";
import {HttpClient} from "@angular/common/http";
import {Category} from "../models/category";
import {RequestBody} from "../models/base";
import { AppConstants } from "../utils/app.constants";

@Injectable({
  providedIn: 'root'
})

export class CategoryService extends BaseService {
  private apiUrl = AppConstants.API_PRODUCT_BASE_URL+'api/categories/detail';

  constructor(private http: HttpClient) {
    super();
  }

  getListCategory() {
    const request = new RequestBody();
    return this.http.get<any>(this.apiUrl)
  }

  getCategoryById(id: number) {
    return this.http.get<any>( AppConstants.API_PRODUCT_BASE_URL+"api/category/" + id + "/products")
  }
}
