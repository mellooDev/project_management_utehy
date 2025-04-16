import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { BaseResponse, PagingResponse } from 'src/app/models/base';
import { environment } from 'src/environments/environment';
import { TemplateDTO, TemplateListReq, TemplateReq } from '../models/emil-template';
import { BaseService } from './base.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class EmailTemplateService extends BaseService {
  private apiUrl = environment.notify + '/api/templates/';
  private apiEmailUrl = environment.notify + '/api/emails/';


  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {
    super();
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenStorage.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token,
    });
  }

  private handleError(err: any): Observable<never> {
    let errorMessage = 'Có lỗi xảy ra trong quá trình xử lý yêu cầu.';

    // Kiểm tra nếu err.error có dạng BaseResponse
    if (err.error && err.error.code && err.error.desc) {
      errorMessage = `Error Code: ${err.error.code}, Description: ${err.error.desc}`;
    } else if (err.message) {
      // Trường hợp lỗi không theo dạng BaseResponse, lấy message mặc định
      errorMessage = err.message;
    }

    console.error('Ingestion Job Error:', err);
    return throwError(() => new Error(errorMessage));
  }

  create(req: TemplateReq): Observable<BaseResponse<TemplateDTO>> {
    const url = this.apiUrl + 'create';
    return this.http
      .post<BaseResponse<TemplateDTO>>(url, req,
        {
        headers: this.getHeaders(),
      }
      )
      .pipe(catchError(this.handleError));
  }

  update(
    id: number,
    req: TemplateReq
  ): Observable<BaseResponse<TemplateDTO>> {
    const url = this.apiUrl + `update/${id}`;
    return this.http
      .put<BaseResponse<TemplateDTO>>(url, req,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    const url = this.apiUrl + `delete/${id}`;
    return this.http
      .delete<void>(url,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<BaseResponse<TemplateDTO>> {
    const url = this.apiUrl + `findById/${id}`;

    return this.http
      .get<BaseResponse<TemplateDTO>>(url,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  getByCode(code: string): Observable<BaseResponse<TemplateDTO>> {
    const url = this.apiUrl + `findByCode/${code}`;
    return this.http
      .get<BaseResponse<TemplateDTO>>(url,
        // {
        //   headers: this.getHeaders(),
        // }
      )
      .pipe(catchError(this.handleError));
  }

  sendTestEmail(payload: {
    title: string;
    content: string;
    receiverMailAddress: string;
    templateCode: string;
  }): Observable<any> {
    const url = this.apiEmailUrl + 'send'
    return this.http.post(url, payload, {
      headers: this.getHeaders(),
    });
  }

  getList(
    req: TemplateListReq
  ): Observable<PagingResponse<TemplateDTO[]>> {
    const url = this.apiUrl + 'list';
    return this.http
      .post<PagingResponse<TemplateDTO[]>>(url, req,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

}
