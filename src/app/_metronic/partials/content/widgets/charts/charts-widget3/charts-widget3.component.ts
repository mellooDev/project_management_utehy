import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as echarts from 'echarts';
import { FullscreenChart3Component } from '../fullscreen-chart3/fullscreen-chart3.component';

@Component({
  selector: 'app-charts-widget3',
  templateUrl: './charts-widget3.component.html',
})
export class ChartsWidget3Component
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() fullscreen: boolean = false;
  @Input() titleChart: string;
  @Input() users: number[];
  @Input() providers: number[];
  @Input() categories: string[];
  @Input() isLoading: boolean = true;
  @ViewChild('chartContainer', { static: true })
  chartContainer: ElementRef<HTMLDivElement>;
  myChart: echarts.ECharts | undefined;

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
      legend: {
        data: ['Tổng lượt đăng ký mới', 'Người bán'],
        itemGap: 10,
        textStyle: { fontSize: 14, fontFamily: 'Inter', fontWeight: 'bold' },
      },
      color: ['#1890FF', '#BD7408'],
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
          name: 'Số lượng',
          minInterval: 1,
          axisLabel: {
            formatter: '{value}',
          },
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
          name: 'Tổng lượt đăng ký mới',
          type: 'bar',
          data: this.users,
        },
        {
          name: 'Người bán',
          type: 'bar',
          data: this.providers,
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
      const dialogRef = this.dialog.open(FullscreenChart3Component, {
        height: 'calc(100% - 30px)',
        width: 'calc(100% - 30px)',
        maxWidth: '100%',
        maxHeight: '100%',
        data: {
          users: this.users,
          providers: this.providers,
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
