import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-fullscreen-chart3',
  templateUrl: './fullscreen-chart3.component.html',
  styleUrl: './fullscreen-chart3.component.scss',
})
export class FullscreenChart3Component {
  users: number[];
  providers: number[];
  categories: string[];
  isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<FullscreenChart3Component>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.users = data.users;
    this.providers = data.providers;
    this.categories = data.categories;
    this.isLoading = data.isLoading;
  }
}
