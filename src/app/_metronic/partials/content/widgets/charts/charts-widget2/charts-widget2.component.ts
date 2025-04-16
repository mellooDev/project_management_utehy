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
import { FullscreenLineChartComponent } from '../fullscreen-line-chart/fullscreen-line-chart.component';
import * as echarts from 'echarts';
@Component({
  selector: 'app-charts-widget2',
  templateUrl: './charts-widget2.component.html',
})
export class ChartsWidget2Component
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() fullscreen: boolean = false;
  @Input() titleChart: string;
  @Input() dataChart: any[];
  @Input() forAdmin: boolean = false;
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
    var categories;
    var legends: string[] = [];
    var series: any[];
    var yaxisTitle: string = '';
    if (this.forAdmin) {
      yaxisTitle = 'Doanh thu';
      categories =
        this.dataChart[0]?.statistic.map((item: any) => {
          const [year, month, day] = item.date.split('-');
          return `${day}/${month}/${year}`;
        }) || [];

      series = this.dataChart.map((category: any) => {
        return {
          name: category.categoryName
            ? category.categoryName
            : 'Không xác định',
          type: 'line',
          data: category.statistic.map((stat: any) => stat.revenue),
        };
      });
      legends = this.dataChart.map((category: any) => {
        return category.categoryName ? category.categoryName : 'Không xác định';
      });
    } else {
      categories =
        this.dataChart[0]?.statistic.map((item: any) => {
          const [year, month, day] = item.date.split('-');
          return `${day}/${month}/${year}`;
        }) || [];

      series = this.dataChart.map((e: any) => {
        return {
          name: e.productName ? e.productName : 'Không xác định',
          type: 'line',
          data: e.statistic.map((stat: any) => stat.totalRequests),
        };
      });
      if (series.length > 0) {
        yaxisTitle = 'Số lượng';
      }
    }

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
        type: 'scroll',
        data: legends,
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
          data: categories,
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: yaxisTitle,
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
      series: series,
    };

    this.myChart?.setOption(option);
  }

  toggleFullscreen(): void {
    if (this.fullscreen) {
      this.fullscreen = false;
      this.dialog.closeAll();
    } else {
      const dialogRef = this.dialog.open(FullscreenLineChartComponent, {
        height: 'calc(100% - 30px)',
        width: 'calc(100% - 30px)',
        maxWidth: '100%',
        maxHeight: '100%',
        data: {
          title: this.titleChart,
          dataChart: this.dataChart,
          forAdmin: this.forAdmin,
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
