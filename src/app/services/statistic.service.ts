import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from './token-storage.service';

export class ProductIdsRequest {
  productIds: number[];
  startDate: string;
  endDate: string;
}

export class RequestPackageDTO {
  productId: number;
  subscriptionId: number;
  numberRequest: number;
}

export class RequestPackageStatisticDTO {
  productId: number;
  productName: string;
  subscriptionId: number;
  totalRequest: number;
}

export class ProductRequestResponseDto {
  id: number;
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  description: string;
  created_date: string;
  approved_date: string | null;
  approval_status: number;
  data_type: number;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticService extends BaseService {
  private apiUrlDashboardBilling = environment.billing + '/api/dashboard/';
  private apiUrlDashboardUser = environment.authen + '/api/statistics/';
  private apiUrlDashboardReport = environment.report + '/api/statistics/';
  private apiUrlDataCatalog = environment.dataCatalog + '/api/private/'

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {
    super();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.tokenStorage.getToken(),
    });
  }

  // thông kê gói sắp hết hạn 
  getSubscriptionsAboutToExpire(): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}about-to-expire`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }
  getAmountPerDay(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}amount-per-day?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getNumberOfUsesPerDay(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrlDashboardReport}number-of-uses?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getNumberOfRequestsPerDay(
    productIds: number[],
    startDate: string,
    endDate: string
  ): Observable<any> {
    const url = `${this.apiUrlDashboardReport}number-of-requests?productIds=${productIds}&startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // Thống kê lượt request mua và đã dùng của gói
  getRequestPackage(): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}request-package`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getRequestStatisticBySubscriptionIds(
    subscriptionIds: number[]
  ): Observable<any> {
    const url = `${this.apiUrlDashboardReport}request-by-subscriptions`;
    return this.http.post<any>(url, subscriptionIds, {
      headers: this.getHeaders(),
    });
  }
  //end

  getRevenuePerDay(
    providerId: number,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}revenue-per-day?providerId=${providerId}&startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getTotalDataPackageByDate(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}total-data-package?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getSubscriptionIds(): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}subIds`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getTotalRevenueByProductIds(
    productIdsRequest: ProductIdsRequest
  ): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}total-revenue-by-products`;
    return this.http.post<any>(url, productIdsRequest, {
      headers: this.getHeaders(),
    });
  }

  getTotalBuyByProductIds(
    productIdsRequest: ProductIdsRequest
  ): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}total-buy-by-products`;
    return this.http.post<any>(url, productIdsRequest, {
      headers: this.getHeaders(),
    });
  }

  getRevenueTotalByDate(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}revenue-total?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getTop5Providers(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}top-providers?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getTop5ProductNames(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}top-product-names?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getTop5CategoryNames(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}top-category-names?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getListUserNamesByUserIds(userIds: number[]): Observable<any> {
    const url = `${this.apiUrlDashboardUser}userNames-by-ids?userIds=${userIds}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getRevenueCategoryStatisticsByDate(
    startDate: string,
    endDate: string
  ): Observable<any> {
    const url = `${this.apiUrlDashboardBilling}revenue-category-per-day?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getUserTotal(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrlDashboardUser}user-total?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getUserStatistics(startDate: string, endDate: string): Observable<any> {
    const url = `${this.apiUrlDashboardUser}users?startDate=${startDate}&endDate=${endDate}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getRequestProduct(currentPage: number, perPage: number): Observable<any> {
    const url = `${this.apiUrlDataCatalog}product/request?currentPage=${currentPage}&perPage=${perPage}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }
}
