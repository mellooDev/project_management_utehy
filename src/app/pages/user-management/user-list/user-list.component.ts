import {Component, OnInit} from '@angular/core';
import {LockUserRequest, UserDTO, UserManagementService} from "../../../services/user-management.service";
import {MatDialog} from "@angular/material/dialog";
import {LockUserDialogComponent} from "../lock-user-dialog/lock-user-dialog.component";
import {UnlockUserDialogComponent} from "../unloc-user-dialog/unlock-user-dialog.component";
import {data} from "jquery";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  searchTerm: string = '';
  userDTOS: UserDTO[] = [];
  currentPage: number = 1; // Current page
  pageSize: number = 10; // Number of records per page
  totalRecords: number = 0; // Total number of records

  constructor(
    private userManagementService: UserManagementService,
    private messageService: MessageService,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    console.log("ngOnInit")
    this.doSearch("")
  }


  doSearch(filter: string) {
    this.userManagementService.getUsers(filter, this.currentPage, this.pageSize).subscribe((data: any) => {
      if (data.code == 200) {
        this.userDTOS = data.data;
        this.userDTOS.forEach((user: UserDTO) =>{
          if(user.status_active === 1){
            user.status_active = true;
          }else{
            user.status_active = false;
          }
        })
        this.totalRecords = data.recordsTotal;
      }
    }, error => {
      this.showNotification('error', 'Thông báo', 'Tìm kiếm danh sách người không dùng thành công ', 3000);
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



  onToggleChange(user : any) {

    if(!user.status_active){
      const dialogRef = this.dialog.open(LockUserDialogComponent, {
        width: '400px',
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('Selected reason:', result);
          console.log('status: LOCK')
          console.log(user);

          let lockRequest : LockUserRequest = {
            email : user.email,
            reason : result,
            status: 0
          }

          this.userManagementService.lockUser(lockRequest).subscribe(
            (data: any) => {
              if(data.code === '200'){
                this.showNotification('success', 'Thông báo', 'Khóa tài khoản người dùng thành công ', 3000);
                this.doSearch(this.searchTerm);
              }else{
                this.showNotification('error', 'Thông báo', 'Khóa tài khoản người dùng không thành công: ' + data.code , 3000);
                this.doSearch(this.searchTerm);
              }
            },
            error => {
              console.log(error);
              this.showNotification('error', 'Thông báo', 'Khóa tài khoản người dùng không thành công: ' + error , 3000);
            }
          )


        } else {
          console.log('Dialog closed without confirmation');
          this.doSearch(this.searchTerm);
        }
      });
    }else{
      const dialogRef = this.dialog.open(UnlockUserDialogComponent, {
        width: '400px',
        data:  { accountName : user.full_name },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log(`Account ${user.full_name} unlocked!`);

          let lockRequest : LockUserRequest = {
            email : user.email,
            reason : '',
            status: 1
          }

          this.userManagementService.lockUser(lockRequest).subscribe(
            (data: any) => {
              console.log(data)
              if(data.code === '200'){
                this.showNotification('success', 'Thông báo', ' Mở khóa tài khoản người dùng thành công ', 3000);
                this.doSearch(this.searchTerm);
              }else{
                this.showNotification('error', 'Thông báo', ' Mở khóa tài khoản người dùng không thành công: ' + data.code , 3000);
                this.doSearch(this.searchTerm);
              }
            },
            error => {
              console.log(error);
              this.showNotification('error', 'Thông báo', ' Mở khóa tài khoản người dùng không thành công: ' + error , 3000);
            }
          )

        } else {
          console.log(`Unlocking account ${user.full_name} canceled.`);
          this.doSearch(this.searchTerm);
        }
      });
    }

  }

  showNotification(serverity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: `${serverity}`, summary: `${summary}`, detail: `${detail}`, life: lifetime });
  }

}
