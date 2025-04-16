import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  inject,
} from '@angular/core';
import { BuyedService } from 'src/app/services/buyed.service';
import { ProductService } from 'src/app/services/product.service';
import { DecimalPipe } from '@angular/common';
import { ProviderDataService } from 'src/app/services/provider-data.service';
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalRef,
  NgbRatingConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { AuthHTTPService } from 'src/app/modules/auth/services/auth-http';
import { jwtVerify, SignJWT } from 'jose';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { offset } from '@popperjs/core';
import { AppConstants } from 'src/app/utils/app.constants';
import { BuyService } from 'src/app/services/buy.service';
import { take } from 'rxjs';
import { NgForm } from '@angular/forms';
import { RatingService } from 'src/app/services/rating.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buyed',
  templateUrl: './buyed.component.html',
  styleUrls: ['./buyed.component.scss'],
  providers: [MessageService],
})
export class BuyedComponent implements OnInit {
  loading: boolean = false;
  data: any; // Raw data from API
  tableData: any[] = [];
  selectedTableId: string | null = null;
  filteredData: any[] = []; // Filtered data after search
  pagedData: any[] = []; // Data displayed for the current page
  searchTerm: string = ''; // Search keyword
  currentPage: number = 1; // Current page
  pageSize: number = 10; // Number of records per page
  totalRecords: number = 0; // Total number of records (for pagination)
  selectedPaymentMethod: string = ''; // Lưu giá trị đã chọn
  selectedDataType: string = '';
  productId: number;
  urlValue = AppConstants.GATEWAY_API + 'get-data/fetch';
  selectedMethod = 'post';
  limit: number = 100;
  offset: number = 0;
  authorizationToken: string = '';
  hasRatingDetail: boolean;

  jsonPayload: string | null = null;
  api_key: any;
  modalReference: NgbModalRef;

  ratingContent: any;
  ratingStar = 0;
  ratingStatus: {[key: number]: boolean} = {};

  isLogin: boolean;
  token: string;
  profile: any;
  // Danh sách các tùy chọn thanh toán
  paymentOptions = [
    {
      plans: null,
      display: false,
      label: 'Trả sau',
      planType: 'POSTPAID',
      des: 'Người mua thanh toán qua mỗi lần query dữ liệu thông qua API',
    },
    {
      plans: null,
      display: false,
      label: 'Thanh toán 1 lần',
      planType: 'FULLPURCHASE',
      des: 'Người mua thanh toán sản phẩm một lần và sở hữu hoàn toàn dữ liệu ',
    },
    {
      plans: null,
      display: false,
      label: 'Thanh toán theo lượt',
      planType: 'PAYPERUSE',
      des: 'Người mua thanh toán và gia hạn theo chu kỳ',
    },
    {
      plans: null,
      display: false,
      label: 'Thuê bao',
      planType: 'DURATION',
      des: 'Người mua dùng thử sản phẩm theo chu kỳ và thanh toán sau khi chu kỳ hết hạn',
    },
    {
      plans: null,
      display: false,
      label: 'Miễn phí',
      planType: 'FREE',
      des: 'Miễn phí',
    },
  ];
  typeOptions = [
    { label: 'Phi cấu trúc', value: '0' },
    { label: 'Có cấu trúc', value: '1' },
  ];
  // Popup state
  isPopupVisible = false;
  selectedFilesDownload: any[] = [];

  constructor(
    private buyedService: BuyedService,
    private productService: ProductService,
    private providerDataService: ProviderDataService,
    private cdr: ChangeDetectorRef,
    private authService: AuthHTTPService,
    private messageService: MessageService,
    private modalJwt: NgbModal,
    private buyService: BuyService,
    private config: NgbRatingConfig,
    private modalService: NgbModal,
    private ratingService: RatingService,
    private router: Router,
  ) {
    config.max = 5;
  }

  codeMirrorOptions: any = {
    mode: 'markdown',
    indentWithTabs: true,
    smartIndent: true,
    lineNumbers: true,
    lineWrapping: false,
    // extraKeys: { "Ctrl-Space": "autocomplete" },
    // autoCloseBrackets: true,
    // matchBrackets: true,
  };

  // algorithmTokenType: '{ "alg": "HS256", "typ": "JWT"}';
  algorithmTokenType: string;
  private isOrderCreated = false;

