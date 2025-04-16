import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
import { AuthService } from '../modules/auth/services/auth.service';
import {Router} from "@angular/router";

  @Injectable()
  export class TokenInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private router: Router) {}

    intercept(
      req: HttpRequest<any>,
      next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const token = <string>localStorage.getItem('v8.2.3-auth-token');
        if (token) {
          this.authService.validateTokenAndRedirect(token);
        }else {
          // this.router.navigate(['/auth/login']);
        }

      return next.handle(req);
    }
  }
