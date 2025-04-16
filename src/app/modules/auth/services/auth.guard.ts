import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Router} from '@angular/router';


@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      // logged in so return true
      return true;
    }
    localStorage.setItem('redirectUrl', state.url);
    this.router.navigate(['auth/login'], { queryParams: { returnUrl: state.url }});
    // not logged in so redirect to login page with the return url
    this.authService.logoutLogin();
    return false;
  }
}
