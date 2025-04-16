import {AppConstants} from "../utils/app.constants";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {TokenStorageService} from "./token-storage.service";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";


export interface GetListRequest{
  currentPage : number ,
  perPage: number,
  filter: string | null,
  sortBy?: string | null,
  sortDesc?: boolean | null,
  parentId?: number | null
}

export interface CreateWorksheetRequest{
  name?: string ,
  content?: string | null,
  folderId?: number | null
}

export interface UpdateWorksheetRequest{
  name?: string ,
  content?: string | null,
  folderId?: number | null,
  dbId?:number | null
}

export interface CreateFolderRequest{
  name?: string ,
  parentId?: number,
}
export interface UpdateFolderRequest{
  name?: string ,
  parentId?: number,
}


export interface WorksheetDTO {
  id?: number;
  ownerId?: number;
  folderId?: number;
  name?: string | null;
  content?: string | null;
  execAt?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedDate?: string | null;
}

export interface FolderDTO {
  id?: number;
  name?: string | null;
  parentId?: number | null;
  createdBy?: string | null;
  createdDate?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedDate?: string | null;
  ownerId?: number | null;
}

@Injectable({
  providedIn: 'root', // This ensures the service is available application-wide
})
export class WorksheetManagementService {
  private apiUrl = AppConstants.API_DATABASE_BASE_URL;

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {
  }

  getWorksheets(request : GetListRequest ): Observable<any> {
    const url = this.apiUrl + `api/work-sheets/list`;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post<any>(url, request, {headers : headers});
  }

  deleteWorksheet(id: number): Observable<any> {
    const url = this.apiUrl + `api/work-sheets/delete/`+ id;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.delete<any>(url,  {headers : headers});
  }


  deleteFolder(id: number): Observable<any> {
    const url = this.apiUrl + `api/work-sheet-folders/delete/`+ id;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.delete<any>(url,  {headers : headers});
  }

  createWorksheet(request : CreateWorksheetRequest): Observable<any> {
    const url = this.apiUrl + `api/work-sheets/create`;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post<any>(url, request, {headers : headers});
  }

  updateWorksheet(request: UpdateWorksheetRequest, id: number): Observable<any>{
    const url = this.apiUrl + `api/work-sheets/update/`+id;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.put<any>(url, request, {headers : headers});
  }

  getFolders(request : GetListRequest ): Observable<any> {
    const url = this.apiUrl + `api/work-sheet-folders/list`;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post<any>(url, request, {headers : headers});
  }

  createFolder(request : CreateFolderRequest): Observable<any> {
    const url = this.apiUrl + `api/work-sheet-folders/create`;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.post<any>(url, request, {headers : headers});
  }


  updateFolder(id:number, request : UpdateFolderRequest): Observable<any> {
    const url = this.apiUrl + `api/work-sheet-folders/update/`+id;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.put<any>(url, request, {headers : headers});
  }

}
