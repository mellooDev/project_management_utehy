import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { AuthHTTPService } from 'src/app/modules/auth/services/auth-http';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  providers: [MessageService]
})
export class ChangePasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  newPasswordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;

  checkErrorPassword : boolean = false;
  errorPasswordMessage: string = '';

  checkErrorConfirmPassword : boolean = false;
  errorConfirmPasswordMessage: string = '';

  // Đổi sang sử dụng biến thông báo
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private authHttpService: AuthHTTPService,
    private cdr: ChangeDetectorRef
  ) {}



  togglePasswordVisibility(field: string): void {
    if (field === 'newPassword') {
      this.newPasswordVisible = !this.newPasswordVisible;
    } else if (field === 'confirmPassword') {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  changePassword(event:any){
    const  password = event.target.value;
    this.checkPassword(password, this.confirmPassword);
  }

  changeConfirmPassword(event:any){
    const  confirmPassword = event.target.value;
    this.checkPassword(this.newPassword, confirmPassword);

  }

  checkPassword(password: string , confirmPassword: string){
    const passwordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    this.checkErrorPassword = !password || !passwordPattern.test(password);

    this.errorPasswordMessage = this.checkErrorPassword
      ? password.length === 0
        ? 'Vui lòng nhập Password'
        : 'Mật khẩu phải bao gồm số, chữ hoa, chữ thường và ký tự đặc biệt.'
      : '';

    if (confirmPassword != this.newPassword) {
      this.checkErrorConfirmPassword = true;
      this.errorConfirmPasswordMessage = '\'Mật khẩu\' và \'Nhập lại mật khẩu\' không khớp.'
    }else{
      this.checkErrorConfirmPassword = false;
      this.errorConfirmPasswordMessage = '';
    }

  }

  showNotification() {
    this.messageService.add({ severity: 'success', summary: 'Đổi mật khẩu thành công', detail: 'Đang điều hướng đến trang đăng nhập', key: 'br', life: 3000 });

  }

  api_key: any;
  isLogin: boolean;
  token: string | null = null;

  ngOnInit(): void {
    this.token = localStorage.getItem('reset-token');
  }


  onResetPassword() {

  }

  onChangePassword(): void {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;

    const trimmedNewPassword = this.newPassword?.trim() || '';
    const trimmedConfirmPassword = this.confirmPassword?.trim() || '';

    // Kiểm tra pattern mật khẩu
    if (!passwordPattern.test(trimmedNewPassword)) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và số.';
      return;
    }

    // Kiểm tra mật khẩu khớp nhau
    if (trimmedNewPassword !== trimmedConfirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    // Gọi API đổi mật khẩu
    if(this.token) {
      this.authService
        .setPassword(this.token, trimmedNewPassword, trimmedConfirmPassword)
        .subscribe({
          next: () => {
            this.showNotification();
            this.authService.logout();
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 2000);
          },
          error: (err: any) => {
            this.errorMessage = err.error.message || 'Đã xảy ra lỗi!';
          },
        });

    }
  }

}
