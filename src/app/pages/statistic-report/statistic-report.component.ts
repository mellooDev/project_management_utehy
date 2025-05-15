import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CountUp } from 'countup.js';
import { chartOptions } from 'src/app/utils/chart-options';

@Component({
  selector: 'app-statistic-report',
  templateUrl: './statistic-report.component.html',
  styleUrl: './statistic-report.component.scss',
})
export class StatisticReportComponent implements OnInit, AfterViewInit {
  basicData: any;

  basicOptions: any;
  data: any;
  scoreStatsData: any;
  scoreStatsOptions: any;
  teacherData: any;
  teacherOptions: any;
  submitStatus: any;
  submitStatusOptions: any;

  options: any;

  ngOnInit() {
    this.scoreStatsOptions = chartOptions.scoreStatsOptions;
    this.teacherOptions = chartOptions.teacherOptions;
    this.submitStatusOptions = chartOptions.submitStatusOptions;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.basicData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Sales',
          data: [540, 325, 702, 620],
          backgroundColor: [
            'rgba(255, 159, 64, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
          ],
          borderWidth: 1,
        },
      ],
    };

    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };

    this.data = {
      labels: ['A', 'B', 'C'],
      datasets: [
        {
          data: [540, 325, 702],
          backgroundColor: [
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--green-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--green-400'),
          ],
        },
      ],
    };

    this.options = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor,
          },
        },
      },
    };

    this.scoreStatsData = {
      labels: ['Round 1', 'Round 2', 'Round 3'],
      datasets: [
        {
          label: 'Trung bình',
          data: [6.5, 7.2, 7.5],
          fill: false,
          borderColor: '#42A5F5',
        },
        {
          label: 'Cao nhất',
          data: [9.5, 9.8, 10],
          fill: false,
          borderColor: '#66BB6A',
        },
        {
          label: 'Thấp nhất',
          data: [2.0, 4.0, 5.5],
          fill: false,
          borderColor: '#FFA726',
        },
      ],
    };

    this.teacherData = {
      labels: ['Thầy A', 'Cô B', 'Thầy C'],
      datasets: [
        {
          label: 'Số SV',
          data: [10, 12, 8],
          backgroundColor: [
            'rgba(66, 165, 245, 0.2)',
            'rgba(102, 187, 106, 0.2)',
            'rgba(255, 167, 38, 0.2)',
          ],
          borderColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          borderWidth: 2,
        },
      ],
    };

    this.submitStatus = {
      labels: ['Nộp đúng hạn', 'Nộp trễ', 'Chưa nộp'],
      datasets: [
        {
          data: [15, 5, 3],
          backgroundColor: ['#42A5F5', '#FFA726', '#EF5350'],
        },
      ],
    };
  }

  ngAfterViewInit(): void {
    const countUpElements = document.querySelectorAll(
      '[data-kt-countup="true"]'
    ) as NodeListOf<HTMLElement>;

    countUpElements.forEach((countUpElement: HTMLElement) => {
      const value = countUpElement.getAttribute('data-kt-countup-value');
      const prefix =
        countUpElement.getAttribute('data-kt-countup-prefix') || '';
      const suffix =
        countUpElement.getAttribute('data-kt-countup-suffix') || '';
      if (value !== null) {
        const parsedValue = parseFloat(value);

        if (!isNaN(parsedValue)) {
          // Kiểm tra xem giá trị có phần thập phân hay không
          const decimals = parsedValue % 1 !== 0 ? 1 : 0; // Nếu có phần thập phân thì sử dụng 1 chữ số sau dấu phẩy

          const countUp = new CountUp(countUpElement, parsedValue, {
            startVal: 0,
            prefix: prefix,
            duration: 4,
            suffix: suffix,
            decimalPlaces: decimals, // Chỉ áp dụng phần thập phân khi cần
          });

          countUp.start();
        }
      }
    });
  }
}
