import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, mergeMap, Observable, of } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { data } from 'jquery';
import { AppConstants } from '../utils/app.constants';


interface Database {
  id: number;
  ownerId: number;
  databaseName: string;
  immudbName: string;
  createdAt: string | null;
  updatedAt: string | null;
  isDeleted: number;
  deletedAt: string | null;
}

interface Table {
  id: number;
  ownerId: number;
  tableName: string;
  schemaDefinition: string;
  count: string;
  createdAt: string | null;
  isDeleted: number;
  deletedAt: string | null;
}

interface TreeNode {
  key: string;
  label: string;
  data: string;
  children?: TreeNode[]; // Cấu trúc cây con
}

interface CustomNodeTree extends TreeNode {
  tableInfo?: Table;
}

@Injectable({
  providedIn: 'root',
})


export class DatasetNodeService {

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {}

  private baseUrl = AppConstants.API_DATABASE_BASE_URL+'database'



  getFiles(): Observable<TreeNode[]> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(`${this.baseUrl}/list`, {headers}).pipe(
      mergeMap((response) => {
        return this.transformResponseToTreeData(response)
      })

    );

  }

  queryTable(databaseId: number, sql: string): Observable<any> {

    const query = `${this.baseUrl}/${databaseId}/query`

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': token
    });

    const body = new HttpParams().set('sql', sql)

    return this.http.post(query, body, {headers})
  }


  transformResponseToTreeData(response: {owned: Database[] }): Observable<CustomNodeTree[]> {

    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    const tableRequests = response.owned.map((database) =>
      this.http.get<Table[]>(`${this.baseUrl}/${database.id}/tables`, {headers}).pipe(
        map((tables) => ({
          ...database,
          tables
        }))
      )
    );

    return forkJoin(tableRequests).pipe(
      map((databaseWithTables) => {
        return databaseWithTables.map((database) => ({
          key: database.id.toString(),
          label: database.databaseName,
          data: database.id.toString(),
          children: database.tables.length > 0 ? database.tables.map((table) => ({
            key: `${database.id}-${table.id}`,
            label: table.tableName,
            data: table.tableName,
            tableInfo: table,
          })): []
        }))
      })
    )

  }

}
