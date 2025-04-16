import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FullscreenChart4Component } from '../fullscreen-chart4/fullscreen-chart4.component';

@Component({
  selector: 'app-fullscreen-chart5',
  templateUrl: './fullscreen-chart5.component.html',
  styleUrl: './fullscreen-chart5.component.scss',
})
export class FullscreenChart5Component {
  title: string;
  dataChart: any[];

  constructor(
    public dialogRef: MatDialogRef<FullscreenChart5Component>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.dataChart = data.dataChart;
  }
}
