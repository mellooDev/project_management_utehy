import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IRoleModel} from './role.service';
import {BaseService} from "./base.service";
import {AppConstants} from "../utils/app.constants";
import { TokenStorageService } from './token-storage.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProviderDataService extends BaseService {

  private apiUrl = AppConstants.API_ORDER_BASE_URL+"api/";
  private apiFileUrl = AppConstants.API_DATABASE_BASE_URL;
  private apiProductUrl = environment.dataCatalog+"/api/";

  constructor(private http: HttpClient,    private tokenStorage: TokenStorageService,
  ) {
    super();
  }

  getAllDataList(keyword: string, currentPage: number, perPage: number): Observable<any> {
    const url = AppConstants.API_PRODUCT_BASE_URL+"api/private/products?name="+keyword;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url,{headers});
  }


  getAll(): Observable<any> {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjEwLCJzdWIiOiJiYW9wMzNAdm5wdC52biIsImF1ZCI6ImFwaSIsImdyb3VwX2lkIjoyLCJpYXQiOjE3MzMxNjE3NTYsImV4cCI6MTczMzE2NTM1Nn0.YjRj7UKDijOm9hs__DfEPauQ0nFm0SP4awaazg6_zUo'
    });
    return this.http.get<any>(`${this.apiProductUrl}private/products`,{headers});
  }

  getFileDownload(id:number): Observable<any> {
    const url = this.apiFileUrl + "object/download/"+id;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.get<any>(url,{headers});
  }

  getListFile(): Observable<any> {
     const url = this.apiFileUrl + "object/list";

     const token = this.tokenStorage.getToken();
     const headers = new HttpHeaders({
       'Content-Type': 'application/json',
       'Authorization': token
     });
     return this.http.get<any>(url,{headers});
   }

   uploadFile(file: File, additionalData: any = {}): Observable<any> {
    const url = this.apiFileUrl + 'object/create';
    const token = this.tokenStorage.getToken();

    // Create a FormData instance
    const formData = new FormData();
    formData.append('file', file); // Add the file to the form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]); // Add additional fields, if any
    });

    // Set up headers
    const headers = new HttpHeaders({
      Authorization: token,
    });

    // Make the HTTP POST request
    return this.http.post<any>(url, formData, { headers });
  }
  uploadFileLogo(id:number,file: File, additionalData: any = {}): Observable<any> {
    const url = this.apiProductUrl + 'private/product/'+id+'/images';
    const token = this.tokenStorage.getToken();

    // Create a FormData instance
    const formData = new FormData();
    formData.append('type', 'logo'); // Add the file to the form data
    formData.append('file', file); // Add the file to the form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]); // Add additional fields, if any
    });

    // Set up headers
    const headers = new HttpHeaders({
      Authorization: token,
    });

    // Make the HTTP POST request
    return this.http.post<any>(url, formData, { headers });
  }
  uploadFileCertificate(id:number,file: File, additionalData: any = {}): Observable<any> {
    const url = this.apiProductUrl + 'private/product/'+id+'/images';
    const token = this.tokenStorage.getToken();

    // Create a FormData instance
    const formData = new FormData();
    formData.append('type', 'certificate'); // Add the file to the form data
    formData.append('file', file); // Add the file to the form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]); // Add additional fields, if any
    });

    // Set up headers
    const headers = new HttpHeaders({
      Authorization: token,
    });

    // Make the HTTP POST request
    return this.http.post<any>(url, formData, { headers });
  }
  uploadFileExample(id:number,file: File, additionalData: any = {}): Observable<any> {
    const url = this.apiProductUrl + 'private/product/'+id+'/images';
    const token = this.tokenStorage.getToken();

    // Create a FormData instance
    const formData = new FormData();
    formData.append('type', 'example'); // Add the file to the form data
    formData.append('file', file); // Add the file to the form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]); // Add additional fields, if any
    });

    // Set up headers
    const headers = new HttpHeaders({
      Authorization: token,
    });

    // Make the HTTP POST request
    return this.http.post<any>(url, formData, { headers });
  }
  createData(data: any): Observable<any> {
    const url = this.apiProductUrl + 'private/product';

    const token = this.tokenStorage.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.post<any>(url, data, {headers});
  }

  updateData(id:number, data: any): Observable<any> {
    const url = this.apiProductUrl + 'private/product/'+id;

    const token = this.tokenStorage.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.put<any>(url, data, {headers});
  }

  createProductItem(id:number,data: any): Observable<any> {
    const url = this.apiProductUrl + 'private/product/'+id+'/items';
    const token = this.tokenStorage.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });

    return this.http.post<any>(url, data, {headers});
  }

  changeVisibility(id:number,visible:string ): Observable<any> {
    const url = this.apiProductUrl + 'private/product/'+id+'/visibility';

    const token = this.tokenStorage.getToken();

     // Create a FormData instance
     const formData = new FormData();
     formData.append('visible', visible);

     // Set up headers
     const headers = new HttpHeaders({
       Authorization: token,
     });

     // Make the HTTP POST request
     return this.http.post<any>(url, formData, { headers });
  }
  deleteImage(id:string): Observable<any> {
    const url = this.apiProductUrl + "private/image/"+id;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.delete<any>(url,{headers});
  }
  deleteItem(id:string): Observable<any> {
    const url = this.apiProductUrl + "private/item/"+id;
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
    return this.http.delete<any>(url,{headers});
  }
}
