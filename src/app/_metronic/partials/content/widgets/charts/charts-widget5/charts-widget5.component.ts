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
import { FullscreenChart5Component } from '../fullscreen-chart5/fullscreen-chart5.component';
import * as echarts from 'echarts';

@Component({
  selector: 'app-charts-widget5',
  templateUrl: './charts-widget5.component.html',
})
export class ChartsWidget5Component
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() fullscreen: boolean = false;
  @Input() titleChart: string;
  @Input() data: any[];
  @ViewChild('chartContainer', { static: true })
  chartContainer: ElementRef<HTMLDivElement>;
  myChart: echarts.ECharts | undefined;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    if (this.myChart) {
      this.myChart.dispose();
    }
  }

  initChart(): void {
    var purchasedData: number[] = this.data.map((e) => e.numberRequest);
    var usedData: number[] = this.data.map((e) => e.totalRequest);
    var categories: string[] = this.data.map((e) => e.productName);
    var percentageData: number[] = this.data.map((e) => e.percentRequest);
    const chartDom = this.chartContainer.nativeElement;
    if (this.myChart) {
      this.myChart.dispose();
    }
    this.myChart = echarts.init(chartDom);

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      toolbox: {
        feature: {
          saveAsImage: {
            show: true,
            name: this.titleChart,
            title: 'Tải xuống',
          },
        },
      },
      legend: {
        data: ['Request đã mua', 'Request đã sử dụng', '% Sử dụng'],
        itemGap: 10,
        textStyle: { fontSize: 14, fontFamily: 'Inter', fontWeight: 'bold' },
      },
      color: ['#1890FF', '#BD7408', '#FBCE4A'],
      grid: {
        top: '25%',
        left: '2%',
        right: '1%',
        bottom: '5%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: categories,
          axisPointer: {
            type: 'shadow',
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Số lượng',
          axisLabel: {
            formatter: function (value: number) {
              return value.toString();
            },
          },
        },
        {
          type: 'value',
          name: '% Sử dụng',
          min: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%',
          },
        },
      ],
      series: [
        {
          name: 'Request đã mua',
          type: 'bar',
          barWidth: 35,
          data: purchasedData,
        },
        {
          name: 'Request đã sử dụng',
          type: 'bar',
          barWidth: 35,
          data: usedData,
        },
        {
          name: '% Sử dụng',
          type: 'line',
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value) {
              return (value as number) + '%';
            },
          },
          data: percentageData,
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
      const dialogRef = this.dialog.open(FullscreenChart5Component, {
        height: 'calc(100% - 30px)',
        width: 'calc(100% - 30px)',
        maxWidth: '100%',
        maxHeight: '100%',
        data: {
          title: this.titleChart,
          dataChart: this.data,
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
