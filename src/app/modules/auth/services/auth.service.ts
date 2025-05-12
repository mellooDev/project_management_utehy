import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import {AuthenModel, AuthModel} from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

import {HttpClient, HttpHeaders} from "@angular/common/http";
import {LoginRequest, RegisterRequest} from "./auth-http/auth-http.service";
import {TokenStorageService} from "../../../services/token-storage.service";
import {UserService} from "../../../services/user.service";


export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  private apiUrl = environment.authen +  '/customer/password';
  private apiSendOTPUrl = environment.authen + '/api';

  private emailSource = new BehaviorSubject<string | null>(null);
  currentEmail = this.emailSource.asObservable();
  public serviceTypeSubject = new BehaviorSubject<string>('');
  serviceType$ = this.serviceTypeSubject.asObservable();

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<any>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  setEmail(email: string) {
    this.emailSource.next(email);
  }

  setServiceType(service: string) {
    this.serviceTypeSubject.next(service);
  }

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private userService: UserService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    // const subscr = this.getUserByToken().subscribe();
    // this.unsubscribe.push(subscr);
  }
  login(loginRequest: LoginRequest): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.doLogin(loginRequest).pipe(
      map((auth: AuthenModel) => {
        const result = this.setAuthFromLocalStorage(auth.token);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(err);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // loginWithGoogle(code: any): Observable<any> {
  //   this.isLoadingSubject.next(true);
  //   return this.authHttpService.doLoginByGoogle(code).pipe(
  //     map((auth: AuthenModel) => {
  //       if(auth !== null && auth.data !== null ){
  //         if(auth.data.emailExist){
  //           const result = this.setAuthFromLocalStorage(auth.data);
  //           return result;
  //         }else{
  //           console.log("redirect to Register")
  //           this.router.navigate(['/auth/registration'], {
  //             queryParams: {email: auth.data.email},
  //           });
  //         }

  //       }
  //       return false;
  //     }),
  //     switchMap(() => this.getUserByToken()),
  //     catchError((err) => {
  //       console.error('err', err);
  //       return of(undefined);
  //     }),
  //     finalize(() => this.isLoadingSubject.next(false))
  //   );
  // }

  // logout() {
  //   this.tokenStorage.signOut()
  //   this.router.navigate(['/auth/login'], {
  //     queryParams: {},
  //   });
  // }

  logoutLogin(): void {
    this.tokenStorage.signOut(); // Xóa token hoặc session
   // window.location.reload(); // Đảm bảo trạng thái được làm mới
  }


  logout(): void {
    this.tokenStorage.signOut(); // Xóa token hoặc session
    this.router.navigate(['/auth/login']).then(() => {
      window.location.reload(); // Đảm bảo trạng thái được làm mới
    });
  }


    getUserByToken(): Observable<any> {
    const token = this.getAuthFromLocalStorage();
    if (!token) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);

    return of(this.decodeJWT(token)).pipe(
      map((user: any) => {
        if (user) {
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }



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
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    // Chuyển payload thành đối tượng JSON
    return JSON.parse(decodedPayload);
  }


  registration(user: RegisterRequest): Observable<any> {
    this.isLoadingSubject.next(true);
    const loginRequest: LoginRequest = {};
    loginRequest.usernameOrEmail = user.email;
    loginRequest.password = user.password
    return this.authHttpService.doRegister(user).pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      switchMap(() => this.login(loginRequest)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }
  private setAuthFromLocalStorage(auth: any): boolean {
    if (auth) {
      this.tokenStorage.saveToken(auth)
      return true;
    }
    return false;
  }

  public getAuthFromLocalStorage(): any | undefined {
    try {
      const token = this.tokenStorage.getToken();
      if (!token) {
        return undefined;
      }
      return token;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

    // Giải mã token và lấy thông tin expiry time
    getTokenExpiration(token: string): number | null {
      try {
        const decoded: any = this.decodeJWT(token);
        return decoded?.exp ? decoded.exp * 1000 : null; // Chuyển từ giây sang mili giây
      } catch (error) {
        console.error('Invalid token:', error);
        return null;
      }
    }

    // Kiểm tra token còn hạn hay không
    isTokenExpired(token: string): boolean {
      const expiryTime = this.getTokenExpiration(token);
      if (!expiryTime) return true; // Nếu không lấy được exp, coi như token hết hạn
      return Date.now() > expiryTime;
    }

    // Kiểm tra và điều hướng nếu token hết hạn
    validateTokenAndRedirect(token: string): void {
      if (this.isTokenExpired(token)) {
       // this.logout();
       this.tokenStorage.signOut(); // Xóa token hoặc session
        console.warn('Token expired, redirecting to login...');
        this.router.navigate(['/home']); // Điều hướng đến trang đăng nhập
      }
    }


  resetPassword(email: string): Observable<any> {
    const formData = new FormData();
    formData.append('email', email)
    return this.http.post(`${this.apiUrl}/reset`, formData);
  }

  setPassword(token: string, newPassword: string, confirmPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const payload = {
      token: token,
      new_password: newPassword,
      retype_password: confirmPassword,
    };
    return this.http.post(`${this.apiUrl}/set`, payload, {headers});
  }

  sendOTP(payload: { email: string, service: string}): Observable<any> {
    return this.http.post(`${this.apiSendOTPUrl}/send-otp`, payload)
  }

  verifyOtp(payload: { email: string, otp: string, service: string}): Observable<any> {
    return this.http.post(`${this.apiSendOTPUrl}/verify-otp`, payload)
  }
}
