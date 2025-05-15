import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstructionManagementService {
  private apiUrl = 'http://localhost:8096/api/';

  constructor(private http: HttpClient) {}

  createInstructionProcess(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}instruction-process/createInstructionProcess`,
      data
    );
  }

  // searchProjectSession(
  //   sessionCode: string,
  //   sessionName: string,
  //   yearName: string,
  //   page: number,
  //   pageSize: number
  // ): Observable<any> {
  //   const body = {
  //     sessionCode: sessionCode || '',
  //     sessionName: sessionName || '',
  //     yearName: yearName || '',
  //     page: page,
  //     pageSize: pageSize,
  //   };

  //   return this.http.post<any>(`${this.apiUrl}projectSession/getSession`, body);
  // }


}