  ngOnInit(): void {
    if (!this.isOrderCreated) {
      this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
      this.isOrderCreated = true;
      const createOrrderInput = localStorage.getItem('createOrrderFREE');
      localStorage.removeItem('createOrrderFREE');

      if (createOrrderInput) {
        this.buyService.createOrder(createOrrderInput).subscribe((data) => {
          const ouputOrderAPI = data?.data;
          localStorage.removeItem('createOrrderFREE');

          this.buyService.confirmOrder(ouputOrderAPI?.id).subscribe((data) => {
            // handle confirmation
          });
        });
      }
    }

    this.algorithmTokenType = JSON.stringify(
      {
        alg: 'HS256',
        typ: 'JWT',
      },
      null,
      2
    );
    this.loadData(); // Fetch initial data on component load
    this.checkIfRated(this.selectedProdId);
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
  }
  isRatingExists: boolean = false;

  checkIfRated(prodId: number): void {
    this.ratingService.getRatingDetailByProdId(prodId).subscribe({
      next: (res) => {
        if (res?.code === '200' && res.data?.length > 0) {
          this.isRatingExists = true; // Đánh giá đã tồn tại
          const rating = res.data[0]; // Giả sử mỗi sản phẩm chỉ có một đánh giá
          this.ratingStar = rating.rate;
          this.ratingContent = rating.content;
        } else {
          this.isRatingExists = false; // Sản phẩm chưa có đánh giá
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin đánh giá:', err);
      }
    });
  }

  checkingDuration(buyedDate: number, expiredDate: number) {
    const buyed = new Date(buyedDate * 1000);
    const expired = new Date(expiredDate * 1000);

    const diffInHours = (expired.getTime() - buyed.getTime()) / (1000 * 3600);

    if(diffInHours == 0) {
      return 'Hết hạn';
    } else if (diffInHours <= 240) {
      return 'Sắp hết hạn';
    } else {
      return 'Đang sử dụng';
    }
  }

  convertTimestamptoDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

  }

  extendPayment(item: any) {
    console.log('item found: ', item);
    const payload = {
      productId: item.productId,
      productName: item.productName,
      productPlanId: item.productPlanDto.id,
      productProviderName: item.productProviderName,
      productPlanOptionId: item.productPlanOptionId,
    }

    console.log('payload: ', payload)

    this.buyedService.extendPackage(payload).subscribe({
      next: (res) => {
        console.log('success: ', res);
        this.onCreateExtendOrderSuccess(res.data.id);
      },
      error: (err) => {
        console.error('error: ', err);
      }
    })
  }

  onCreateExtendOrderSuccess(orderId: number) {
    this.router.navigate(['/buy', orderId], {
      state: {isExtendPackagePurchase: true}
    })
  }

  onRateChange(value: number) {
    console.log('Rating value:', value);
    this.ratingStar = value;
    console.log('current star: ', this.ratingStar);
  }

  onPostRating() {
    console.log('current prod id: ', this.productId);
  }

