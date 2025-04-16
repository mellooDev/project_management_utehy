import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ProductProviderService } from 'src/app/services/product-provider.service';
import {
  ProductIdsRequest,
  ProductRequestResponseDto,
  RequestPackageDTO,
  RequestPackageStatisticDTO,
  StatisticService,
} from 'src/app/services/statistic.service';

export class UserTotalDTO {
  totalUser: number = 0;
  totalProvider: number = 0;
}

export class TotalPackageDTO {
  totalPackage: number = 0;
  totalAmount: number = 0;
}

@Component({
  selector: 'app-statistic-chart',
  templateUrl: './statistic-chart.component.html',
  styleUrl: './statistic-chart.component.scss',
})
export class StatisticChartComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  preStartDate: string = '';
  preEndDate: string = '';
  userInfo: any;
  dateOptions = [
    { value: 'thisWeek', label: 'Tuần này' },
    { value: 'lastWeek', label: 'Tuần trước' },
    { value: 'thisMonth', label: 'Tháng này' },
    { value: 'lastMonth', label: 'Tháng trước' },
    { value: 'thisYear', label: 'Năm nay' },
    { value: 'lastYear', label: 'Năm trước' },
  ];
  selectedOption = 'thisWeek';

  constructor(
    private statisticService: StatisticService,
    private productProviderService: ProductProviderService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.onDateRangeChange();
  }

  onDateRangeChange() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDate = today.getDate();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate Monday offset

    switch (this.selectedOption) {
      case 'thisWeek':
        this.startDate = this.formatDate(
          new Date(today.setDate(currentDate + mondayOffset))
        );
        this.endDate = this.formatDate(new Date());
        this.preStartDate = this.formatDate(
          new Date(today.setDate(currentDate + mondayOffset - 7))
        );
        this.preEndDate = this.formatDate(
          new Date(today.setDate(today.getDate() + 6))
        );
        break;

      case 'lastWeek':
        this.startDate = this.formatDate(
          new Date(today.setDate(currentDate + mondayOffset - 7))
        );
        this.endDate = this.formatDate(
          new Date(today.setDate(today.getDate() + 6))
        );
        this.preStartDate = this.formatDate(
          new Date(today.setDate(currentDate + mondayOffset - 14))
        );
        this.preEndDate = this.formatDate(
          new Date(today.setDate(today.getDate() + 6))
        );
        break;

      case 'thisMonth':
        this.startDate = this.formatDate(
          new Date(currentYear, currentMonth, 2)
        );
        this.endDate = this.formatDate(new Date());
        this.preStartDate = this.formatDate(
          new Date(currentYear, currentMonth - 1, 2)
        );
        this.preEndDate = this.formatDate(
          new Date(currentYear, currentMonth, 1)
        );
        break;

      case 'lastMonth':
        this.startDate = this.formatDate(
          new Date(currentYear, currentMonth - 1, 2)
        );
        this.endDate = this.formatDate(new Date(currentYear, currentMonth, 1));
        this.preStartDate = this.formatDate(
          new Date(currentYear, currentMonth - 2, 2)
        );
        this.preEndDate = this.formatDate(
          new Date(currentYear, currentMonth - 1, 1)
        );
        break;

      case 'thisYear':
        this.startDate = this.formatDate(new Date(currentYear, 0, 2));
        this.endDate = this.formatDate(new Date());
        this.preStartDate = this.formatDate(new Date(currentYear - 1, 0, 2));
        this.preEndDate = this.formatDate(new Date(currentYear - 1, 11, 32));
        break;

      case 'lastYear':
        this.startDate = this.formatDate(new Date(currentYear - 1, 0, 2));
        this.endDate = this.formatDate(new Date(currentYear - 1, 11, 32));
        this.preStartDate = this.formatDate(new Date(currentYear - 2, 0, 2));
        this.preEndDate = this.formatDate(new Date(currentYear - 2, 11, 32));
        break;

      default:
        this.startDate = '';
        this.endDate = '';
    }

    this.authService.getUserByToken().subscribe((user: any) => {
      console.log('user', user);
      this.userInfo = user;
      if (user.group_id == 1) {
        this.getSubscriptionsAboutToExpire();
        this.getTotalDataPackageByDate();
        this.growPercentTotalDataPackage();
        this.getAmountPerDay();
        this.getNumberOfUsesPerDay();
        this.getRequestPackage();
      } else if (user.group_id == 2) {
        this.getSubscriptionsAboutToExpire();
        this.getTotalDataPackageByDate();
        this.growPercentTotalDataPackage();
        this.getAmountPerDay();
        this.getNumberOfUsesPerDay();
        this.getRequestPackage();
        this.getRevenuePerDay();
        this.growPercentRevenueOfProvider();
        this.getListProductIds();
      } else if (user.group_id == 3) {
        this.getAllProduct();
        this.getRequestProduct();
        this.getRevenueTotalByDate();
        this.growPercentRevenueTotal();
        this.getUserTotal();
        this.growPercentUserTotal();
        this.getTop5Providers();
        this.getTop5ProductNames();
        this.getTop5CategoryNames();
        this.getRevenueCategoryStatisticsByDate();
        this.getUserStatistics();
      }
    });
  }

  isTab0: boolean = true;
  onTabChange(event: MatTabChangeEvent): void {
    if (event.index === 1) {
      this.isTab0 = false;
    } else {
      this.isTab0 = true;
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDateVi(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  // Dữ liệu đang kinh doanh
  allData: number = 0;
  growPercentAllData: number = 0;
  getAllProduct() {
    this.productProviderService.getSearch('', 1, 999999).subscribe({
      next: (result) => {
        this.allData = this.countItemsWithinDateRange(
          result,
          this.startDate,
          this.endDate
        );
        var preAllData = this.countItemsWithinDateRange(
          result,
          this.preStartDate,
          this.preEndDate
        );
        if (preAllData > 0) {
          this.growPercentAllData =
            ((this.allData - preAllData) / preAllData) * 100;
        }
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  // Dữ liệu cần phê duyệt
  listRequestProduct: ProductRequestResponseDto[] = [];
  allRequest: number = 0;
  growPercentAllRequest: number = 0;
  getRequestProduct() {
    this.statisticService.getRequestProduct(1, 999999).subscribe({
      next: (result) => {
        this.listRequestProduct = result.data.filter(
          (e: ProductRequestResponseDto) => e.approval_status == 0
        );
        this.allRequest = this.countRequestWithinDateRange(
          this.listRequestProduct,
          this.startDate,
          this.endDate
        );
        var preAllRequest = this.countRequestWithinDateRange(
          this.listRequestProduct,
          this.preStartDate,
          this.preEndDate
        );
        if (preAllRequest > 0) {
          this.growPercentAllRequest =
            ((this.allRequest - preAllRequest) / preAllRequest) * 100;
        }
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  countRequestWithinDateRange(
    data: ProductRequestResponseDto[],
    startDate: string,
    endDate: string
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const count = data.filter((item) => {
      const createdAt = new Date(item.created_date.split('T')[0]);
      return createdAt >= start && createdAt <= end;
    }).length;

    return count;
  }

  // Tổng doanh thu sàn
  revenueTotal: number = 0;
  getRevenueTotalByDate() {
    this.statisticService
      .getRevenueTotalByDate(this.startDate, this.endDate)
      .subscribe((result) => {
        this.revenueTotal = result.data;
      });
  }

  revenueTotalGrowPercent: number = 0;
  growPercentRevenueTotal() {
    this.statisticService
      .getRevenueTotalByDate(this.preStartDate, this.preEndDate)
      .subscribe((result) => {
        var preRevenueTotal = result.data;
        if (preRevenueTotal > 0) {
          this.revenueTotalGrowPercent =
            ((this.revenueTotal - preRevenueTotal) / preRevenueTotal) * 100;
        }
      });
  }

  // Top 5 người bán
  providerNames: string[] = [];
  providerRevenues: number[] = [];
  loadTopViewProviders: boolean = true;
  color1 = ['#95BCEF', '#83B1EC', '#6DA3E9', '#5795E6', '#4187E2'];
  getTop5Providers() {
    this.loadTopViewProviders = true;
    this.statisticService
      .getTop5Providers(this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          var providerIds = result.data.map((entry: any) => entry.providerId);
          this.statisticService
            .getListUserNamesByUserIds(providerIds)
            .subscribe({
              next: (result) => {
                this.providerNames = result.data;
                this.loadTopViewProviders = false;
                this.cdr.detectChanges();
              },
            });

          this.providerRevenues = result.data.map(
            (entry: any) => entry.totalAmount
          );
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadTopViewProviders = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Top 5 sản phẩm
  productNames: string[] = [];
  productRevenues: number[] = [];
  loadTopViewProduct: boolean = true;
  color2 = ['#A5DFB5', '#96D9A9', '#83D399', '#70CC8A', '#5FC67C'];
  getTop5ProductNames() {
    this.loadTopViewProduct = true;
    this.statisticService
      .getTop5ProductNames(this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.productNames = result.data.map((entry: any) => entry.name);
          this.productRevenues = result.data.map(
            (entry: any) => entry.totalAmount
          );
          this.loadTopViewProduct = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadTopViewProduct = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Top 5 lĩnh vực
  categoryNames: string[] = [];
  categoryRevenues: number[] = [];
  loadTopViewCategory: boolean = true;
  color3 = ['#FFDABF', '#FFCAA5', '#FFC296', '#FFB784', '#FFA564'];
  getTop5CategoryNames() {
    this.loadTopViewCategory = true;
    this.statisticService
      .getTop5CategoryNames(this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.categoryNames = result.data.map((entry: any) => entry.name);
          this.categoryRevenues = result.data.map(
            (entry: any) => entry.totalAmount
          );
          this.loadTopViewCategory = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadTopViewCategory = false;
          this.cdr.detectChanges();
        },
      });
  }

  //doanh thu theo lĩnh vực
  revenueCategoryStatisticsByDate: any[] = [];
  loadRevenueCategoryStatisticsByDate: boolean = true;
  getRevenueCategoryStatisticsByDate() {
    this.loadRevenueCategoryStatisticsByDate = true;
    this.statisticService
      .getRevenueCategoryStatisticsByDate(this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.revenueCategoryStatisticsByDate = result.data;
          this.loadRevenueCategoryStatisticsByDate = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadRevenueCategoryStatisticsByDate = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Tổng đăng ký mới
  userTotalDTO: UserTotalDTO = new UserTotalDTO();
  getUserTotal() {
    this.statisticService.getUserTotal(this.startDate, this.endDate).subscribe({
      next: (result) => {
        this.userTotalDTO = result.data;
        this.cdr.detectChanges();
      },
    });
  }

  totalUserGrowPercent: number = 0;
  totalProviderGrowPercent: number = 0;
  growPercentUserTotal() {
    this.statisticService
      .getUserTotal(this.preStartDate, this.preEndDate)
      .subscribe((result) => {
        var preUserTotal: UserTotalDTO = result.data;
        if (preUserTotal.totalUser > 0) {
          this.totalUserGrowPercent =
            ((this.userTotalDTO.totalUser - preUserTotal.totalUser) /
              preUserTotal.totalUser) *
            100;
        }
        if (preUserTotal.totalProvider > 0) {
          this.totalProviderGrowPercent =
            ((this.userTotalDTO.totalProvider - preUserTotal.totalProvider) /
              preUserTotal.totalProvider) *
            100;
        }
      });
  }

  // Tài khoản đăng ký mới theo ngày
  categoryDates: string[] = [];
  newUserStatistics: number[] = [];
  newProviderStatistics: number[] = [];
  loadNewUserStatistics: boolean = true;
  getUserStatistics() {
    this.loadNewUserStatistics = true;
    this.statisticService
      .getUserStatistics(this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.categoryDates = result.data.map((entry: any) => {
            return this.formatDateVi(entry.date);
          });
          this.newUserStatistics = result.data.map(
            (entry: any) => entry.totalUser
          );
          this.newProviderStatistics = result.data.map(
            (entry: any) => entry.totalProvider
          );
          this.loadNewUserStatistics = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadNewUserStatistics = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Tổng gói dữ liệu đã mua
  totalPackageDTO: TotalPackageDTO = new TotalPackageDTO();
  getTotalDataPackageByDate() {
    this.statisticService
      .getTotalDataPackageByDate(this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.totalPackageDTO = result.data;
          this.cdr.detectChanges();
        },
      });
  }
  totalPackageGrowPercent = 0;
  totalAmountGrowPercent = 0;
  growPercentTotalDataPackage() {
    this.statisticService
      .getTotalDataPackageByDate(this.preStartDate, this.preEndDate)
      .subscribe({
        next: (result) => {
          var temp: TotalPackageDTO = result.data;
          if (temp.totalPackage != 0) {
            this.totalPackageGrowPercent =
              ((this.totalPackageDTO.totalPackage - temp.totalPackage) /
                temp.totalPackage) *
              100;
          }
          if (temp.totalAmount != 0) {
            this.totalAmountGrowPercent =
              ((this.totalPackageDTO.totalAmount - temp.totalAmount) /
                temp.totalAmount) *
              100;
          }
          this.cdr.detectChanges();
        },
      });
  }

  // Gói sắp hết hạn
  subAboutToExpire: number = 0;
  getSubscriptionsAboutToExpire() {
    this.statisticService.getSubscriptionsAboutToExpire().subscribe({
      next: (result) => {
        this.subAboutToExpire = result.data;
        this.cdr.detectChanges();
      },
    });
  }

  // Chi phí sử dụng theo ngày
  categoryAmounts: string[] = [];
  amountPerDayList: number[] = [];
  loadAmountPerDay: boolean = true;
  getAmountPerDay() {
    this.loadAmountPerDay = true;
    this.statisticService
      .getAmountPerDay(this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.categoryAmounts = result.data.map((entry: any) => {
            return this.formatDateVi(entry.date);
          });
          this.amountPerDayList = result.data.map((entry: any) => {
            return entry.totalAmount;
          });
          this.loadAmountPerDay = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadAmountPerDay = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Thống kê lượt sử dụng api theo thời gian
  numberOfUsesPerDayList: any[] = [];
  loadNumberOfUsesPerDay: boolean = true;
  getNumberOfUsesPerDay() {
    this.loadNumberOfUsesPerDay = true;
    this.statisticService
      .getNumberOfUsesPerDay(this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.numberOfUsesPerDayList = result.data;
          this.loadNumberOfUsesPerDay = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadNumberOfUsesPerDay = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Thống kê lượt request mua và đã dùng của gói
  requestPackageList: RequestPackageDTO[] = [];
  loadRequestInfoPackage: boolean = true;
  requestPackageStatisticDTO: RequestPackageStatisticDTO[] = [];
  combinedData: any[] = [];
  getRequestPackage() {
    this.loadRequestInfoPackage = true;
    this.statisticService.getRequestPackage().subscribe({
      next: (result) => {
        this.requestPackageList = result.data;
        var subscriptionIds: number[] = this.requestPackageList.map(
          (p) => p.subscriptionId
        );
        this.statisticService
          .getRequestStatisticBySubscriptionIds(subscriptionIds)
          .subscribe({
            next: (result) => {
              this.requestPackageStatisticDTO = result.data;
              this.combinedData = this.requestPackageList
                .map((pkg) => {
                  // Tìm thông tin trong statistics dựa trên productId
                  const statistic = this.requestPackageStatisticDTO.find(
                    (stat) =>
                      stat.productId == pkg.productId &&
                      stat.subscriptionId == pkg.subscriptionId
                  );

                  // Nếu tìm thấy, kết hợp các thuộc tính lại
                  return statistic
                    ? {
                        productName: statistic.productName,
                        numberRequest: pkg.numberRequest,
                        totalRequest: statistic.totalRequest,
                        percentRequest:
                          (statistic.totalRequest / pkg.numberRequest) * 100,
                      }
                    : null;
                })
                .filter((item) => item !== null);
              this.loadRequestInfoPackage = false;
              this.cdr.detectChanges();
            },
          });

        this.cdr.detectChanges();
      },
      error: (e) => {
        this.loadRequestInfoPackage = false;
        this.cdr.detectChanges();
      },
    });
  }
  //end

  //doanh thu người bán theo ngày
  revenuePerDayList: number[] = [];
  categoryRevenueProvider: string[] = [];
  loadRevenuePerDay: boolean = true;
  totalRevenueOfProvider: number = 0;
  getRevenuePerDay() {
    this.loadRevenuePerDay = true;
    this.statisticService
      .getRevenuePerDay(this.userInfo.uid, this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.categoryRevenueProvider = result.data.map((entry: any) => {
            return this.formatDateVi(entry.date);
          });
          this.revenuePerDayList = result.data.map((entry: any) => {
            return entry.totalAmount;
          });
          this.totalRevenueOfProvider = result.data.reduce(
            (sum: number, e: any) => sum + e.totalAmount,
            0
          );
          this.loadRevenuePerDay = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadRevenuePerDay = false;
          this.cdr.detectChanges();
        },
      });
  }

  revenueGrowPercentOfProvider: number = 0;
  growPercentRevenueOfProvider() {
    this.statisticService
      .getRevenuePerDay(this.userInfo.uid, this.preStartDate, this.preEndDate)
      .subscribe({
        next: (result) => {
          var preTotalRevenueOfProvider = result.data.reduce(
            (sum: number, e: any) => sum + e.totalAmount,
            0
          );
          if (preTotalRevenueOfProvider > 0) {
            this.revenueGrowPercentOfProvider =
              ((this.totalRevenueOfProvider - preTotalRevenueOfProvider) /
                preTotalRevenueOfProvider) *
              100;
          }
        },
      });
  }

  countItemsWithinDateRange(
    data: any[],
    startDate: string,
    endDate: string
  ): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const count = data.filter((item) => {
      const createdAt = new Date(item.created_at.split('T')[0]);
      return createdAt >= start && createdAt <= end;
    }).length;

    return count;
  }

  myData: number = 0;
  growPercentMyData: number = 0;
  listProducts: any[] = [];
  dataOutOfBusiness: number = 0;
  getListProductIds() {
    this.productProviderService.getSearchOwner('', 1, 9999).subscribe({
      next: (result) => {
        this.listProducts = result;
        this.dataOutOfBusiness = this.listProducts.filter(
          (item) => item.visibility == false && item.approval_status == 1
        ).length;
        this.myData = this.countItemsWithinDateRange(
          result,
          this.startDate,
          this.endDate
        );
        var preMyData = this.countItemsWithinDateRange(
          result,
          this.preStartDate,
          this.preEndDate
        );
        if (preMyData > 0) {
          this.growPercentMyData =
            ((this.myData - preMyData) / preMyData) * 100;
        }
        var productIds: number[] = result.map((item: any) => {
          if (item.approval_status == 1) {
            return item.product_id;
          }
        });
        productIds = productIds.filter(e => e != undefined)
        this.productIdsRequest.productIds = productIds;
        this.productIdsRequest.startDate = this.startDate;
        this.productIdsRequest.endDate = this.endDate;
        this.getNumberOfRequestsPerDay(productIds);
        this.getTotalRevenueByProductIds();
        this.getTotalBuyByProductIds();
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  // Thống kê lượt request API theo dữ liệu
  numberOfRequestsPerDayList: any[] = [];
  loadNumberOfRequestsPerDay: boolean = true;
  getNumberOfRequestsPerDay(productIds: number[]) {
    this.loadNumberOfRequestsPerDay = true;
    this.statisticService
      .getNumberOfRequestsPerDay(productIds, this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.numberOfRequestsPerDayList = result.data;
          this.loadNumberOfRequestsPerDay = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadNumberOfRequestsPerDay = false;
          this.cdr.detectChanges();
        },
      });
  }

  //doanh thu theo gói dữ liệu
  productIdsRequest: ProductIdsRequest = new ProductIdsRequest();
  totalRevenueByProductIds: number[] = [];
  categoriesTotalRevenueByProductIds: string[] = [];
  loadTotalRevenueByProductIds: boolean = true;
  getTotalRevenueByProductIds() {
    this.loadTotalRevenueByProductIds = true;
    this.statisticService
      .getTotalRevenueByProductIds(this.productIdsRequest)
      .subscribe({
        next: (result) => {
          this.totalRevenueByProductIds = result.data.map(
            (item: any) => item.totalAmount
          );
          this.categoriesTotalRevenueByProductIds = result.data.map(
            (item: any) => {
              return this.listProducts.filter(
                (e) => e.product_id == item.productId
              )[0]?.description.name;
            }
          );
          this.loadTotalRevenueByProductIds = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadTotalRevenueByProductIds = false;
          this.cdr.detectChanges();
        },
      });
  }

  // lượt mua theo gói dữ liệu
  totalBuyByProductIds: number[] = [];
  categoriesTotalBuyByProductIds: string[] = [];
  loadTotalBuyByProductIds: boolean = true;
  getTotalBuyByProductIds() {
    this.loadTotalBuyByProductIds = true;
    this.statisticService
      .getTotalBuyByProductIds(this.productIdsRequest)
      .subscribe({
        next: (result) => {
          this.totalBuyByProductIds = result.data.map(
            (item: any) => item.totalBuy
          );
          this.categoriesTotalBuyByProductIds = result.data.map((item: any) => {
            return this.listProducts.filter(
              (e) => e.product_id == item.productId
            )[0]?.description.name;
          });
          this.loadTotalBuyByProductIds = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.loadTotalBuyByProductIds = false;
          this.cdr.detectChanges();
        },
      });
  }
}
