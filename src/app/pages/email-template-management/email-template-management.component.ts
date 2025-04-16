import { Component, OnInit, TemplateRef } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { TemplateDTO, TemplateListReq } from 'src/app/models/emil-template';
import { AuthHTTPService } from 'src/app/modules/auth/services/auth-http';
import { EmailTemplateService } from 'src/app/services/email-template.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser'

@Component({
  selector: 'app-email-template-management',
  templateUrl: './email-template-management.component.html',
  styleUrl: './email-template-management.component.scss',
  providers: [MessageService, NgbActiveModal],
})
export class EmailTemplateManagementComponent implements OnInit {

  token: string;
  owner: string;
  profile: any;
  sanitizedContent: SafeHtml;
  recordsTotal: number = 0;
  currentPage: number = 1;
  pageSize: number = 8;
  searchTerm: string = '';
  messageEmailError: {
    emailSendTest: '' | 'Vui lòng nhập email' | 'Email không đúng định dạng',
  } = {
    emailSendTest: ''
  };
  messageError = {
    emailTemplateName: '',
    emailSubject: '',
    emailContent: '',
    emailDescription: '',
    emailTemplateCode: '',
  }
  // templateName: string = '';
  // templateSubject: string = '';
  // templateContent: string = '';
  isTemplateNameInvalid: boolean = true;
  isTemplateSubjectInvalid: boolean = true;
  isTemplateContentInvalid: boolean = true;
  isTemplateDescriptionInvalid: boolean = true;
  isTemplateCodeInvalid: boolean = true;
  isEmailSendTestInvalid: boolean = true;
  isEditMode: boolean = false;
  selectedTemplateId: any;
  isLoading: boolean = false;
  htmlEmailContent: string = '';
  emailSubject: string = '';
  emailContent: string = '';
  emailTemplateName: string = '';
  emailTemplateCode: string = '';
  emailDescription: string = '';
  emailSendTest: string = '';
  childModalRef: NgbModalRef | null = null;
  templateList: TemplateDTO[] = [];
  editorConfig: AngularEditorConfig = {
    sanitize: false,
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '14rem',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'no',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };
  emailTemplatesCodes = [
    { code: 'OTP_ACTIVE_ACCOUNT', name: 'Email kích hoạt tài khoản' },
    { code: 'OTP_RESET_PASSWORD', name: 'Email đổi mật khẩu' },
    { code: 'PAYMENT_SUCCESSFULLY', name: 'Email thanh toán thành công' },
    { code: 'PAYMENT_FAILED', name: 'Email thanh toán thất bại' },
    { code: 'RENEWAL_SUBSCRIPTION', name: 'Email thông báo gia hạn Subcription' },
    { code: 'REQUEST_APPROVAL', name: 'Email yêu cầu phê duyệt' },
    { code: 'APPROVED_SUCCESSFULLY', name: 'Email phê duyệt thành công' },
    { code: 'REFUSE_APPROVAL', name: 'Email từ chối phê duyệt' },
    { code: 'RECONCILIATION_STATISTIC', name: 'Email đối soát' },
    { code: 'LOCK_USER', name: 'Email khóa tài khoản' },
    { code: 'UNLOCK_USER', name: 'Email mở khóa tài khoản' },
    { code: 'EXPIRE_WAREHOUSE', name: 'Email thông báo warehouse sắp hết hạn' },
    { code: 'EXPIRED_WAREHOUSE', name: 'Email thông báo warehouse đã hết hạn' },
    { code: 'WAREHOUSE_PAYMENT_SUCCESS', name: 'Email thanh toán warehouse thành công' },
    { code: 'EXTEND_PACKAGE_PAYMENT_SUCCESS', name: 'Email gia hạn gói cước thành công' },


  ]
  selectedTemplateCode: string = '';
  constructor(private modalService: NgbModal, private emailTemplateService: EmailTemplateService, private messageService: MessageService, private sanitizer: DomSanitizer, public activeModal: NgbActiveModal, private emailService: EmailTemplateService) {
      // this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.emailContent);
   }

  ngOnInit(): void {
    this.onLoadListTemplate();
  }

