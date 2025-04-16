import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ModalComponent, ModalConfig} from '../../_metronic/partials';
import {BuyService} from '../../services/buy.service';
import {ChangeDetectorRef} from '@angular/core';
import {AuthService} from 'src/app/modules/auth/services/auth.service';
import {MessageService} from 'primeng/api';
import {
  IPasswordUpdateModel,
  IProfileDetail,
  UserService,
} from 'src/app/services/user.service';
import {AuthHTTPService} from 'src/app/modules/auth/services/auth-http';
import {NgbDateStruct, NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Template} from 'webpack';
import {UserManagementService} from 'src/app/services/user-management.service';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {fileExtensionValidator, fileSizeValidator} from "../../utils/validator-helper.directive";
import {UserPostpaidDetailComponent} from "../user-management/user-postpaid-detail/user-postpaid-detail.component";
import {
  UserPostpaidRegisterComponent
} from "../user-management/user-postpaid-register/user-postpaid-register.component";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [MessageService, DatePipe],
})
export class ProfileComponent implements OnInit {
  imageFiles: { [key: string]: File | null } = {
    avatar: null,
    front_id: null,
    back_id: null,
  };

  activeTab: string = 'personal-info';

  loading: boolean = false; // Trạng thái loading
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  selectedInfo: string = 'general';
  newPassword: string = '';
  confirmPassword: string = '';
  newPasswordVisible: boolean = false;
  profileDetail: any;
  profile: any;
  customerId: number;
  isLogin: boolean;
  token: string;
  confirmPasswordVisible: boolean = false;
  currentPasswordVisible: boolean = false;
  uploadedImageUrl: string | null = null;

  isLoading: boolean = false;
  imageCardBack: any;
  imageCardFront: any;
  avatar: any;
  uploadedImageCardFrontUrl: string | null = null;
  uploadedImageCardBackUrl: string | null = null;

  message = {
    dataName: '',
    dataPhonenumber: '',
    dataTaxCode: '',
    dataEmail: '',
    dataIdCard: '',
    dataAddress: '',
    dataWebsite: '',
  };

  messageRegisterError = {
    contractNumber: '',
    startDate: '',
    endDate: '',
    content: '',
  }

  isContractNumberInvalid: boolean = true;
  isStartDateInvalid: boolean = true;
  isEndDateInvalid: boolean = true;
  isContentInvalid: boolean = false;

  contractNumber: number;
  attachFiles: File | null = null;
  startDate: any;
  endDate: any;
  content: string = ''

  isDataNameInvalid: boolean = true;
  isDataEmailInvalid: boolean = true;
  isDataPhonenumberInvalid: boolean = true;
  isDataTaxCodeInvalid: boolean = true;
  isIdCardInvalid: boolean = true;
  isCurrentPassInvalid: boolean = true;
  isNewPassInvalid: boolean = true;
  isConfirmPassInvalid: boolean = true;

  dataTaxCode: string = '';
  dataName: string = '';
  dataPhonenumber: string = '';
  dataEmail: string = '';
  dataIdCard: string = '';
  dataAddress: string = '';
  dataKind: number;
  dataWebsite: string = '';


  model: NgbDateStruct;

  currentInvalidField:
    | 'dataName'
    | 'dataTaxCode'
    | 'dataEmail'
    | 'dataPhonenumber'
    | 'dataAddress'
    | null = null;

  currentPassInvalidField:
    | 'currentPassword'
    | 'newPassword'
    | 'confirmPassword';

  currentPassword: string = '';

  // Đổi sang sử dụng biến thông báo
  errorMessages: { [key: string]: string } = {};
  successMessage: string = '';
  @ViewChild('modal') private modalComponent: ModalComponent;

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private userService: UserService,
    private userMngtService: UserManagementService,
    private modalService: NgbModal,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  user: any;

