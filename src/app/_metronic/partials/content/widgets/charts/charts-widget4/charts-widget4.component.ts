import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FullscreenChart4Component } from '../fullscreen-chart4/fullscreen-chart4.component';
import * as echarts from 'echarts';

@Component({
  selector: 'app-charts-widget4',
  templateUrl: './charts-widget4.component.html',
})
export class ChartsWidget4Component
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() fullscreen: boolean = false;
  @Input() titleChart: string;
  @Input() data: number[];
  @Input() categories: string[];
  @Input() isLoading: boolean = true;
  @ViewChild('chartContainer', { static: true })
  chartContainer: ElementRef<HTMLDivElement>;
  myChart: echarts.ECharts | undefined;
  chartOptions: any = {};

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!this.isLoading) {
      this.initChart();
    }
  }

  ngOnDestroy(): void {
    if (this.myChart) {
      this.myChart.dispose();
    }
  }

  initChart(): void {
    const chartDom = this.chartContainer.nativeElement;
    if (this.myChart) {
      this.myChart.dispose();
    }
    this.myChart = echarts.init(chartDom);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          label: { show: true },
        },
      },
      toolbox: {
        feature: {
          restore: { show: true },
          saveAsImage: {
            show: true,
            name: this.titleChart,
            title: 'Tải xuống',
          },
        },
      },
      color: ['#1890FF'],
      grid: {
        top: '12%',
        left: '2%',
        right: '0%',
        bottom: '5%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: this.categories,
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      dataZoom: [
        {
          show: false,
          start: 0,
          end: 100,
          height: 1,
        },
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          show: false,
          yAxisIndex: 0,
          filterMode: 'empty',
          width: 15,
          height: '80%',
          showDataShadow: false,
          left: '93%',
        },
      ],
      series: [
        {
          type: 'bar',
          data: this.data,
        },
      ],
    };

    this.myChart?.setOption(option);
  }

  toggleFullscreen(): void {
    if (this.fullscreen) {
      this.fullscreen = false;
      this.dialog.closeAll();
    } else {
      const dialogRef = this.dialog.open(FullscreenChart4Component, {
        height: 'calc(100% - 30px)',
        width: 'calc(100% - 30px)',
        maxWidth: '100%',
        maxHeight: '100%',
        data: {
          title: this.titleChart,
          dataChart: this.data,
          categories: this.categories,
          isLoading: this.isLoading,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.fullscreen = false;
        this.initChart();
      });
      this.fullscreen = true;
    }
  }
}