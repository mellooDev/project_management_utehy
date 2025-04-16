import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-fullscreen-chart4',
  templateUrl: './fullscreen-chart4.component.html',
  styleUrl: './fullscreen-chart4.component.scss',
})
export class FullscreenChart4Component {
  title: string;
  dataChart: number[];
  categories: string[];
  isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<FullscreenChart4Component>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.dataChart = data.dataChart;
    this.categories = data.categories;
    this.isLoading = data.isLoading;
  }
}
