import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginRequest } from "../../services/auth-http/auth-http.service";
import { AppConstants } from "../../../../utils/app.constants";
import { TokenStorageService } from "../../../../services/token-storage.service";
import { UserService } from "../../../../services/user.service";
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

  googleURL = AppConstants.GOOGLE_AUTH_URL;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  currentUser: any;


  defaultAuth: any = {

    username: '',
    password: '',
  };
  loginForm: FormGroup;
  hasError: boolean;
  messageError: string;
  returnUrl: string = '/marketplace'; // Đường dẫn mặc định nếu không có returnUrl
  isLoading$: Observable<boolean>;
  loginRequest: LoginRequest = {};
  email: string;
  codeGoogle: string;
  recaptchaToken: string = ''; // Token from Google reCAPTCHA

  siteKeyCaptcha: string = environment.SITE_KEY;
  captcha: any;
  isUseCaptcha: boolean = environment.IS_USE_CAPTCHA;
  iconSuffix: string = "lock icon"
  msgError: string = ""
  errorLoginMessage = {
    dataEmailLogin: '',
    dataPasswordLogin: '',
  }
  dataEmailLogin: string = '';
  dataPasswordLogin: string = '';

  isDataEmailInvalid: boolean = false;
  isDataPasswordInvalid: boolean = false;

  currentInvalidField:
    | 'dataEmailLogin'
    | 'dataPasswordLogin'
    | null = null;

  siteKey: string = '6LfJ6Z4qAAAAABW6nKgtlmtLPKUvBi_IAmWaB2-U'; // Thay bằng Site Key của bạn
  captchaResponse: string | null = null;
  captchaCompleted: boolean = false; // Trạng thái hoàn thành reCAPTCHA
  isRediectUrlParam:string;
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  // private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private tokenStorage: TokenStorageService,
    private userService: UserService
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
     // this.router.navigate(['/']);
     this.router.navigateByUrl(this.returnUrl);
    }
  }

  ngOnInit(): void {
       // Lấy giá trị returnUrl từ query params
       this.route.queryParams.subscribe(params => {
        this.returnUrl = params['returnUrl'] || 'marketplace';
      });

    const token = this.route.snapshot.queryParamMap.get('token');
    const refreshToken = this.route.snapshot.queryParamMap.get('rft') || '';
    const error = this.route.snapshot.queryParamMap.get('error');
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.currentUser = this.tokenStorage.getUser();
    } else if (token) {
      this.tokenStorage.saveToken(token);
      this.tokenStorage.saveRfToken(refreshToken);
      this.authService.getUserByToken().subscribe(data => {
        // alert(this.returnUrl);
        // this.router.navigateByUrl(this.returnUrl);
       // this.router.navigate(['/marketplace']);
       this.router.navigateByUrl(this.returnUrl).then(() => {
        // Reload current route
        this.router.navigate([this.router.url]);
      });
      // this.router.navigateByUrl(this.returnUrl);

      });
    } else if (error) {
      this.errorMessage = error;
      this.isLoginFailed = true;
    }

    this.initValues();

    this.loginForm = this.fb.group({
      email: [this.dataEmailLogin, [Validators.required, Validators.email]],
      password: [this.dataPasswordLogin, [Validators.required]],
      // Nếu cần thêm recaptcha thì sử dụng Validators.required
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initValues() {
    // Gán giá trị mặc định cho email và password nếu có
    this.dataEmailLogin = this.defaultAuth.email || '';
    this.dataPasswordLogin = this.defaultAuth.password || '';
  }

  onInputChange(
    field:
      | 'dataEmailLogin'
      | 'dataPasswordLogin'
  ) {
    if (field === 'dataEmailLogin') {
      const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|((?!-)[a-zA-Z0-9\-]+(\.[a-zA-Z]{2,})))$/;

      this.dataEmailLogin = this.dataEmailLogin?.trim() || '';

      const invalidEmail =
        !this.dataEmailLogin || !emailPattern.test(this.dataEmailLogin);

      this.isDataEmailInvalid = invalidEmail;

      this.errorLoginMessage.dataEmailLogin = invalidEmail
        ? this.dataEmailLogin.length === 0
          ? 'Vui lòng nhập email'
          : 'Email không đúng định dạng'
        : '';
    }

    if (field === 'dataPasswordLogin') {

      const passwordPattern =
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;

      const invalidPass =
        !this.dataPasswordLogin || !passwordPattern.test(this.dataPasswordLogin);

      this.isDataPasswordInvalid = invalidPass;

      this.errorLoginMessage.dataPasswordLogin = invalidPass
        ? this.dataPasswordLogin.length === 0
          ? 'Vui lòng nhập Password'
          : 'Mật khẩu phải bao gồm số, chữ hoa, chữ thường và ký tự đặc biệt.'
        : '';
    }
  }

  // Sự kiện khi reCAPTCHA được xác nhận
  onCaptchaResolved(response: any) {
    if (response) {
      this.captchaCompleted = true;
      console.log('reCAPTCHA completed:', response);
    } else {
      this.captchaCompleted = false;
    }
  }


  getResponceCapcha(captchaResponse: string) {
    this.verifyCaptcha(captchaResponse);
    return captchaResponse;
  }

  verifyCaptcha(captchaResponse: string) {
    console.log(`Verified: ${captchaResponse}`)
  }

  submit() {

    this.router.navigate(['/marketplace']);


  //   this.onInputChange('dataEmailLogin');  // Kiểm tra validate email
  // this.onInputChange('dataPasswordLogin');  // Kiểm tra validate password

  // // Nếu có lỗi validate thì không thực hiện submit
  // if (this.isDataEmailInvalid || this.isDataPasswordInvalid) {
  //   console.log('Form không hợp lệ');
  //   return;
  // }
  //   this.hasError = false;

  //   this.loginRequest.email = this.f.email.value.trim();
  //   this.loginRequest.password = this.f.password.value
  //   this.authService.login(this.loginRequest).subscribe((resq: any) => {
  //     if (resq) {
  //       if(resq.error){
  //         console.log(resq.error);
  //         this.hasError = true;
  //         this.messageError = resq.error.message;
  //         return;
  //       }
  //       // this.router.navigateByUrl(this.returnUrl);
  //      // this.router.navigate(['/marketplace']);
  //      // window.location.reload();
  //       // Đọc URL trước đó
  //      // const redirectUrl = localStorage.getItem('redirectUrl') || '/';
  //       // console.log('login redirectUrl',redirectUrl);

  //     //  localStorage.removeItem('redirectUrl'); // Xóa URL đã lưu

  //       // Điều hướng
  //     //  this.router.navigateByUrl(redirectUrl);
  //     // this.router.navigateByUrl(this.returnUrl);
  //        this.router.navigateByUrl(this.returnUrl).then(() => {
  //         // Reload current route
  //         this.router.navigate([this.router.url]);
  //         window.location.reload();
  //       });
  //     //  window.location.reload();
  //     } else {
  //       console.log('login fail');
  //       this.hasError = true;
  //     }
  //   })

  }

  loginWithGoogle(codeGoogle: any) {

    // if (this.codeGoogle !== null) {
    //   this.authService.loginWithGoogle(this.codeGoogle).subscribe((resq: any) => {
    //     if (resq) {
    //       this.router.navigate([this.returnUrl]);
    //     } else {
    //       this.hasError = true;
    //     }
    //   })
    // }

  }

  login(user: any): void {
    this.tokenStorage.saveUser(user);
    this.isLoginFailed = false;
    this.isLoggedIn = true;
    this.currentUser = this.tokenStorage.getUser();
    this.router.navigateByUrl(this.returnUrl);
    window.location.reload();
  }


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
