import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-fullscreen-dialog',
  templateUrl: './fullscreen-dialog.component.html',
  styleUrl: './fullscreen-dialog.component.scss',
})
export class FullscreenDialogComponent {
  data: number[];
  categories: string[];
  isLoading: boolean = true;
  colors: string[];
  title: string;

  constructor(
    public dialogRef: MatDialogRef<FullscreenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dataChart: any
  ) {
    console.log(dataChart.categories);
    this.data = dataChart.data;
    this.categories = dataChart.categories;
    this.isLoading = dataChart.isLoading;
    this.colors = dataChart.colors;
    this.title = dataChart.title;
  }
}
