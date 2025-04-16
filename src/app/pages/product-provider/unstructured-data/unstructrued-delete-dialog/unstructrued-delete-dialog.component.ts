import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-unstructrued-delete-dialog',
  templateUrl: './unstructrued-delete-dialog.component.html',
  styleUrl: './unstructrued-delete-dialog.component.scss'
})
export class UnstructruedDeleteDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<UnstructruedDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}


  close() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