  onEmailSendInputChange(
    field: | 'emailSendTest'
  ) {
    if (field === 'emailSendTest') {
      const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

      this.emailSendTest = this.emailSendTest?.trim() || '';

      const invalidEmail =
        !this.emailSendTest || !emailPattern.test(this.emailSendTest);

      this.isEmailSendTestInvalid = invalidEmail;

      this.messageEmailError.emailSendTest = invalidEmail
        ? this.emailSendTest.length === 0
          ? 'Vui lòng nhập email'
          : 'Email không đúng định dạng'
        : '';
    }
  }

  onInputChange(
    field:
      | 'emailTemplateName'
      | 'emailSubject'
      | 'emailContent'
      | 'emailDescription'
      | 'emailTemplateCode'
  ) {
    this.logPreview();
    if(field === 'emailTemplateName') {
      this.isTemplateNameInvalid = !this.emailTemplateName || this.emailTemplateName.trim().length === 0;
      this.messageError.emailTemplateName = this.isTemplateNameInvalid ? 'Vui lòng nhập tên template' : '';
    }

    if(field === 'emailSubject') {
      this.isTemplateSubjectInvalid = !this.emailSubject || this.emailSubject.trim().length === 0;
      this.messageError.emailSubject = this.isTemplateSubjectInvalid ? 'Vui lòng nhập tiêu đề template' : '';
    }

    if(field === 'emailContent') {
      this.isTemplateContentInvalid = !this.emailContent || this.emailContent.trim().length === 0;
      this.messageError.emailContent = this.isTemplateContentInvalid ? 'Vui lòng nhập nội dung template' : '';
    }

    if(field === 'emailDescription') {
      this.isTemplateDescriptionInvalid = !this.emailDescription || this.emailDescription.trim().length === 0;
      this.messageError.emailDescription = this.isTemplateDescriptionInvalid ? 'Vui lòng nhập mô tả template' : '';
    }

    if(field === 'emailTemplateCode') {
      this.isTemplateCodeInvalid = !this.emailTemplateCode || this.emailTemplateCode.trim().length === 0;
      this.messageError.emailTemplateCode = this.isTemplateCodeInvalid ? 'Vui lòng nhập code template' : '';
    }
  }

