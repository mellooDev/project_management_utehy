import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { AppConstants } from '../utils/app.constants';

@Injectable({
  providedIn: 'root',
})
export class FileManagementService {
  private apiUrl =  AppConstants.API_DATABASE_BASE_URL+'object';

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  getAllFile(keyword: string, currentPage: number, perPage: number) {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token,
    });
    return this.http.get<any>(`${this.apiUrl}/list?fileName=${keyword}`, { headers });
  }

  getDownloadFile(id: number) {
    const token = this.tokenStorage.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token,
    });

    return this.http.get<any>(`${this.apiUrl}/download/${id}`, { headers });
  }
}
