import { CommonModule } from '@angular/common';
import { Component, Inject, inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-package-delete-dialog',
  templateUrl: './package-delete-dialog.component.html',
  styleUrl: './package-delete-dialog.component.scss',
})
export class PackageDeleteDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<PackageDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