  onSearch() {
    const searchTermFormat = this.searchTerm.trim().replace(/\s+/g, '_').toUpperCase();
    if (searchTermFormat) {
      this.emailTemplateService.getByCode(this.searchTerm).subscribe({
        next: (res) => {
          if (res && res.data) {
            this.templateList = [res?.data] ;
          } else {
            this.templateList = []
          }

        },
        error: (err) => {
          console.error('error: ', err)
          this.templateList = [];
        }
      })
    }
    else {
      this.onLoadListTemplate();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.onLoadListTemplate();
  }

  open(content: TemplateRef<any>, id?: number) {

    if(id) {
      this.isEditMode = true;
      this.selectedTemplateId = id;
      this.emailTemplateService.getById(id).subscribe({
        next: (res) => {
          console.log("Get template by id: ", res.data);
          this.emailSubject = res.data?.title || '';
          this.emailContent = res.data?.templateContent || '';
          this.emailTemplateName = res.data?.name || '';
          this.selectedTemplateCode = res.data?.code || '';
          this.emailDescription = res.data?.description || '';
        },
        error: (err) => {
          console.log("error: ", err.message);
        }
      })
    } else {
      this.isEditMode = false;
      this.resetForm();
    }

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'my-class',
    })
  }

  openModalSendEmail(content: TemplateRef<any>) {
    this.resetEmailTestForm();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    })
  }

  logPreview() {

    // const parser = new DOMParser();
    // const decodeContent = parser.parseFromString(this.emailContent, 'text/html').body.innerHTML;


    console.log("Tiêu đề: ", this.emailSubject);
    console.log("Nội dung: ", this.emailContent);

  }

  onSubmitSendTest() {

    this.onEmailSendInputChange('emailSendTest');
    if(this.isEmailSendTestInvalid) {
      return;
    } else {
      const payload = {
        title: this.emailSubject,
        content: this.emailContent,
        receiverMailAddress: this.emailSendTest,
        templateCode: this.emailTemplateCode,
      }
      console.log('payload test: ', payload);

      this.emailService.sendTestEmail(payload).subscribe({
        next: (res) => {
          console.log("send test success: ", res);
          this.showNotification('success', 'Thông báo', 'Gửi giả lập thành công. Vui lòng kiểm tra hòm thư của bạn', 3000)
        }
      })

    }

  }

  closeModal() {
    this.modalService.dismissAll();
  }

  closeModal1() {
    this.activeModal.dismiss('click');
  }

  resetForm(): void {
    this.emailSubject = '';
    this.emailContent = '';
    this.emailDescription = '';
    this.emailTemplateName = '';
    this.emailTemplateCode = '';
    this.selectedTemplateId = null;
  }

  resetEmailTestForm(): void {
    this.emailSendTest = '';
  }

  onCreateTemplate() {
    this.onInputChange('emailTemplateName');
    this.onInputChange('emailSubject');
    this.onInputChange('emailContent');
    this.onInputChange('emailDescription');
    // this.onInputChange('emailTemplateCode');
    if (
      this.isTemplateNameInvalid ||
      this.isTemplateSubjectInvalid ||
      this.isTemplateContentInvalid ||
      // this.isTemplateCodeInvalid ||
      this.isTemplateDescriptionInvalid
    ) {
      return;
    } else {
      this.isLoading = true;
      const templateReq = {
        code: this.selectedTemplateCode,
        name: this.emailTemplateName,
        templateContent: this.emailContent,
        title: this.emailSubject,
        description: this.emailDescription
      }

      if(this.isEditMode && this.selectedTemplateId) {
        this.emailTemplateService.update(this.selectedTemplateId, templateReq).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.showNotification('success', 'Thông báo', 'Cập nhật template thành công', 3000);
            setTimeout(() => {
              this.onLoadListTemplate();
              this.closeModal();
            }, 1500);
          },
          error: (err) => {
            console.error('error: ', err.message);
            this.isLoading = false;
            this.showNotification('error', 'Lỗi', 'Không thể cập nhật template', 3000);
          }
        })
      }
      else {

        this.emailTemplateService.create(templateReq).subscribe({
          next: (res) => {
            console.log("success", res.data);
            this.isLoading = false;
            this.showNotification('success', 'Thông báo', 'Thêm template thành công', 2000);
            // this.onLoadListTemplate();
            setTimeout(() => {
              this.onLoadListTemplate();
              this.closeModal();
            }, 2000);
          },
          error: (err) => {
            console.log("error: ", err.message);
            this.isLoading = false;
            this.showNotification('error', 'Lỗi', 'Không thể thêm template', 3000);
          }
        })
      }
    }

  }

  showNotification(severity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: lifetime })
  }

  onLoadListTemplate() {
    const listReq: TemplateListReq = {
      currentPage: this.currentPage,
      perPage: this.pageSize,
      filter: '',
      sortBy: '',
      sortDesc: false,
    }
    this.emailTemplateService.getList(listReq).subscribe({
      next: (res) => {
        this.templateList = res.data || [];
        this.recordsTotal = res.recordsTotal
      },
      error: (err) => {
        console.log("error: ", err.message);

      }
    })
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.onLoadListTemplate();
  }

  onOpenModalDelete(content: TemplateRef<any>, id?: number) {
    this.selectedTemplateId = id;
    console.log("selected id: ", this.selectedTemplateId);

    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    })

  }

  onDeleteTemplate() {
    this.isLoading = true;
    this.emailTemplateService.delete(this.selectedTemplateId).subscribe({
      next: (res) => {
        console.log("success", res);
        this.isLoading = false;
        this.showNotification('success', 'Thông báo', 'Xóa template thành công', 2000);

        setTimeout(() => {
          this.onLoadListTemplate();
          this.closeModal();
        }, 2000);
      },
      error: (err) => {
        console.log("error: ", err.message);
        this.isLoading = false;
        this.showNotification('error', 'Lỗi', 'Không thể xóa template', 3000);
      }
    })
  }
}
