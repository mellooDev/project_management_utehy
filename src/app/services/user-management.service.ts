import {Injectable} from '@angular/core';
import {AppConstants} from "../utils/app.constants";
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {TokenStorageService} from "./token-storage.service";


export interface UserDTO {
  uuid?: string;
  customerId?: string;
  email?: string | null;
  phoneNumber?: string | null;
  full_name?: string | null;
  status?: number | null;
  group_id?: number | null;
  status_active: any;
}

export interface LockUserRequest {
  email: string;
  status: number;
  reason?: string;
}

export interface UserContractDTO {
  full_name: string;
  email: string;
  phone: string;
  customer_id: number;
  content: string;
  contract_number: string;
  start_date: Date; // JavaScript Date type for temporal fields
  end_date: Date;
  createdAt: Date;
  updatedAt: Date;
  file_key: number;
  payment_approve_status: PaymentApproveStatus; // Define this enum based on `Constants.PaymentApproveStatus`
}

// Example PaymentApproveStatus enum (based on Java constants)
export enum PaymentApproveStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private apiUrl = AppConstants.API_AUTHEN_URL;

  private apiUploadPostpaidUrl = AppConstants.API_DATABASE_BASE_URL;

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {
  }

  getUsers(filter: string, currentPage: number, perPage: number): Observable<any> {
    if (currentPage >= 1) {
      currentPage = currentPage - 1;
    }
    const url = this.apiUrl + `/admin/search?filter=${filter}&currentPage=${currentPage}&perPage=${perPage}`;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers});
  }


  searchPostpaid(filter: string, currentPage: number, perPage: number): Observable<any> {
    if (currentPage >= 1) {
      currentPage = currentPage - 1;
    }
    const url = this.apiUrl + `/api/postpaid?filter=${filter}&currentPage=${currentPage}&perPage=${perPage}`;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url, {headers});
  }

  uploadAttachFile(file: File): Observable<any> {
    const url = `${this.apiUploadPostpaidUrl}object/create`
    const formData = new FormData();
    formData.append('file', file, file.name);

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Authorization': token
    });

    return this.http.post(url, formData, {headers})
  }

  getDetailFile(fileId: number): Observable<any> {
    const url = `${this.apiUploadPostpaidUrl}object/` + fileId;

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Authorization': token
    });
    return this.http.get(url, {headers})
  }

  downloadFile(fileId: number): Observable<any> {
    const url = `${this.apiUploadPostpaidUrl}object/download/` + fileId;

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Authorization': token
    });
    return this.http.get(url, {headers})
  }

  lockUser(request: LockUserRequest): Observable<any> {

    const url = this.apiUrl + `/admin/lock-user`;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post(url, request);
  }

  approve(id: number,
          paymentApproveStatus: PaymentApproveStatus,
          reason: string): Observable<any> {
    const url = this.apiUrl + `/api/postpaid/approve`;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post(url, {
      id: id,
      paymentApproveStatus: paymentApproveStatus,
      reason: reason
    }, {headers});
  }

  registerPostPaid(req: any) {
    const url = this.apiUrl + '/api/postpaid/register';
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.post(url, req, {headers});
  }


}
