import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import { UserModel } from '../../models/user.model';
import { first } from 'rxjs/operators';
import {AuthHTTPService, RegisterRequest} from "../../services/auth-http/auth-http.service";
import { FormAddUser, UserService } from "../../../../services/user.service";
import { MessageService } from 'primeng/api';
import { customValidationEmail } from 'src/app/utils/validation-email-custom';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  providers: [MessageService]
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;
  termsAccepted: boolean = false; // Biến kiểm tra trạng thái checkbox
  isTermsModalOpen: boolean = false; // Điều khiển hiển thị modal

  isProviderChecked: boolean = false;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private authHttpService: AuthHTTPService,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }
  email: string;
  imagePreviewBefore: string | ArrayBuffer | null = null;
  imagePreviewAfter: string | ArrayBuffer | null = null;

  fileBefore: File
  fileAfter: File

  ngOnInit(): void {
    this.initForm();
  }

  // Hàm xử lý khi trạng thái checkbox thay đổi
  onTermsChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.termsAccepted = checkbox.checked;
  }
  openTermsPopup(): void {
    this.isTermsModalOpen = true; // Mở modal
  }

  closeTermsPopup(): void {
    this.isTermsModalOpen = false; // Đóng modal
  }
  onFileChangeBefore(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      this.registrationForm.controls['cardIdImageBefore'].setValue(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewBefore = reader.result;  // Set the image preview
      };
      reader.readAsDataURL(file);
      this.fileBefore = file;
      console.log('file', this.fileBefore)
    } else {
      this.imagePreviewBefore = null;
      this.registrationForm.controls['cardIdImageBefore'].setValue(null);
    }
    this.registrationForm.controls['cardIdImageBefore'].updateValueAndValidity();
  }

  onFileChangeAfter(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      this.registrationForm.controls['cardIdImageAfter'].setValue(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewAfter = reader.result;  // Set the image preview
      };
      reader.readAsDataURL(file);
      this.fileAfter = file;
      console.log('file', this.fileAfter)

    } else {
      this.imagePreviewAfter = null;
      this.registrationForm.controls['cardIdImageAfter'].setValue(null);
    }
    this.registrationForm.controls['cardIdImageAfter'].updateValueAndValidity();
  }


  onChangeCheckboxProvider(isChecked: boolean) {
    this.isProviderChecked = isChecked;
    console.log(this.isProviderChecked);
    this.updateValidatorsBasedOnCheckbox();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registrationForm.controls;
  }

  // This method will be triggered when isChecked changes
  updateValidatorsBasedOnCheckbox(): void {
    if (this.isProviderChecked) {
      this.registrationForm.get('cardId')?.setValidators([Validators.required, Validators.pattern("^[0-9]+$"), Validators.minLength(12), Validators.maxLength(13)]);
      this.registrationForm.get('cardIdImageBefore')?.setValidators([Validators.required]);
      this.registrationForm.get('cardIdImageAfter')?.setValidators([Validators.required]);
      this.registrationForm.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern(/^(0[3|5|7|8|9])+([0-9]{8})$/)]);
      this.registrationForm.get('website')?.setValidators([ Validators.required, Validators.maxLength(255)]);
      this.registrationForm.get('address')?.setValidators([ Validators.required, Validators.maxLength(255)]);

      this.registrationForm.get('cardId')?.updateValueAndValidity();
      this.registrationForm.get('phoneNumber')?.updateValueAndValidity();
      this.registrationForm.get('cardIdImageBefore')?.updateValueAndValidity();
      this.registrationForm.get('cardIdImageAfter')?.updateValueAndValidity();
      this.registrationForm.get('website')?.updateValueAndValidity();
      this.registrationForm.get('address')?.updateValueAndValidity();
    } else {
      this.registrationForm.get('cardId')?.clearValidators();
      this.registrationForm.get('phoneNumber')?.clearValidators();
      this.registrationForm.get('website')?.clearValidators();
      this.registrationForm.get('cardIdImageBefore')?.clearValidators();
      this.registrationForm.get('cardIdImageAfter')?.clearValidators();
      this.registrationForm.get('address')?.clearValidators();

      this.registrationForm.get('cardId')?.updateValueAndValidity();
      this.registrationForm.get('phoneNumber')?.updateValueAndValidity();
      this.registrationForm.get('website')?.updateValueAndValidity();
      this.registrationForm.get('cardIdImageBefore')?.updateValueAndValidity();
      this.registrationForm.get('cardIdImageAfter')?.updateValueAndValidity();
      this.registrationForm.get('address')?.updateValueAndValidity();
    }
    // Update the form control validation status


  }

  initForm() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
    });
    this.registrationForm = this.fb.group(
      {
        fullname: [
          '',
          {
            validators: Validators.compose([
              Validators.required,
              Validators.maxLength(50),
            ]),
            updateOn: 'blur'
          }
        ],
        email: [
          this.email != null ? this.email : '',
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/),
            Validators.maxLength(320),
            Validators.pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|((?!-)[a-zA-Z0-9\-]+(\.[a-zA-Z]{2,})))$/)
          ]),
        ],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/),
          ]),
        ],
        cPassword: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
          ]),
        ],
        typeAcc: ['1', [Validators.required]],
        cardId: [''],
        address: [
          '',
          Validators.compose([
            Validators.maxLength(255),
          ]),
        ],
        phoneNumber: [
          '',
          Validators.compose(
            [
              Validators.required,
              Validators.pattern(/^0\d{9,10}$/),
            ]
          )
        ],
        website: [
          '',
          Validators.compose([
            Validators.required,
            Validators.maxLength(255),
          ]),
        ],
        cardIdImageBefore: [
          null,
          Validators.compose([
            Validators.required,
          ]),
        ], // Custom validation for file input
        cardIdImageAfter: [
          null,
          Validators.compose([
            Validators.required,
          ]),
        ],
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      },
    );

    Object.keys(this.registrationForm.controls).forEach(key => {
      this.registrationForm.controls[key].markAsPristine();
      this.registrationForm.controls[key].markAsUntouched();
      this.registrationForm.controls[key].updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  


  trimValue(field: string) {
    const control = this.registrationForm.get(field);
    if (control && control.value) {
      control.setValue(control.value.trim());
    }
  }



  showNotification(serverity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: `${serverity}`, summary: `${summary}`, detail: `${detail}`, life: lifetime });
  }

  submit() {
    this.hasError = false;
    const result: {
      [key: string]: string;
    } = {};
    Object.keys(this.f).forEach((key) => {
      result[key] = this.f[key].value;
    });
    const newUser = new RegisterRequest();
    //newUser.username = "emailDefaal";
    //newUser.fullName = result['fullname'];
    newUser.full_name = result['fullname'];
    newUser.password = result['password'];
    newUser.email = result['email'];
    if (this.isProviderChecked) {
      newUser.group_id = 2

      const registrationSubscr = this.authService
        .registration(newUser)
        .pipe(first())
        .subscribe((user: any) => {
          if (user) {
            if (this.isProviderChecked) {
              const token = <string>localStorage.getItem('v8.2.3-auth-token');
              const formAddInfo = new FormAddUser();
              formAddInfo.kind = Number.parseInt(result['typeAcc'], 10);
              formAddInfo.cardId = result['cardId'];
              formAddInfo.phone = result['phoneNumber'];
              formAddInfo.website = result['website'];
              this.addInfo(user.uid, formAddInfo, token);
              try {
                this.uploadImage(user.uid, this.fileBefore, 'front_id', token)
                this.uploadImage(user.uid, this.fileAfter, 'back_id', token)
              } catch (error) {
                console.log(error);
              }

            }
            this.showNotification('success', 'Đăng ký thành công', 'Vui lòng nhập OTP gửi về mail để kích hoạt tài khoản', 3000)
            this.authService.setEmail(newUser.email);
            this.authService.setServiceType('OTP_ACTIVE_ACCOUNT');
            this.router.navigate(['/auth/verify-otp'])
          } else {
            this.hasError = true;
          }
        }, error => {
          console.log('error: ', error)
        });
      this.unsubscribe.push(registrationSubscr);

    } else {
      newUser.group_id = 1

      this.authHttpService.doRegister(newUser).subscribe(
        (resp) => {
          if(resp.code === "200"){
            this.showNotification('success', 'Đăng ký thành công', 'Vui lòng nhập OTP gửi về mail để kích hoạt tài khoản', 3000)
            this.authService.setEmail(newUser.email);
            this.authService.setServiceType('OTP_ACTIVE_ACCOUNT');
            this.router.navigate(['/auth/verify-otp'])
          }else{
            this.showNotification('error', 'Đăng ký không thành công', resp.desc, 3000)
          }
        },error => {
          console.log(error);
        }
      );


    }



    //
    // this.authService.setEmail(newUser['email']);
    //
    // console.log("email regis: ", newUser['email']);
    //
    // const payload = {
    //   email: newUser['email'],
    //   service: "OTP_ACTIVE_ACCOUNT"
    // }
    // this.authService.sendOTP(payload).subscribe({
    //   next: (res) => {
    //     console.log("send success: ", res);
    //     this.authService.setServiceType('OTP_ACTIVE_ACCOUNT');
    //     this.showNotification();
    //
    //     setTimeout(() => {
    //       this.router.navigate(['/auth/verify-otp'])
    //     }, 2000);
    //   },
    //   error: (err) => {
    //     console.log("error: ", err.message);
    //   }
    // })
    //

    // newUser.phone = result['phone'];


  }

  addInfo(customerId: number, formAddUser: FormAddUser, token: string) {
    this.userService.addInfo(customerId, formAddUser, token).subscribe((result: any) => {
      console.log(result);
    })
  }

  uploadImage(customerId: number, image: File, imageKey: string, token: string) {
    this.userService.uploadImage(image, imageKey, customerId, token).subscribe((result: any) => {
      console.log(result);
    })
  }

  registerProvider(token: string) {
    this.userService.registerProvider(token).subscribe((result: any) => {
      console.log(result);
    })
  }


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  trimInput(inputName: string) {
    let emailControl = this.registrationForm.get(inputName);
    if (emailControl) {
      let trimmedEmail = emailControl.value?.trim();
      emailControl.setValue(trimmedEmail, { emitEvent: false });
    }
  }

}
