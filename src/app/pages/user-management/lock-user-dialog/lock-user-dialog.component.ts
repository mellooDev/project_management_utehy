import { Component } from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-lock-user-dialog',
  templateUrl: './lock-user-dialog.component.html',
  styleUrls: ['./lock-user-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogActions,
    MatButtonModule,
    MatDialogContent,
    NgForOf,
    NgIf
  ],
  standalone: true
})
export class LockUserDialogComponent {
  lockForm: FormGroup;
  reasons: string[] = [
    'Lý do 1',
    'Lý do 2',
    'Lý do 3'
  ];

  constructor(
    private dialogRef: MatDialogRef<LockUserDialogComponent>,
    private fb: FormBuilder
  ) {
    this.lockForm = this.fb.group({
      reason: ['', Validators.required],
      customReason: [''], // Optional field for custom input
    });

    // Watch for changes to the reason field
    this.lockForm.get('reason')?.valueChanges.subscribe((value) => {
      if (value === 'Khác') {
        this.lockForm.get('customReason')?.setValidators(Validators.required);
      } else {
        this.lockForm.get('customReason')?.clearValidators();
      }
      this.lockForm.get('customReason')?.updateValueAndValidity();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.lockForm.valid) {
      const reason =
        this.lockForm.value.reason === 'Khác'
          ? this.lockForm.value.customReason
          : this.lockForm.value.reason;
      this.dialogRef.close(reason); // Return the reason to the parent
    }
  }
}
