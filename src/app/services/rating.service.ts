import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from './token-storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

  private apiUrl =  environment.dataCatalog +  '/api/';
  
  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  getRating(payload: { currentPage: number, perPage: number, prodId: number, isShow?: number}) {
    const url = this.apiUrl + `product/product-reviews`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
    });
    return this.http.post<any>(url, payload, {headers})
  }

  postRating(payload: {prodId: number, rate: number, content: string}): Observable<any> {
    const url = this.apiUrl + `product/post-review`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
    });
    return this.http.post<any>(url, payload, {headers})
  }

  updateRating(payload: {prodId: number, rate: number, content: string}): Observable<any> {
    const url = this.apiUrl + `product/update-review`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
    });
    return this.http.post<any>(url, payload, {headers})
  }

  getRatingDetailByProdId(prodId: number): Observable<any> {
    const url = this.apiUrl + `product/product-reviews-info/${prodId}`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
    });
    return this.http.post<any>(url, {}, {headers})
  }

  showOrHideRating(ratingId: number, status: number) {
    const url = this.apiUrl + `product/hidden-review/${ratingId}/${status}`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
    });
    return this.http.post<any>(url, {}, {headers})
  }

  deleteRating(ratingId: number) {
    const url = this.apiUrl + `product/delete-review/${ratingId}`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': token
    });
    return this.http.delete<any>(url, {headers})
  }
}
