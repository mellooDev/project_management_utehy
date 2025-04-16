import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataManagementService extends BaseService {
  private apiUrl = `${environment.dataManagement}` + '/';

  constructor(private http: HttpClient) {
    super();
  }

  getListDatabases(token: string) {
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    return this.http.get<any>(this.apiUrl + `database/list`, { headers });
  }

  getDatabaseTable(dbId: number, token: string) {
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    return this.http.get<any>(this.apiUrl + `database/${dbId}/tables`, {
      headers,
    });
  }

  executeQuery(dbId: number, token: string, sql: string) {
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const params = new HttpParams().set('sql', sql);
    return this.http.post<any>(this.apiUrl + `database/${dbId}/query`, params, {
      headers,
    });
  }

  exportToExcel(dbId: number, token: string, sql: string) {
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const params = new HttpParams().set('sql', sql);

    return this.http.post(
      this.apiUrl + `database/${dbId}/export-excel`,
      params,
      {
        headers,
        responseType: 'blob', // Đảm bảo nhận file dưới dạng blob
      }
    );
  }

  insertQueryResultToTable(
    dbId: number,
    token: string,
    tableName: string,
    sql: string
  ) {
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const params = new HttpParams().set('tableName', tableName).set('sql', sql);

    return this.http.post<any>(
      this.apiUrl + `database/${dbId}/insert-query-result-to-table`,
      params,
      {
        headers,
      }
    );
  }
}
