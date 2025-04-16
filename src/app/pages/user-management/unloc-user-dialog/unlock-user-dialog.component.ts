import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions
} from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-unlock-user-dialog',
  templateUrl: './unlock-user-dialog.component.html',
  styleUrls: ['./unlock-user-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule
  ],
  standalone: true
})
export class UnlockUserDialogComponent {
  accountName: string;

  constructor(
    private dialogRef: MatDialogRef<UnlockUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { accountName: string }
  ) {
    this.accountName = data.accountName; // Dynamically set account name
  }

  onCancel(): void {
    this.dialogRef.close(false); // Return 'false' on cancel
  }

  onConfirm(): void {
    this.dialogRef.close(true); // Return 'true' on confirm
  }
}
