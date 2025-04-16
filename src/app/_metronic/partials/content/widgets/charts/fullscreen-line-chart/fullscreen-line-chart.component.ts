import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-fullscreen-line-chart',
  templateUrl: './fullscreen-line-chart.component.html',
  styleUrl: './fullscreen-line-chart.component.scss',
})
export class FullscreenLineChartComponent {
  title: string;
  dataChart: any[];
  forAdmin: boolean = false;
  isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<FullscreenLineChartComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.title = data.title;
    this.dataChart = data.dataChart;
    this.forAdmin = data.forAdmin;
    this.isLoading = data.isLoading;
  }
}