  ngOnInit(): void {
    try {
      this.authService.getUserByToken().subscribe((data) => {
        this.user = data;
        this.onLoadDetail(this.user.uid);
        // this.cdr.detectChanges();
      });
    } catch (error) {
      console.log('Ignore error on load');
    }
    this.route.queryParams.subscribe(params => {
      this.activeTab = params['tab'] || 'profile-info';
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([], {queryParams: {tab: tab}, queryParamsHandling: 'merge'});
  }

  showInfo(info: string) {
    this.selectedInfo = info;
  }

  deleteImage(): void {
    this.uploadedImageUrl = null;
    alert('Ảnh đã được xóa.');
  }

  onLoadDetail(id: number) {
    try {
      this.userService.getProfileUser(id).subscribe((res) => {
        this.profileDetail = res;
        this.dataName = this.profileDetail.account.full_name;
        this.dataEmail = this.profileDetail.account.email;
        this.dataPhonenumber = this.profileDetail.additionInfo?.phone;
        this.dataTaxCode = this.profileDetail.tax;
        this.dataIdCard = this.profileDetail.additionInfo?.cardId;
        this.customerId = this.profileDetail.account.customerId;
        this.dataKind = this.profileDetail.additionInfo?.kind;
        this.dataWebsite = this.profileDetail.additionInfo?.website;
        this.dataAddress = this.profileDetail.additionInfo?.address;
        this.dataKind = this.profileDetail.kind;

        console.log("profileDetail", this.profileDetail)

        this.imageCardBack = this.profileDetail.images.find(
          (image: any) => image.name === 'back_id'
        );
        // this.imageCardBack.image = this.convertToBase64(this.imageCardBack.image);
        if (
          this.imageCardBack?.image &&
          !this.imageCardBack.image.startsWith('data:image/')
        ) {
          this.imageCardBack.image = `data:image/jpeg;base64,${this.imageCardBack.image}`;
        }

        this.imageCardFront = this.profileDetail.images.find(
          (image: any) => image.name === 'front_id'
        );
        if (
          this.imageCardFront?.image &&
          !this.imageCardFront.image.startsWith('data:image/')
        ) {
          this.imageCardFront.image = `data:image/jpeg;base64,${this.imageCardFront.image}`;
        }

        this.avatar = this.profileDetail.images.find(
          (image: any) => image.name === 'avatar'
        );
        if (
          this.avatar?.image &&
          !this.avatar.image.startsWith('data:image/')
        ) {
          this.avatar.image = `data:image/jpeg;base64,${this.avatar.image}`;
        }
      });
    } catch (error) {
      console.log('Ignore error onGetDetails');
    }
  }

  onUploadClick(fileInput: HTMLInputElement): void {
    fileInput.click(); // Mở hộp thoại chọn file
  }

  onFileSelected(event: Event, isFront: boolean): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isFront) {
          this.uploadedImageCardFrontUrl = e.target.result; // Ảnh mặt trước
          this.imageFiles['front_id'] = file;
        } else {
          this.uploadedImageCardBackUrl = e.target.result; // Ảnh mặt sau
          this.imageFiles['back_id'] = file;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.uploadedImageUrl = e.target.result;
        this.imageFiles['avatar'] = file;
      };

      reader.readAsDataURL(file);
    }
  }

  modalReference: NgbModalRef;

  onCloseModal() {
    this.modalService.dismissAll();
  }

  onCloseModalDelete(): void {
    this.modalService.dismissAll();
  }

  onCloseModalRegisterPostpaid(): void {
    this.modalService.dismissAll();
  }

  onOpenModal(content: TemplateRef<any>) {
    if (this.validatePasswordFields()) {
      this.modalReference = this.modalService.open(content, {centered: true});
    }
  }

  // onOpenModalUpdate(content: TemplateRef<any>) {
  //   if(this.onI()) {
  //     this.modalReference = this.modalService.open(content, { centered: true });
  //   }
  // }

  openModalDeleteAvt(content: any): void {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', windowClass: 'my-class-1'});
  }

  onSubmitDeleteAvt(): void {
    console.log('Đã lưu thay đổi!');
    this.modalService.dismissAll();
  }

  deleteImageAvt(): void {
    console.log('Đã nhấn nút Xóa!');
  }

  openModalDeleteImgFront(content: any): void {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', windowClass: 'my-class-1'});
  }

  onSubmitDeleteImgFront(): void {
    console.log('Đã lưu thay đổi!');
    this.modalService.dismissAll();
  }

  deleteDeleteImgFront(): void {
    console.log('Đã nhấn nút Xóa!');
  }

  openModalDeleteImgBack(content: any): void {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', windowClass: 'my-class-1'});
  }

  onSubmitDeleteImgBack(): void {
    console.log('Đã lưu thay đổi!');
    this.modalService.dismissAll();
  }

  deleteDeleteImgBack(): void {
    console.log('Đã nhấn nút Xóa!');
  }

  showNotification(severity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({severity: severity, summary: summary, detail: detail, life: lifetime})
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Mật khẩu hiện tại không đúng',
      key: 'br',
      life: 3000,
    });
  }

  onInputChange(
    field:
      | 'dataName'
      | 'dataTaxCode'
      | 'dataEmail'
      | 'dataPhonenumber'
      | 'dataIdCard'
      | 'dataAddress'
      | 'dataWebsite'
  ) {
    if (field === 'dataName') {
      this.isDataNameInvalid =
        !this.dataName || this.dataName.trim().length === 0;

      this.message.dataName = this.isDataNameInvalid
        ? 'Vui lòng nhập họ tên'
        : '';
    }

    if (field === 'dataEmail') {
      const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

      this.dataEmail = this.dataEmail?.trim() || '';

      const invalidEmail =
        !this.dataEmail || !emailPattern.test(this.dataEmail);

      this.isDataEmailInvalid = invalidEmail;

      this.message.dataEmail = invalidEmail
        ? this.dataEmail.length === 0
          ? 'Vui lòng nhập email'
          : 'Email không đúng định dạng'
        : '';
    }

    if (field === 'dataTaxCode') {
      this.isDataTaxCodeInvalid =
        !this.dataTaxCode ||
        this.dataTaxCode.trim().length === 0 ||
        isNaN(Number(this.dataTaxCode));

      if (!this.dataTaxCode || this.dataTaxCode.trim().length === 0) {
        this.message.dataTaxCode = 'Vui lòng nhập mã số thuế';
      } else if (isNaN(Number(this.dataTaxCode))) {
        this.message.dataTaxCode = 'Mã số thuế phải là số';
      } else {
        const taxCode = this.dataTaxCode.trim();
        const taxCodeLength = taxCode.length;

        if (taxCodeLength === 10 || taxCodeLength === 13) {
          if (taxCodeLength === 13) {
            // Hiển thị mã số thuế theo định dạng "xxxxxxxxxxx-xxx"
            this.dataTaxCode = `${taxCode.slice(0, 10)}-${taxCode.slice(10)}`;
          }
          this.message.dataTaxCode = '';
        } else {
          this.message.dataTaxCode = 'Mã số thuế phải có 10 hoặc 13 chữ số';
        }
      }
    }

    if (field === 'dataIdCard') {
      this.isIdCardInvalid =
        !this.dataIdCard ||
        this.dataIdCard.trim().length === 0 ||
        isNaN(Number(this.dataIdCard)) ||
        this.dataIdCard.trim().length !== 12;

      if (!this.dataIdCard || this.dataIdCard.trim().length === 0) {
        this.message.dataIdCard = 'Vui lòng nhập số CMND/CCCD';
      } else if (isNaN(Number(this.dataIdCard))) {
        this.message.dataIdCard = 'Số CMND/CCCD phải là số';
      } else if (this.dataIdCard.trim().length !== 12) {
        this.message.dataIdCard = 'Số CMND/CCCD phải gồm 12 chữ số';
      } else {
        this.message.dataIdCard = '';
      }
    }

    if (field === 'dataPhonenumber') {
      const phonenumberPattern = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;

      this.dataPhonenumber = this.dataPhonenumber?.trim() || '';

      const invalidPhonenumber =
        !this.dataPhonenumber || !phonenumberPattern.test(this.dataPhonenumber);

      this.isDataPhonenumberInvalid = invalidPhonenumber;

      this.message.dataPhonenumber = invalidPhonenumber
        ? this.dataPhonenumber.length === 0
          ? 'Vui lòng nhập số điện thoại'
          : 'Số điện thoại không đúng định dạng'
        : '';
    }
  }

  openModalUpdate(content: TemplateRef<any>): void {
    this.onInputChange('dataName');
    this.onInputChange('dataEmail');
    this.onInputChange('dataPhonenumber');
    this.onInputChange('dataTaxCode');
    this.onInputChange('dataIdCard');
    if (
      this.isDataNameInvalid ||
      this.isDataEmailInvalid ||
      this.isDataTaxCodeInvalid ||
      this.isDataPhonenumberInvalid ||
      this.isIdCardInvalid
    ) {
      return;
    } else {
      this.modalService.open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: 'my-class-1',
      });
    }
  }

  onUpdateSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Thông báo',
      detail: 'Cập nhật dữ liệu thành công',
      key: 'br',
      life: 3000,
    });
  }

  onSubmit(): void {
    const profile: IProfileDetail = {
      address: this.dataAddress,
      // kind: this.dataKind,
      fullName: this.dataName,
      email: this.dataEmail,
      phone: this.dataPhonenumber,
      tax: this.dataTaxCode,
      cardId: this.dataIdCard,
      website: this.dataWebsite,
      // isPersonal: '' + this.dataKind,
    };


    this.userService
      .updateProfile(profile, this.customerId)
      .subscribe((res) => {
        this.onUpdateSuccess();
        this.uploadImages();
        this.onCloseModal();
      });
  }

  uploadImages() {
    const token = this.authService.getAuthFromLocalStorage();
    Object.keys(this.imageFiles).forEach((key) => {
      const file = this.imageFiles[key];
      if (file) {
        this.userService
          .uploadImage(file, key, this.customerId, token)
          .subscribe((res) => {
            console.log(res);
          });
      }
    });
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'newPassword') {
      this.newPasswordVisible = !this.newPasswordVisible;
    } else if (field === 'confirmPassword') {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    } else if (field === 'currentPassword') {
      this.currentPasswordVisible = !this.currentPasswordVisible;
    }
  }

  validatePasswordFields() {
    const passwordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;

    this.errorMessages = {};

    if (!this.currentPassword || this.currentPassword.trim().length === 0) {
      this.errorMessages.currentPassword =
        'Mật khẩu hiện tại không được để trống';
      return false;
    }

    if (!passwordPattern.test(this.newPassword.trim())) {
      this.errorMessages.newPassword =
        'Mật khẩu yêu cầu tối thiểu 8 ký tự, tối đa 20 ký tự. Mật khẩu phải bao gồm số, chữ hoa, chữ thường và ký tự đặc biệt.';
      return false;
    }

    if (this.newPassword.trim() !== this.confirmPassword.trim()) {
      this.errorMessages.confirmPassword = 'Mật khẩu xác nhận không khớp';
      return false;
    }
    return true;
  }

  onChangePassword(): void {
    if (!this.validatePasswordFields()) {
      return;
    } else {
      const passwordData: IPasswordUpdateModel = {
        password: this.currentPassword.trim(),
        new_password: this.newPassword.trim(),
        retype_password: this.confirmPassword.trim(),
      };

      this.userService.changePassword(passwordData).subscribe({
        next: (res) => {
          this.showNotification('success', 'Đổi mật khẩu thành công', 'Đang điều hướng đến trang đăng nhập', 3000);
          this.tokenStorage.signOut();
          setTimeout(() => {
            window.location.href = 'auth/login';
          }, 2000);
        },
        error: (err) => {
          // Log ra error status code
          this.showError();
          this.onCloseModal();
        },
      });
    }
  }

  onPasswordChange(field: string): void {
    if (field === 'currentPassword' && this.currentPassword.trim()) {
      this.errorMessages.currentPassword = '';
    }
    if (
      field === 'newPassword' &&
      this.newPassword.trim() === this.newPassword.trim()
    ) {
      this.errorMessages.newPassword = '';
    }
    if (
      field === 'confirmPassword' &&
      this.confirmPassword.trim() === this.confirmPassword.trim()
    ) {
      this.errorMessages.confirmPassword = '';
    }
  }

  onFileRegisterSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachFiles = input.files[0]
      console.log('file selected: ', this.attachFiles)

    }
  }


  openModalRegisterPostpaid() {
    const modalRef = this.modalService.open(UserPostpaidRegisterComponent, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'my-class',
    })
    modalRef.componentInstance.customerId = this.customerId;

    modalRef.result.then((result) => {
      console.log('result: ', result)
      if (result === 'success') {
        this.profileDetail.account.payment_approve_status = 'PENDING';
      }
    }, (reason) => {
      console.log('reason: ', reason)
    })
  }

  onInputRegisterChange(
    field: 'contractNumber' | 'startDate' | 'endDate' | 'content'
  ) {
    if (field === 'contractNumber') {
      this.isContractNumberInvalid = !this.contractNumber || this.contractNumber.toString().trim().length === 0 || isNaN(Number(this.contractNumber));
      if (!this.contractNumber || this.contractNumber.toString().trim().length === 0) {
        this.messageRegisterError.contractNumber = 'Vui lòng nhập số hợp đồng';
      } else if (isNaN(Number(this.contractNumber))) {
        this.messageRegisterError.contractNumber = 'Số hợp đồng phải là chữ số';
      } else {
        this.messageRegisterError.contractNumber = '';
      }
    }

    if (field === 'startDate') {
      this.isStartDateInvalid = !this.startDate || !this.startDate.year || !this.startDate.month || !this.startDate.day;
      this.messageRegisterError.startDate = this.isStartDateInvalid ? 'Vui lòng nhập ngày bắt đầu' : '';

      if (this.startDate && this.endDate) {
        const startDateObj = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day); // tháng bắt đầu từ 0
        const endDateObj = new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day);
        if (startDateObj > endDateObj) {
          this.isStartDateInvalid = true;
          this.messageRegisterError.startDate = 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc';
        }
      }
    }

    if (field === 'endDate') {
      this.isEndDateInvalid = !this.endDate || !this.endDate.year || !this.endDate.month || !this.endDate.day;
      this.messageRegisterError.endDate = this.isEndDateInvalid ? 'Vui lòng nhập ngày kết thúc' : '';

      if (this.startDate && this.endDate) {
        const startDateObj = new Date(this.startDate.year, this.startDate.month - 1, this.startDate.day);
        const endDateObj = new Date(this.endDate.year, this.endDate.month - 1, this.endDate.day);
        if (endDateObj < startDateObj) {
          this.isEndDateInvalid = true;
          this.messageRegisterError.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
        }
      }
    }

    // if (field === 'content') {
    //   this.content = this.formGroupRegisterPostpaid.controls.content.value || ''
    //   this.isContentInvalid = !this.content || this.content.trim().length > 255;
    //   this.messageRegisterError.content = this.isContentInvalid
    //     ? 'Nội dung không được vượt quá 255 ký tự'
    //     : '';
    // }
  }


  onRegisterPostpaid() {
    const formatDate = (date: { year: number, month: number, day: number }): string => {
      return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    }

    this.onInputRegisterChange('contractNumber');
    this.onInputRegisterChange('startDate');
    this.onInputRegisterChange('endDate');
    this.onInputRegisterChange('content');
    if (
      this.isContractNumberInvalid ||
      this.isStartDateInvalid ||
      this.isEndDateInvalid ||
      this.isContentInvalid
    ) {
      return;
    } else {
      this.isLoading = true;
      if (this.attachFiles) {
        this.userMngtService.uploadAttachFile(this.attachFiles).subscribe({
          next: (res) => {
            const fileName = res?.fileName || this.attachFiles!.name;
            const fileKey = res?.id;

            const req = {
              customer_id: this.customerId,
              content: this.content,
              contract_number: this.contractNumber,
              file_key: fileKey,
              start_date: this.startDate ? formatDate(this.startDate) : null,
              end_date: this.endDate ? formatDate(this.endDate) : null
            }

            console.log('req: ', req)

            this.userMngtService.registerPostPaid(req).subscribe({
              next: (res) => {
                console.log('res: ', res);
                this.isLoading = false;
                this.showNotification('success', 'Thông báo', 'Thông tin đã được gửi đến quản trị viên. Vui lòng chờ phê duyệt', 3000);
                this.onCloseModalRegisterPostpaid();

                // setTimeout(() => {
                // }, 3000);
              },
              error: (err) => {
                console.log(err)
                this.isLoading = false;
                this.showNotification('error', 'Thông báo', 'Có lỗi xảy ra', 3000);
                this.onCloseModalRegisterPostpaid();

              }
            })
          },
          error: (err) => {
            console.error('error: ', err)
          }
        })
      } else {
        const req = {
          customer_id: this.customerId,
          content: this.content,
          contract_number: this.contractNumber,
          file_key: null,
          start_date: this.startDate ? formatDate(this.startDate) : null,
          end_date: this.endDate ? formatDate(this.endDate) : null
        }

        console.log('req: ', req)

        this.userMngtService.registerPostPaid(req).subscribe({
          next: (res) => {
            this.showNotification('success', 'Thông báo', 'Thông tin đã được gửi đến quản trị viên. Vui lòng chờ phê duyệt', 3000);
            console.log('res: ', res);
            this.isLoading = false;
            this.onCloseModalRegisterPostpaid();
            this.profileDetail.account.payment_approve_status = 'PENDING';
          },
          error: (err) => {
            console.log(err)
            this.showNotification('error', 'Thông báo', 'Có lỗi xảy ra', 3000);
            this.isLoading = false;
          }
        })
      }
    }
  }
}
