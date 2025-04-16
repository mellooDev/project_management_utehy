import {Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {
  CreateWorksheetRequest,
  FolderDTO,
  GetListRequest,
  WorksheetManagementService
} from "../../../services/worksheet-management.service";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-create-worksheet-dialog',
  templateUrl: './create-worksheet-dialog.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    NgForOf
  ],
  styleUrls: ['./create-worksheet-dialog.component.scss']
})
export class CreateWorksheetDialogComponent implements OnInit{
  worksheetName: string = '';
  worksheetContent: string = '';
  worksheetFolderId: number = 0;
  listFolders : FolderDTO[] = [];

  createWorksheetRequest : CreateWorksheetRequest = {};

  constructor(private dialogRef: MatDialogRef<CreateWorksheetDialogComponent>,
              private worksheetManagementService: WorksheetManagementService,) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveWorksheet(): void {
    if (this.worksheetName.trim()) {
      this.createWorksheetRequest.name = this.worksheetName;
      this.createWorksheetRequest.content = this.worksheetContent;
      this.createWorksheetRequest.folderId = this.worksheetFolderId;

      this.dialogRef.close(this.createWorksheetRequest);
    } else {
      alert('Vui lòng nhập tên worksheet!');
    }
  }
  onSelectFolderId(event : any){
    this.worksheetFolderId = event.value;
    console.log(this.worksheetFolderId);
  }


  ngOnInit(): void {
    const requestSearchFolders : GetListRequest = {
      filter : "",
      currentPage : 1,
      perPage : 10
    }
    this.worksheetManagementService.getFolders(requestSearchFolders).subscribe((data: any) => {
      if (data.code == 200) {
        this.listFolders = data.data;
      }
    });
  }
}
