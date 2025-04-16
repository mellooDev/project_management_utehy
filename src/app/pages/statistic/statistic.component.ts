import { Component, AfterViewInit, OnInit } from '@angular/core';
import {CountUp} from 'countup.js'
import {Chart, registerables} from 'chart.js'
import moment, { duration } from 'moment';

declare var $: any;

Chart.register(...registerables);
let delayed: any;


@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.scss'
})
export class StatisticComponent implements AfterViewInit, OnInit {

  revenueData: any;
  revenueChartLabels: string[];
  revenueChartOptions: any;
  fromDate: string | null = null;
  toDate: string | null = null;
  userAge: number = 0;

  public dataRevenue: any = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    datasets: [
      {
        label: 'Doanh thu năm 2023',
        data: [12000, 15000, 18000, 20000, 22000, 25000, 24000, 27000, 30000, 28000, 31000, 33000],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
    ]
  };

  applyFilter() {
    console.log('From Date:', this.fromDate);
    console.log('To Date:', this.toDate);
    // Xử lý logic lọc ở đây
  }

  public orderRevenue: any = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    datasets: [
      {
        label: 'Đơn hàng thành công',
        data: [10000, 12000, 15000, 18000, 20000, 22000, 21000, 24000, 27000, 25000, 28000, 30000],
        backgroundColor: 'rgba(75, 192, 192, 0.7)', // Màu xanh lá mờ
        borderColor: 'rgba(75, 192, 192, 1)',        // Màu xanh lá đậm
        borderWidth: 1
      },
      {
        label: 'Đơn hàng chưa thành công',
        data: [2000, 3000, 3000, 2000, 2000, 3000, 3000, 3000, 3000, 3000, 3000, 3000],
        backgroundColor: 'rgba(255, 99, 132, 0.7)', // Màu đỏ mờ
        borderColor: 'rgba(255, 99, 132, 1)',        // Màu đỏ đậm
        borderWidth: 1
      },
    ]
  };

  ngAfterViewInit(): void {
    const countUpElements = document.querySelectorAll('[data-kt-countup="true"]') as NodeListOf<HTMLElement>;

    countUpElements.forEach((countUpElement: HTMLElement) => {
      const value = countUpElement.getAttribute('data-kt-countup-value');
      const prefix = countUpElement.getAttribute('data-kt-countup-prefix') || '';
      const suffix = countUpElement.getAttribute('data-kt-countup-suffix') || '';
      if (value !== null) {
        const countUp = new CountUp(countUpElement,parseFloat(value), {
          startVal: 0,
          prefix: prefix,
          duration: 2.5,
          suffix: suffix
        })

        countUp.start();
      }
    })


    $("#kt_daterangepicker_1").daterangepicker(
      {
        autoUpdateInput: false, // Để không tự động chèn giá trị vào input
        startDate: moment().startOf('day'), // Giá trị mặc định từ ngày bắt đầu
      endDate: moment().add(1, 'day').startOf('day'),
        locale: {
          cancelLabel: 'Clear',
          format: 'DD/MM/YYYY' // Định dạng ngày tháng
        }
      },
      (start: any, end: any) => {
        // Callback khi chọn ngày
        this.fromDate = start.format('DD-MM-YYYY');
        this.toDate = end.format('DD-MM-YYYY');
        console.log(`From: ${this.fromDate}, To: ${this.toDate}`);
      }
    );

    // Đặt giá trị mặc định khi người dùng chưa chọn
    $("#kt_daterangepicker_1").on('apply.daterangepicker', (ev: any, picker: any) => {
      // const startDate = picker.startDate.format('DD/MM/YYYY');
      // const endDate = picker.endDate.format('DD/MM/YYYY');
      this.fromDate = picker.startDate.format('DD/MM/YYYY');
      this.toDate = picker.endDate.format('DD/MM/YYYY');
      $("#kt_daterangepicker_1").val(`${this.fromDate} - ${this.toDate}`); // Hiển thị trong ô input
      console.log(`Applied - From: ${this.fromDate}, To: ${this.toDate}`);
    });

    // Xử lý khi nhấn nút Clear
    $("#kt_daterangepicker_1").on('cancel.daterangepicker', () => {
      this.fromDate = '';
      this.toDate = '';
      $("#kt_daterangepicker_1").val('');
      console.log('Date range cleared');
    });
  }

  calculateAge(start: any) {
    const years = moment().diff(start, 'years');
    this.userAge = years;
    alert("Bạn " + this.userAge + " tuổi!");
  }

  chartRevenue: any;
  chartOrder: any;


  ngOnInit(): void {
    this.chartRevenue = new Chart('revenueChart', this.configRevenue);
    this.chartOrder = new Chart('orderChart', this.configOrder);
  }

  public configRevenue: any = {
    type: 'bar',
    data: this.dataRevenue,
    options: {
      animation: {
        maintainAspectRatio: false,
        duration: 2000,
        responsive: true,
        onComplete: () => {
          delayed = true;
        },
        delay: (context: any) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default' && !delayed) {
            delay = context.dataIndex * 300 + context.dataIndex * 100
          }
          return delay;
        }
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          stacked: false,
          beginAtZero: true,
        }
      }
    }
  }

  public configOrder: any = {
    type: 'bar',
    data: this.orderRevenue,
    options: {
      maintainAspectRatio: false,
      responsive: true,
      duration: 2500,
      animation: {
        onComplete: () => {
          delayed = true;
        },
        delay: (context: any) => {
          let delay = 0;
          if (context.type === 'data' && context.mode === 'default' && !delayed) {
            delay = context.dataIndex * 300 + context.dataIndex * 100
          }
          return delay;
        }
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          stacked: false,
          beginAtZero: true,
        }
      }
    }
  }


  // onTimeRangeChange(event: Event) {
  //   const days = parseInt((event.target as htmle))
  // }

}
