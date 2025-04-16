import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PaymentApproveStatus, UserContractDTO, UserManagementService} from "../../../services/user-management.service";
import {formatDate} from "@angular/common";
import Swal from "sweetalert2";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-user-postpaid-detail',
  templateUrl: './user-postpaid-detail.component.html',
  styleUrl: './user-postpaid-detail.component.scss'
})
export class UserPostpaidDetailComponent implements OnInit {

  user: UserContractDTO;

  fileName: string;
  userForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<UserPostpaidDetailComponent>,
              private toastr: ToastrService, private userManagementService: UserManagementService) {
    this.user = this.data.user;
    console.log("UserPostpaidDetailComponent", this.user)

  }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      "customer-name": new FormControl(),
      "email": new FormControl(),
      "contract-number": new FormControl(),
      "start-date": new FormControl(),
      "end-date": new FormControl(),
      "customer-id": new FormControl(),
      "phone": new FormControl(),
      // "file": new FormControl(),
      "content": new FormControl('', {nonNullable: false}),
    })

    this.userForm.setValue({
      "customer-name": this.user.full_name,
      "email": this.user.email,
      "contract-number": this.user.contract_number,
      "start-date": formatDate(this.user.start_date, 'dd/MM/yyyy', 'en'),
      "end-date": formatDate(this.user.end_date, 'dd/MM/yyyy', 'en'),
      "customer-id": this.user.customer_id,
      "phone": this.user.phone,
      // "file": "1234",
      content: this.user.content
    })

    this.userManagementService.getDetailFile(this.user.file_key).subscribe((data: any) => {
      console.log("getDetailFile", data)
      // this.userForm.patchValue({"file": data.fileName})
      this.fileName = data.fileName;
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  submit() {

  }

  approve() {
    Swal.fire({
      title: "Xác nhận đồng ý phê duyệt",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      icon: "question",
      confirmButtonColor: "#1B84FF",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          let result = await this.userManagementService.approve(this.user.customer_id, PaymentApproveStatus.APPROVED, "").toPromise()
          console.log(result)
          return result;
        } catch (error) {
          Swal.showValidationMessage(`
            Phê duyệt thât bại: ${error}
          `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialogRef.close();
        this.toastr.success("Phê duyệt thành công");
      }
    });
  }

  reject() {
    Swal.fire({
      title: "Xác nhận từ chối phê duyệt",
      input: "textarea",
      html: '<label for="my-input">Lý do từ chối<span style="color:red">*</span></label>',
      inputPlaceholder: "Lý do từ chối",
      inputAttributes: {
        "aria-label": "Type your message here",
        "maxlength": "500",
        "id": "my-input"
      },
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Đóng",
      icon: "question",
      confirmButtonColor: "#1B84FF",
      showLoaderOnConfirm: true,
      inputValidator: (inputValue) => {
        if (!inputValue) {
          return "Lý do từ chối không được để trống";
        }
        return null;
      },
      preConfirm: async (reason) => {
        try {
          let result = await this.userManagementService.approve(this.user.customer_id, PaymentApproveStatus.REJECTED, reason).toPromise()
          console.log(result)
          return result;
        } catch (error) {
          Swal.showValidationMessage(`
            Phê duyệt thât bại: ${error}
          `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialogRef.close();
        this.toastr.success("Từ chối thành công");
      }
    });
  }

  downloadFile() {
    this.userManagementService.downloadFile(this.user.file_key).subscribe((data: any) => {
      console.log("downloadFile", data)
      const link = document.createElement('a');
      link.href = data.download_link;
      link.setAttribute('download', this.fileName);
      document.body.appendChild(link);
      link.click();
    });
  }

  protected readonly PaymentApproveStatus = PaymentApproveStatus;
}


