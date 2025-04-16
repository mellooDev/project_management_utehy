import {Component, OnInit} from '@angular/core';
import {
  PaymentApproveStatus,
  UserContractDTO,
  UserDTO,
  UserManagementService
} from "../../../services/user-management.service";
import {MatDialog} from "@angular/material/dialog";
import {UserPostpaidDetailComponent} from "../user-postpaid-detail/user-postpaid-detail.component";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-user-postpaid',
  templateUrl: './user-postpaid.component.html',
  styleUrl: './user-postpaid.component.scss'
})
export class UserPostpaidComponent implements OnInit {
  searchTerm: string = '';
  userDTOS: UserContractDTO[] = [];
  currentPage: number = 1; // Current page
  pageSize: number = 10; // Number of records per page
  totalRecords: number = 0; // Total number of records

  constructor(private userManagementService: UserManagementService,
              private dialog: MatDialog, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    console.log("ngOnInit")
    this.doSearch("")
  }


  doSearch(filter: string) {
    this.userManagementService.searchPostpaid(filter, this.currentPage, this.pageSize).subscribe((data: any) => {
      if (data.code == 200) {
        this.userDTOS = data.data;
        this.totalRecords = data.recordsTotal;
        if (this.userDTOS.length == 0) {
          this.toastr.success('Không tìm thấy tài khoản người dùng', 'Thông báo', {timeOut: 5000});
        }
      }
    });
  }

  onSearch() {
    console.log("onSearch", this.searchTerm)
    this.doSearch(this.searchTerm);
  }

  onPageChange(page: number) {
    console.log("onPageChange", page)
    this.currentPage = page;
    this.doSearch(this.searchTerm);
  }

  openReview(user: UserContractDTO) {
    console.log("openReview", user)
    const dialogRef  =  this.dialog.open(UserPostpaidDetailComponent, {
      width: '1200px',
      data: {
        user: user
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.doSearch(this.searchTerm);
    });
  }

  protected readonly PaymentApproveStatus = PaymentApproveStatus;
}
