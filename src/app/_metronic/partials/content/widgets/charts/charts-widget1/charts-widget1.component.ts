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
import { FullscreenDialogComponent } from '../fullscreen-dialog/fullscreen-dialog.component';
import * as echarts from 'echarts';

@Component({
  selector: 'app-charts-widget1',
  templateUrl: './charts-widget1.component.html',
})
export class ChartsWidget1Component
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() fullscreen: boolean = false;
  @Input() titleChart: string;
  @Input() data: number[];
  @Input() categories: string[];
  @Input() isLoading: boolean = true;
  @Input() colors: string[];
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

    const originalCategories = this.categories;
    const truncatedCategories = this.categories.map((category) =>
      this.truncateString(category, 10)
    );

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const tooltipContent = params
            .map((item: any) => {
              const originalCategory = originalCategories[item.dataIndex];
              return `${originalCategory}: ${item.value?.toLocaleString(
                'en-US'
              )} VND`;
            })
            .join('<br>');
          return tooltipContent;
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
      grid: {
        top: '12%',
        left: '2%',
        right: '5%',
        bottom: '0%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'value',
          boundaryGap: [0, 0.01],
        },
      ],
      yAxis: [
        {
          type: 'category',
          data: truncatedCategories,
        },
      ],
      series: [
        {
          type: 'bar',
          data: this.data.map((value, index) => ({
            value: value,
            itemStyle: {
              color: this.colors[index % this.colors.length],
              borderRadius: [0, 3, 3, 0],
            },
          })),
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
      const dialogRef = this.dialog.open(FullscreenDialogComponent, {
        height: 'calc(100% - 30px)',
        width: 'calc(100% - 30px)',
        maxWidth: '100%',
        maxHeight: '100%',
        data: {
          categories: this.categories,
          colors: this.colors,
          data: this.data,
          isLoading: this.isLoading,
          title: this.titleChart,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.fullscreen = false;
        this.initChart();
      });
      this.fullscreen = true;
    }
  }

  truncateString(str: string, maxLength: number): string {
    if (str.length > maxLength) {
      return str.substring(0, maxLength) + '...';
    }
    return str;
  }
}
