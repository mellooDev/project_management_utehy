import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { AuthHTTPService } from '../../services/auth-http';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [MessageService]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;
  emailReset: string;
  dataReset: any;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(private fb: FormBuilder, private authService: AuthService,
      private authHttpService: AuthHTTPService,
      private router: Router,
      private cdr: ChangeDetectorRef,
      private messageService: MessageService) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgotPasswordForm.controls;
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          // Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
          Validators.pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|((?!-)[a-zA-Z0-9\-]+(\.[a-zA-Z]{2,})))$/)
        ]),
      ],
    });
  }
  trimEmail() {
    let emailControl = this.forgotPasswordForm.get('email');
    if (emailControl) {
      let trimmedEmail = emailControl.value?.trim();
      emailControl.setValue(trimmedEmail, { emitEvent: false });
    }
  }


  submit() {
    this.errorState = ErrorStates.NotSubmitted;
    const forgotPasswordSubscr = this.authService
      .forgotPassword(this.f.email.value)
      .pipe(first())
      .subscribe((result: boolean) => {
        this.errorState = result ? ErrorStates.NoError : ErrorStates.HasError;
      });
    this.unsubscribe.push(forgotPasswordSubscr);
  }

  api_key: any;
  isLogin: boolean;
  token: string;
  profile: any;

  getUserByToken() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    if (!!this.token) {
      this.authHttpService.getUserByToken(this.token).subscribe(res => {

        if (res) {
          this.isLogin = true;
          this.profile = res;

          const selectedFields = {
            uid: this.profile.uid,
            sub: this.profile.sub,
            group_id: this.profile.group_id,
            fn: this.profile.fn
          }
          console.log('res', this.profile);
          console.log('profile', this.profile.firstName);
          this.api_key = this.profile.api_key;

        } else {
          this.isLogin = false
        }
        console.log('is login', this.isLogin);
        this.cdr.detectChanges();
      })
    }
  }

  showNotification() {
    this.messageService.add({ severity: 'success', summary: 'Thông báo', detail: 'Vui lòng nhập mã otp được gửi đến email để đổi mật khẩu', key: 'br', life: 3000 });
  }

  onResetPassword() {
    const payload = {
      email: this.emailReset,
      service: "OTP_RESET_PASSWORD"
    }
    this.authService.sendOTP(payload).subscribe({
      next: (res) => {
        console.log("sent reset otp success ", res);
        this.authService.setEmail(this.emailReset);
        this.authService.setServiceType('OTP_RESET_PASSWORD');
        this.showNotification()
        setTimeout(() => {

          this.authService.resetPassword(this.emailReset).subscribe(res => {
            this.dataReset = res;
            console.log("data reset: ", this.dataReset);

            localStorage.setItem('reset-token', this.dataReset.token)
          })

          this.router.navigate(['/auth/verify-otp'])
        }, 2000);
      },
      error: (err) => {
        console.log("error", err);

      }
    })

  }
}
