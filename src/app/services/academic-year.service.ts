import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AcademicYearService {
  private apiUrl = 'http://localhost:8096/api/';

  constructor(private http: HttpClient) {}

  getYear(): Observable<any> {
    const url = this.apiUrl + 'academicYear/getYear';

    return this.http.get<any>(url);
  }
}
