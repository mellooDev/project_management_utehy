import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectSessionService {
  private apiUrl = 'http://localhost:8096/api/';

  constructor(private http: HttpClient) {}

  createProjectSession(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}projectSession/createProjectSession`,
      data
    );
  }

  searchProjectSession(
    sessionCode: string,
    sessionName: string,
    yearName: string,
    page: number,
    pageSize: number
  ): Observable<any> {
    const body = {
      sessionCode: sessionCode || '',
      sessionName: sessionName || '',
      yearName: yearName || '',
      page: page,
      pageSize: pageSize,
    };

    return this.http.post<any>(`${this.apiUrl}projectSession/getSession`, body);
  }

  getAllProjectSession(
  ): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}projectSession/getAllProjectSession`);
  }

  getSessionWithoutInstructionProcess(
  ): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}projectSession/getSessionWithoutInstructionProcess`);
  }
}
