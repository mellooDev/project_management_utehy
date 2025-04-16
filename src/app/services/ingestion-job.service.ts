import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { BaseResponse, PagingRequest, PagingResponse } from 'src/app/models/base';
import {
  IngestionJobDTO,
  IngestionJobHistoryDTO,
  IngestionJobListDTO,
  IngestionJobListReq,
  IngestionJobReq,
  UpdateIngestionJobReq,
} from 'src/app/models/ingestion-job';
import { environment } from 'src/environments/environment';
import { BaseService } from './base.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class IngestionJobService extends BaseService {
  private apiUrl = environment.ingest + '/api/ingestion-jobs/';

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
      Authorization: 'Bearer ' + token,
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

  create(req: IngestionJobReq): Observable<BaseResponse<IngestionJobDTO>> {
    const url = this.apiUrl + 'create';
    return this.http
      .post<BaseResponse<IngestionJobDTO>>(url, req, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  uploadCsv(
    file: File,
    req: IngestionJobReq
  ): Observable<BaseResponse<IngestionJobDTO>> {
    const url = this.apiUrl + 'upload-csv';
    const formData = new FormData();

    formData.append('file', file);
    formData.append(
      'info',
      new Blob([JSON.stringify(req)], {
        type: 'application/json',
      })
    );

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });

    return this.http
      .post<BaseResponse<any>>(url, formData, { headers })
      .pipe(catchError(this.handleError));
  }

  update(
    id: number,
    req: UpdateIngestionJobReq
  ): Observable<BaseResponse<IngestionJobDTO>> {
    const url = this.apiUrl + `update/${id}`;
    return this.http
      .put<BaseResponse<IngestionJobDTO>>(url, req, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    const url = this.apiUrl + `delete/${id}`;
    return this.http
      .delete<void>(url, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<BaseResponse<IngestionJobDTO>> {
    const url = this.apiUrl + `findById/${id}`;
    return this.http
      .get<BaseResponse<IngestionJobDTO>>(url, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getAll(): Observable<BaseResponse<IngestionJobListDTO[]>> {
    const url = this.apiUrl + 'all';
    return this.http
      .get<BaseResponse<IngestionJobListDTO[]>>(url, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getList(
    req: IngestionJobListReq
  ): Observable<PagingResponse<IngestionJobListDTO[]>> {
    const url = this.apiUrl + 'list';
    return this.http
      .post<PagingResponse<IngestionJobListDTO[]>>(url, req, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  start(id: number): Observable<void> {
    const url = this.apiUrl + `start/${id}`;
    return this.http
      .post<void>(url, null, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  stop(id: number): Observable<void> {
    const url = this.apiUrl + `stop/${id}`;
    return this.http
      .post<void>(url, null, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getJobHistory(
    id: number,
    req: PagingRequest
  ): Observable<PagingResponse<IngestionJobHistoryDTO[]>> {
    const url = this.apiUrl + `history/${id}`;
    return this.http
      .post<PagingResponse<IngestionJobHistoryDTO[]>>(url, req, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}
