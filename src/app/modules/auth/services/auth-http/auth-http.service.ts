import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserModel } from '../../models/user.model';
import { AuthModel } from '../../models/auth.model';
import { environment } from '../../../../../environments/environment';
import { AppConstants } from 'src/app/utils/app.constants';
import { encode, decode } from 'js-base64';


const API_USERS_URL = `${environment.apiUrl}/user/profile`;


export interface LoginRequest {
  usernameOrEmail?: string | null,
  // username?: string | null,
  password?: string | null
}

export class RegisterRequest{
  username: string;
  fullName: string;
  full_name: string;
  email: string;
  phone: string;
  password: string
  group_id: number
}

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  // private apiUrl = AppConstants.API_BASE_URL + 'api/v1/';
  constructor(private http: HttpClient) {}

  // public methods
  login(email: string, password: string): Observable<any> {
    console.log('first')
    const notFoundError = new Error('Not Found');
    if (!email || !password) {
      return of(notFoundError);
    }

    return this.getAllUsers().pipe(
      map((result: UserModel[]) => {
        if (result.length <= 0) {
          return notFoundError;
        }

        const user = result.find((u) => {
          return (
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
          );
        });
        if (!user) {
          return notFoundError;
        }

        const auth = new AuthModel();
        auth.authToken = user.authToken;
        auth.refreshToken = user.refreshToken;
        auth.expiresIn = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
        return auth;
      })
    );
  }

  // createUser(user: UserModel): Observable<any> {
  //   user.roles = [2]; // Manager
  //   user.authToken = 'auth-token-' + Math.random();
  //   user.refreshToken = 'auth-token-' + Math.random();
  //   user.expiresIn = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000);
  //   user.pic = './assets/media/avatars/300-1.jpg';
  //
  //   return this.http.post<UserModel>(this.apiUrl+"customer/register", user);
  // }

  doRegister(registerRequest: RegisterRequest): Observable<any>{
    const url = environment.authen + '/api/customers';
    var body={

        "full_name": registerRequest.full_name,
        "email": registerRequest.email,
        "password": registerRequest.password,
        "group_id": registerRequest.group_id
  };

    return this.http.post<any>(url,body);
  }

  forgotPassword(email: string): Observable<boolean> {
    return this.getAllUsers().pipe(
      map((result: UserModel[]) => {
        const user = result.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        return user !== undefined;
      })
    );
  }

  // getUserByToken(token: string): Observable<UserModel | undefined> {
  //   const user = UsersTable.users.find((u: UserModel) => {
  //     return u.authToken === token;
  //   });
  //
  //   if (!user) {
  //     return of(undefined);
  //   }
  //
  //   return of(user);
  // }

  decodeJWT(token: string): any {
    if (!token) {
      throw new Error('Token is empty');
    }


    // Phần thứ hai của JWT là payload (nằm giữa hai dấu chấm)
    const payload = token.split('.')[1];
    if (!payload) {
      throw new Error('Invalid token format');
    }

    // Giải mã payload từ Base64URL
    // const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(decode(payload.replace(/-/g, '+').replace(/_/g, '/')));
    // Chuyển payload thành đối tượng JSON
    // return JSON.parse(decodedPayload);
  }

  getUserByToken(token: string): Observable<any | undefined> {
    const decodedToken = this.decodeJWT(token); // Assuming this is a synchronous function
    return of(decodedToken); // Wrap the result in an Observable
  }

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(API_USERS_URL);
  }

  doLogin(loginRequest: LoginRequest): Observable<any> {
    // const url = environment.authen +'/customer/login';
    const url = 'http://localhost:8096/api' +'/auth/login';
    return this.http.post<any>(url,loginRequest);
  }

  // doLoginByGoogle(code: string): Observable<any>  {
  //   const url = this.apiUrl + 'login-with-google' ;
  //   let params  = new HttpParams();
  //   params = params.append('code' , code);
  //   return this.http.get<any>(url, {params});
  // }




}
