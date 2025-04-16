import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";

@Component({
  selector: 'app-rename-worksheet-dialog',
  templateUrl: './rename-dialog.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatInputModule
  ],
  styleUrls: ['./rename-dialog.component.scss']
})
export class RenameDialogComponent {
  newName: string = '';

  constructor(private dialogRef: MatDialogRef<RenameDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  rename(): void {
    if (this.newName.trim()) {
      this.dialogRef.close(this.newName);
    } else {
      alert('Vui lòng nhập tên mới!');
    }
  }
}
