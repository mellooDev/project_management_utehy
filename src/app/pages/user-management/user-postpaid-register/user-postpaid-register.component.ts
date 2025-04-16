import {Component, Inject, inject, Input, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {
  NgbActiveModal,
  NgbCalendar,
  NgbDate,
  NgbDateParserFormatter,
  NgbInputDatepicker
} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  fileExtensionValidator,
  fileSizeValidator
} from "../../../utils/validator-helper.directive";
import {UserManagementService} from "../../../services/user-management.service";
import {of} from "rxjs";
import {filter, switchMap} from "rxjs/operators";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-user-postpaid-register',
  templateUrl: './user-postpaid-register.component.html',
  styleUrl: './user-postpaid-register.component.scss'
})
export class UserPostpaidRegisterComponent implements OnInit {
  formGroupRegisterPostpaid: FormGroup;
  attachFiles: File;
  isLoading = false;
  calendar = inject(NgbCalendar);
  formatter = inject(NgbDateParserFormatter);

  @Input() customerId: number;

  constructor(private fb: FormBuilder,
              private userMngtService: UserManagementService,
              private toastr: ToastrService, public activeModal: NgbActiveModal) {
  }

  onFileRegisterSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.attachFiles = input.files[0]
      console.log('file selected: ', this.attachFiles)
    }
  }

  ngOnInit(): void {
    this.formGroupRegisterPostpaid = this.fb.group({
      fileInput: [null, [fileExtensionValidator("jpg, jpeg, png, pdf"), fileSizeValidator(2)]],
      content: [null, [Validators.maxLength(255)]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      contractNumber: [null, [Validators.required]],
    }, {validator: this.dateLessThan('startDate', 'endDate')});

    this.formGroupRegisterPostpaid.controls['startDate'].valueChanges.subscribe(() => {
      this.formGroupRegisterPostpaid.updateValueAndValidity();
    });

    this.formGroupRegisterPostpaid.controls['endDate'].valueChanges.subscribe(() => {
      this.formGroupRegisterPostpaid.updateValueAndValidity();
    });
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): { [key: string]: any } | null => {
      const f = group.controls[from];
      const t = group.controls[to];
      if (f.value && t.value) {
        const fromDate = new Date(f.value.year, f.value.month - 1, f.value.day);
        const toDate = new Date(t.value.year, t.value.month - 1, t.value.day);
        if (fromDate > toDate) {
          return {
            endDateBeforeStartDate: true
          };
        }
      }
      return null;
    };
  }

  onRegisterPostpaid() {
    console.log('onRegisterPostpaid')
    this.formGroupRegisterPostpaid.markAllAsTouched();

    let startDate = this.formatDate(this.formGroupRegisterPostpaid.controls['startDate'].value);
    let endDate = this.formatDate(this.formGroupRegisterPostpaid.controls['endDate'].value);
    const req = {
      customer_id: this.customerId,
      content: this.formGroupRegisterPostpaid.controls['content'].value,
      contract_number: this.formGroupRegisterPostpaid.controls['contractNumber'].value,
      file_key: null,
      start_date: startDate,
      end_date: endDate
    }


    if (this.attachFiles) {
      this.userMngtService.uploadAttachFile(this.attachFiles).subscribe((res) => {
        req.file_key = res.id;
        this.registerPostpaid(req);
      }, (error) => {
        console.log('uploadAttachFile error', error)
        this.toastr.error('Có lỗi xảy ra', 'Thông báo', {timeOut: 3000});
      })
    } else {
      this.registerPostpaid(req)
    }
  }

  registerPostpaid(req: any) {
    this.userMngtService.registerPostPaid(req).subscribe((data) => {
      console.log('registerPostPaid', data)
      this.toastr.success('Thông tin đã được gửi đến quản trị viên. Vui lòng chờ phê duyệt', 'Thông báo', {timeOut: 5000});
      this.activeModal.close("success");
    }, (error) => {
      console.log('registerPostPaid error', error)
      let message = "Có lỗi xảy ra";
      if (error.error && error.error.code) {
        switch (error.error.code) {
          case "100": {
            message = error.error.desc
            this.formGroupRegisterPostpaid.controls['contractNumber'].setErrors({contractNumberExist: true});
          }
        }
      }
      this.toastr.error(message, 'Thông báo', {timeOut: 3000});
    })
  }

  formatDate = (date: { year: number, month: number, day: number }): string => {
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  }

  closeModal() {
    this.activeModal.close();
  }


}
