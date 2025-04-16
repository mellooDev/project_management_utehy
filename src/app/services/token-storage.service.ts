import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";

const TOKEN_KEY = `${environment.appVersion}` + '-auth-token';
const USER_KEY = `${environment.appVersion}` + '-auth-user';

const RF_TOKEN_KEY = `${environment.appVersion}` + '-auth-rf-token';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {


  constructor() {
  }

  signOut(): void {
    window.localStorage.removeItem(TOKEN_KEY);

    //window.localStorage.clear();
  }

  public saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string {
    // @ts-ignore
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveRfToken(token: string): void {
    window.localStorage.removeItem(RF_TOKEN_KEY);
    window.localStorage.setItem(RF_TOKEN_KEY, token);
  }

  public getRfToken(): string {
    // @ts-ignore
    return localStorage.getItem(RF_TOKEN_KEY);
  }

  // @ts-ignore
  public saveUser(user): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    // @ts-ignore
    return JSON.parse(localStorage.getItem(USER_KEY));
  }
}
