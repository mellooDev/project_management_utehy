import {Component, OnInit} from '@angular/core';
import {LockUserRequest, UserDTO, UserManagementService} from "../../../services/user-management.service";
import {MatDialog} from "@angular/material/dialog";
import {data} from "jquery";
import {MessageService} from "primeng/api";
import {
  CreateFolderRequest,
  FolderDTO,
  GetListRequest,
  WorksheetDTO,
  WorksheetManagementService
} from "../../../services/worksheet-management.service";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {CreateWorksheetDialogComponent} from "../create-worksheet-dialog/create-worksheet-dialog.component";
import {CreateFolderDialogComponent} from "../create-folder-dialog/create-folder-dialog.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-worksheet-list',
  templateUrl: './worksheet-list.component.html',
  styleUrl: './worksheet-list.component.scss'
})
export class WorksheetListComponent implements OnInit {
  searchTerm: string = '';
  worksheetDTOS: WorksheetDTO[] = [];
  folderDTOS: FolderDTO[] = [];

  currentTabIndex: number = 0;

  currentPageWS: number = 1; // Current page
  pageSizeWS: number = 10; // Number of records per page
  totalRecordsWS: number = 0; // Total number of records

  currentPageFD: number = 1; // Current page
  pageSizeFD: number = 10; // Number of records per page
  totalRecordsFD: number = 0; // Total number of records

  requestSearchWorksheet : GetListRequest = {
    filter : "",
    currentPage : 1,
    perPage : 10
  }

  requestSearchFolders : GetListRequest = {
    filter : "",
    currentPage : 1,
    perPage : 10
  }



  constructor(
    private worksheetManagementService: WorksheetManagementService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog) {
  }

  ngOnInit(): void {
    console.log("ngOnInit")
    this.doSearchWorksheet(this.requestSearchWorksheet)
    this.doSearchFolders(this.requestSearchFolders)
  }
  doSearchWorksheet(requestSearchWorksheet: GetListRequest) {

    this.worksheetManagementService.getWorksheets(requestSearchWorksheet).subscribe((data: any) => {
      if (data.code == 200) {
        this.worksheetDTOS = data.data;
        this.totalRecordsWS = data.recordsTotal;
      }
    });
  }

  doSearchFolders(requestSearchFolders: GetListRequest) {

    this.worksheetManagementService.getFolders(requestSearchFolders).subscribe((data: any) => {
      if (data.code == 200) {
        this.folderDTOS = data.data;
        this.totalRecordsFD = data.recordsTotal;
      }
    });
  }




  onTabChange(event: MatTabChangeEvent): void {
    this.currentTabIndex = event.index;
  }


  onSearch() {
    console.log("onSearch", this.searchTerm)
    if(this.currentTabIndex === 0 ) {
      this.requestSearchWorksheet.filter = this.searchTerm;
      this.doSearchWorksheet(this.requestSearchWorksheet);
    }
    if(this.currentTabIndex === 1 ){
      this.requestSearchFolders.filter = this.searchTerm;
      this.doSearchFolders(this.requestSearchFolders);
    }

  }

  createNew(type: string): void {
    const pattern = /^[a-zA-Z0-9]+$/;
    if (type === 'worksheet') {
      console.log('Tạo mới Worksheet');
      // Thêm logic tạo mới Worksheet

      const dialogRef = this.dialog.open(CreateWorksheetDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          if(!pattern.test(result.name)){
            this.showNotification('error', 'Thông báo', 'Tên Worksheet hợp lệ ', 3000);
          }else{
            console.log('Worksheet được tạo:', result);
            this.worksheetManagementService.createWorksheet(result).subscribe(
              (data: any) => {
                if (data.code == 200) {
                  console.log(data);
                  this.showNotification('success', 'Thông báo', ' Tạo Worksheet thành công ', 3000);
                  this.doSearchWorksheet(this.requestSearchWorksheet);
                }else{
                  console.log(data);
                  this.showNotification('error', 'Thông báo', ' Tạo Worksheet không thành công: ' + data.desc, 3000);
                  this.doSearchWorksheet(this.requestSearchWorksheet);
                }
              },error => {
                this.showNotification('error', 'Thông báo', ' Tạo Worksheet không thành công: ' + error.error.desc, 3000);
                this.doSearchWorksheet(this.requestSearchWorksheet);
              }
            );
          }
        }
      });


    } else if (type === 'folder') {
      console.log('Tạo mới Folder');
      // Thêm logic tạo mới Folder

      const dialogRef = this.dialog.open(CreateFolderDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if(!pattern.test(result)){
            this.showNotification('error', 'Thông báo', 'Tên Folder hợp lệ ', 3000);
          }else{
            console.log('Tên Folder được tạo:', result);
            let request: CreateFolderRequest = {
              name : result
            }

            this.worksheetManagementService.createFolder(request).subscribe(
              (data: any) => {
                if (data.code == 200) {
                  console.log(data);
                  this.showNotification('success', 'Thông báo', ' Tạo Folder thành công ', 3000);
                  this.doSearchFolders(this.requestSearchFolders);
                }else{
                  console.log(data);
                  this.showNotification('error', 'Thông báo', ' Tạo Folder không thành công ', 3000);
                  this.doSearchFolders(this.requestSearchFolders);
                }
              }
            );
          }
        }
      });

    }
  }


  onPageChangeWS(page: number) {
    console.log("onPageChange", page)
    this.currentPageWS = page;
    this.requestSearchWorksheet.currentPage = this.currentPageWS;
    this.doSearchWorksheet(this.requestSearchWorksheet);
  }

  onPageChangeFD(page: number) {
    console.log("onPageChange", page)
    this.currentPageFD = page;
    this.requestSearchFolders.currentPage = this.currentPageFD;
    this.doSearchFolders(this.requestSearchFolders);
  }

  timeSinceLastModified(lastModifiedDate: any): string {
    const now = new Date();
    const modifiedDate = new Date(lastModifiedDate);

    const diffMs = now.getTime() - modifiedDate.getTime();


    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return `${seconds} giây trước`;
    }
  }


  showNotification(serverity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: `${serverity}`, summary: `${summary}`, detail: `${detail}`, life: lifetime });
  }

  protected readonly navigator = navigator;
}