  getUserByToken() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    if (!!this.token) {
      this.authService.getUserByToken(this.token).subscribe((res) => {
        if (res) {
          this.isLogin = true;
          this.profile = res;

          const selectedFields = {
            iss: this.profile.sub,
            aud: this.profile.sub,
            sub: this.profile.sub,
            uid: this.profile.uid.toString(),
          };
          this.jsonPayload = JSON.stringify(selectedFields, null, 2);
          this.api_key = this.profile.api_key;

          this.authorizationToken = this.token;
        } else {
          this.isLogin = false;
          this.jsonPayload = null;
        }
        this.cdr.detectChanges();
      });
    }
  }

  setTokenType(event: any) {}

  loadData(): void {
    this.loading = true;

    // Make API call to fetch data
    this.buyedService
      .getSearch(
        this.searchTerm,
        this.selectedDataType,
        this.selectedPaymentMethod,
        this.currentPage - 1,
        this.pageSize
      )
      .subscribe(
        (response) => {
          // Assuming the API returns 'data' for the items and 'recordsTotal' for total count
          this.data = response.data; // Assign data from API response
          this.pagedData = response.data;
          this.totalRecords = response.recordsTotal; // Total records for pagination

          const detailRequests = this.data.map((item: any) =>
            this.productService
              .getDetailProductItems(item.productId)
              .toPromise()
          );

          // const id = this.data.map((item: any) => item)

          

          // Wait for all detail requests to complete
          Promise.all(detailRequests)
            .then((detailResponses) => {
              detailResponses.forEach((detailResponse, index) => {
                // Assign the detail product data to the corresponding item in this.data
                this.data[index].dataItem = detailResponse;
              });

              // Update filteredData and notify Angular to refresh the UI
              this.filteredData = this.data; // Initially, no filtering is applied
              this.cdr.detectChanges(); // Notify Angular to update the UI
              this.loading = false;
            })
            .catch((error) => {
              console.error('Error fetching product details:', error);
              this.loading = false;
            });
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );

      // this.ratingService.getRatingDetailByProdId(this.selectedProdId).subscribe({
      //   next: (res) =>{
      //     if(res.data && res?.code === '200') {
      //       this.ratingStar = res?.data.rate;
      //       this.ratingContent = res?.data.content;
      //       this.ratingStatus[this.selectedProdId] = true;
      //     }
      //   }
      // })
  }

  selectedProdName: string;
  selectedProdProviderName: string;
  ratingId: number;

  openModalRating(content: TemplateRef<any>, prodId: number, prodName: string, providerName: string) {
    this.selectedProdId = prodId;
    this.selectedProdName = prodName;
    this.selectedProdProviderName = providerName;
    

    this.ratingService.getRatingDetailByProdId(this.selectedProdId).subscribe({
      next: (res) =>{
        if(res.data && res?.code === '200') {
          this.hasRatingDetail = true;
          this.ratingStar = res?.data.rate;
          this.ratingId = res?.data.id;
          this.ratingContent = res?.data.content;
          this.ratingStatus[this.selectedProdId] = false;
        } else {
          this.hasRatingDetail = false;

          this.ratingStar = 0;
          this.ratingContent = '';
        }
      },
      error: (err) => {
        console.error('err: ', err);
      }
    })
    console.log('Current Product ID:', this.selectedProdId);
    this.modalService.open(content, {
      windowClass: 'my-class',
    });
  }

  onDeleteRating(id: number) {
    this.ratingService.deleteRating(id).subscribe({
      next: (res) => {
        console.log('success: ', res);
        if(this.selectedProdId !== null) {
          this.ratingStatus[this.selectedProdId] = true;
        }
        this.showNotification(
          'success',
          'Thông báo',
          'Xóa đánh giá thành công',
          3000
        );
        this.onCloseModalCancel();
      },
      error: (err) => {
        console.error('error: ', err);
        this.showNotification(
          'error',
          'Thông báo lỗi',
          'Xóa đánh giá thất bại',
          3000
        );
        this.onCloseModalCancel();
      }
    })
  }

  onSubmitRating() {
   

    const payload = {
      prodId: this.selectedProdId,
      rate: this.ratingStar,
      content: this.ratingContent,
    };

    console.log('payload: ', payload);
    if (this.hasRatingDetail) {
      this.ratingService.updateRating(payload).subscribe({
        next: (res) => {
          console.log('success: ', res);
          if(this.selectedProdId !== null) {
            this.ratingStatus[this.selectedProdId] = true;
          }
          this.showNotification(
            'success',
            'Thông báo',
            'Cập nhật đánh giá thành công',
            3000
          );
          this.onCloseModalCancel();
        },
        error: (err) => {
          console.error('error: ', err);
          this.showNotification(
            'error',
            'Thông báo lỗi',
            'Cập nhật đánh giá thất bại',
            3000
          );
          this.onCloseModalCancel();
        }
      })
    } else {
      this.ratingService.postRating(payload).subscribe({
        next: (res) => {
          console.log('success: ', res);
          if(this.selectedProdId !== null) {
            this.ratingStatus[this.selectedProdId] = true;
          }
          this.showNotification(
            'success',
            'Thông báo',
            'Gửi đánh giá thành công',
            3000
          );
          this.onCloseModalCancel();
        },
        error: (err) => {
          console.error('error: ', err);
          this.showNotification(
            'error',
            'Thông báo lỗi',
            'Gửi đánh giá thất bại',
            3000
          );
          this.onCloseModalCancel();
        }
      })
    }

  }

  showNotification(
    severity: string,
    summary: string,
    detail: string,
    lifetime: number
  ) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      life: lifetime,
    });
  }

  selectedProdId: number = 0;

  onRatingChange(newRating: number) {
    console.log('new rating: ', newRating);
  }

  clickrating() {
    var num1 = this.ratingStar;
    console.log(num1);
  }

  onClickItem(content: TemplateRef<any>, id: number) {
    this.getUserByToken();
    this.getTableofDataProduct(id);
    this.modalReference = this.modalJwt.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'my-class',
    });

    this.modalReference.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  convertTimestampToDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
  }
  onSearch(): void {
    this.currentPage = 1; // Reset to the first page when searching
    this.loadData(); // Fetch filtered data based on search term
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.totalRecords / this.pageSize)) {
      this.currentPage = page;
      this.loadData(); // Lấy dữ liệu trang mới
    }
  }

  getTypeLabel(planType: string | null) {
    // Nếu planType là null, gán giá trị mặc định là "0"
    const normalizedPlanType = planType === null ? '0' : planType;

    const option = this.typeOptions.find(
      (option) => option.value === normalizedPlanType
    );
    return option ? option.label : normalizedPlanType;
  }

  getPlanLabel(planType: string | null) {
    const option = this.paymentOptions.find(
      (option) => option.planType === planType
    );
    return option ? option.label : planType;
  }

  getTableofDataProduct(id: number) {
    this.buyedService.getTable(id).subscribe((res) => {
      this.tableData = res;
    });
  }

  async decodeNewToken() {
    if (this.jsonPayload && this.api_key) {
      const payload = JSON.parse(this.jsonPayload);

      const options = {
        algorithm: 'HS256' as const,
        expriesIn: '2h',
      };

      try {
        const newToken = await new SignJWT(payload)
          .setProtectedHeader({ alg: options.algorithm })
          .setExpirationTime(options.expriesIn)
          .sign(new TextEncoder().encode(this.api_key));
        return newToken;
      } catch (error) {}
    }
  }

  onCopyApiKey() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Copied to Clipboard',
    });
  }

  async generateCUrl(): Promise<string> {
    const url = this.urlValue;
    const method = this.selectedMethod.toUpperCase();

    const newToken = await this.decodeNewToken();
    if (!newToken) {
      return '';
    }

    let cUrlCommand = `curl --location --request ${method} '${url}'`;

    if (newToken && this.selectedTableId) {
      cUrlCommand += `  \\\n--header 'Authorization: Bearer ${newToken}'
                          \\\n--form 'table_id="${this.selectedTableId}"'
                          \\\n--form 'limit="${this.limit}"'
                          \\\n--form 'offset="${this.offset}"'
      `;
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Vui lòng chọn bảng dữ liệu',
        life: 3000,
      });
      return '';
    }

    return cUrlCommand;
  }

  async copyToClipboard() {
    const cUrlCommand = await this.generateCUrl();
    if (cUrlCommand) {
      navigator.clipboard.writeText(cUrlCommand).then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sao chép thành công!',
          detail: 'Vui lòng sử dụng restclient để lấy dữ liệu.',
          life: 3000,
        });
      });
    }
  }

  onMethodChange(event: any): void {
    this.selectedMethod = event.target.value;
  }

  onTableChange(event: any) {
    const selectedTable = this.tableData.find(
      (table) => table.name === event.target.value
    );
    if (selectedTable) {
      this.selectedTableId = selectedTable.table_id;
    }
  }

  formatNumber(amount: number): string {
    if (amount == null) return '';
    return amount.toLocaleString('en-GB'); // 'en-GB' tự động dùng dấu phẩy
  }

  // private modalJwt = inject(NgbModalRef);
  closeResult: string;

  open(content: TemplateRef<any>) {
    this.getUserByToken();
    this.modalReference = this.modalJwt.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'my-class',
    });

    this.modalReference.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onCloseModal() {
    this.modalReference.close();
    this.selectedTableId = '';
    this.resetCopyApikey();
  }

  onCloseModalCancel(): void {
    this.modalService.dismissAll();
  }

  isCopyApikey: boolean = false;

  toggleCopyApikey() {
    this.isCopyApikey = !this.isCopyApikey;

    navigator.clipboard.writeText(this.api_key).then(() => {
      this.isCopyApikey = true;
      this.onCopyApiKey();
    });
  }

  resetCopyApikey() {
    this.isCopyApikey = false;
  }

  getFileDownload(item: any) {
    this.selectedFilesDownload = []; // Xóa dữ liệu trước đó
    this.isPopupVisible = true;

    // Lọc tất cả các hình ảnh có `type = "example"`
    // const exampleImages = item.detailProduct.images.filter(
    //   (image: any) => image.type === 'example'
    // );

    if (item.dataItem && item.dataItem.length > 0) {
      // Lặp qua tất cả các hình ảnh phù hợp
      item.dataItem.forEach((exampleImage: any) => {
        const productImageId = exampleImage.file_id;

        // Gọi API để lấy `download_link` cho từng hình ảnh
        this.providerDataService.getFileDownload(productImageId).subscribe(
          (res: any) => {
            if (res && res.download_link) {
              this.selectedFilesDownload.push(res);
            }
          },
          (err: any) => {
            console.error(`Lỗi khi tải dữ liệu : ${productImageId}`, err);
          }
        );
      });
    } else {
      console.error('Không có bản ghi nào');
    }
  }

  // Close the popup
  closePopup() {
    this.isPopupVisible = false;
  }
}
