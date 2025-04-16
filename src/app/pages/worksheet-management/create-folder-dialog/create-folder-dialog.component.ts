import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";

@Component({
  selector: 'app-create-folder-dialog',
  templateUrl: './create-folder-dialog.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatInputModule
  ],
  styleUrls: ['./create-folder-dialog.component.scss']
})
export class CreateFolderDialogComponent {
  folderName: string = '';

  constructor(private dialogRef: MatDialogRef<CreateFolderDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveFolder(): void {
    if (this.folderName.trim()) {
      this.dialogRef.close(this.folderName);
    } else {
      alert('Vui lòng nhập tên Folder!');
    }
  }
}
