import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RegisterRequest } from '../../services/auth-http/auth-http.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
  providers: [MessageService]
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  otpValue: string = '';
  countdown: number = 0;
  isResendAllowed: boolean = false;
  countdownInterval: any;
  serviceType: string = '';

  constructor(private messageService: MessageService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.onSubmitOtp();
    this.startCountdown(60);
    this.authService.serviceType$.subscribe(service => {
      this.serviceType = service;
      console.log('current service: ', this.serviceType);

    })
  }

  //thông báo gửi otp thành công hoặc không thành công
  showNotification(serverity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: `${serverity}`, summary: `${summary}`, detail: `${detail}`, life: lifetime });
  }

  onOtpChange(value: string) {
    if(value.length === 6) {
      this.verifyOtp(value);
      console.log('OTP: ', value);
    }
  }

  verifyOtp(otp: string) {
    this.authService.currentEmail.subscribe((email) => {
      if (email) {
        const payload = {
          email: email,
          otp: otp,
          service: this.serviceType
        }

        console.log("payload: ", payload);

        this.authService.verifyOtp(payload).subscribe({
          next: (res) => {
            if (res.code !== '101') {
              if(this.serviceType === 'OTP_RESET_PASSWORD'){
                this.showNotification('success', 'Thông báo', 'OTP hợp lệ. Đang chuyển sang trang đổi mật khẩu.', 3000);
                setTimeout(() => {
                  this.router.navigate(['/auth/change-password']);
                }, 3000);
              }
              if(this.serviceType === 'OTP_ACTIVE_ACCOUNT'){
                this.showNotification('success', 'Thông báo', 'OTP hợp lệ. Tài khoản của bạn đã được kích hoạt.  Đang chuyển sang trang Đăng nhập', 3000);
                setTimeout(() => {
                  this.router.navigate(['/auth/login']);
                }, 3000);
              }

            }
            else {
              this.showNotification('error', 'Thông báo', 'OTP không hợp lệ. Vui lòng nhập lại', 3000);
            }


          },
          error: (err) => {
            console.log("error: ", err);
            this.showNotification('error', 'Thông báo', 'OTP không hợp lệ. Vui lòng nhập lại', 3000);

          }
        })

      }
      else {
        console.log("email khong ton tai");

      }
    })

  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  onSubmitOtp() {


  }

  startCountdown(seconds: number): void {
    this.countdown = seconds;
    this.isResendAllowed = false;

    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown -= 1;
      } else {
        clearInterval(this.countdownInterval);
        this.isResendAllowed = true;
      }
    }, 1000);
  }

  onResendClick(): void {
    console.log('resend status: ', this.isResendAllowed);

    if (this.isResendAllowed) {
      this.authService.currentEmail.subscribe((email) => {
        if(email) {
          const payload = {
            email: email,
            service: this.serviceType
          }
          this.authService.sendOTP(payload).subscribe({
            next: (res) => {
              console.log('resend success', res);

            },
            error: (err) => {
              console.log("error", err);

            }
          })
        }
      })
    }
    this.startCountdown(60);
    console.log('Gửi lại mã OTP');
  }
}
