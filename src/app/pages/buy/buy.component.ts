import {Component, OnInit, ViewChild} from '@angular/core';
import {ModalComponent, ModalConfig} from '../../_metronic/partials';
import {BuyService} from "../../services/buy.service";
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';
import { AuthService } from 'src/app/modules/auth';
import { MessageService } from 'primeng/api';
import { WarehouseManagementService } from 'src/app/services/warehouse-management.service';
import { BuyedService } from 'src/app/services/buyed.service';

interface OrderDetail {
  id?: number;
  name?: string;
  planName?: string;
  amount?: number;
  ram?: string;
  rom?: string;
  cpu?: string;
  hourOfUse?: number;
}

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
  providers: [MessageService]
})
export class BuyComponent implements OnInit {
  loading: boolean = false; // Trạng thái loading

  status: 'active' | 'inactive' = 'inactive'; // Trạng thái ban đầu

  extendOrderId: number;
  extendPlanName: string;
  orderDetail: OrderDetail;
  warehousePurchaseId: number;
  warehouseOrderDetail: any;
  warehouseOrderProductId: number;
  isWarehouseOrder: any;
  isExtendOrder: any;
  isConfirmed = false;
  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;

  planByProductIdData: any[] = [];
  plans: any[] = [];
  productID = 2;
  constructor(
    private buyService: BuyService,
    private buyedService: BuyedService,
    private warehouseService: WarehouseManagementService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  activeStep = 1; // Bước hiện tại

  // Danh sách các tùy chọn thanh toán
  // Danh sách các tùy chọn thanh toán
  paymentOptions = [
    {
      plans: null,
      display: false,
      label: 'Gói cước request',
      planType: 'REQUEST',
      des: 'Khách hàng sử dụng dữ liệu trong 01 năm, hết thời gian hệ thống sẽ khóa sử dụng.',
    },
    {
      plans: null,
      display: false,
      label: 'Thanh toán 1 lần',
      planType: 'FULLPURCHASE',
      des: 'Khách hàng mua dữ liệu thanh toán 01 lần duy nhất, được sử dụng dữ liệu vĩnh viễn.',
    },
    {
      plans: null,
      display: false,
      label: 'Tải 1 lượt duy nhất',
      planType: 'PAYPERUSE',
      des: 'Khách hàng mua dữ liệu được sử dụng 1 lần duy nhất, lần sử dụng tiếp theo khách hàng cần thực hiện mua lại để tiếp tục sử dụng.',
    },
    {
      plans: null,
      display: false,
      label: 'Gói cước theo chu kỳ',
      planType: 'DURATION',
      des: 'Người mua dùng thử sản phẩm theo chu kỳ và thanh toán sau khi chu kỳ hết hạn',
    },
  ];

  // Danh sách các kỳ hạn cho POSTPAID
  postpaidPeriods = [
    { label: 'Hàng ngày', value: 'DAILY' },
    { label: 'Hàng tháng', value: 'MONTHLY' },
    { label: 'Hàng Năm', value: 'YEARLY' },
  ];

  requestOptions: any[] = [];
  selectedRequestOption: any;
  selectedRequestOptionObject: any;
  // Cập nhật kiểu cho selectedPeriod
  // selectedPeriod: 'daily' | 'monthly' | 'yearly' | null = null;
  //selectedPeriod: 'DAILY' | 'MONTHLY' | 'YEARLY' = 'MONTHLY';

  // Các gói dịch vụ tương ứng với từng kỳ hạn
  packages: Record<
    'daily' | 'monthly' | 'yearly',
    { name: string; price: number; description: string }[]
  > = {
    daily: [
      {
        name: 'Gói cơ bản',
        price: 10000,
        description: 'Gói dành cho nhu cầu cơ bản hàng ngày.',
      },
      {
        name: 'Gói tiêu chuẩn',
        price: 20000,
        description: 'Gói phổ biến dành cho người dùng trung bình.',
      },
      {
        name: 'Gói nâng cao',
        price: 30000,
        description: 'Gói cao cấp với nhiều tính năng nâng cao.',
      },
    ],
    monthly: [
      {
        name: 'Gói cơ bản',
        price: 200000,
        description: 'Gói dành cho nhu cầu cơ bản hàng tháng.',
      },
      {
        name: 'Gói tiêu chuẩn',
        price: 400000,
        description: 'Gói phổ biến dành cho người dùng trung bình.',
      },
      {
        name: 'Gói nâng cao',
        price: 600000,
        description: 'Gói cao cấp với nhiều tính năng nâng cao.',
      },
    ],
    yearly: [
      {
        name: 'Gói cơ bản',
        price: 2000000,
        description: 'Gói dành cho nhu cầu cơ bản hàng năm.',
      },
      {
        name: 'Gói tiêu chuẩn',
        price: 4000000,
        description: 'Gói phổ biến dành cho người dùng trung bình.',
      },
      {
        name: 'Gói nâng cao',
        price: 6000000,
        description: 'Gói cao cấp với nhiều tính năng nâng cao.',
      },
    ],
  };
  // Thông tin sản phẩm
  product = {
    image: './assets/media/logos/login-logo.png', // Thay bằng đường dẫn hình ảnh thực tế
    name: 'Sản phẩm A Bán hang',
    description:
      'Mô tả sản phẩm Asản phẩm A sản phẩm A sản phẩm A sản phẩm A  ',
    unitPrice: 100000, // Đơn giá
    totalPrice: 200000, // Thành tiền
    tax: 20000, // Thuế
    finalAmount: 220000, // Tổng tiền
  };

  // Danh sách phương thức thanh toán
  paymentMethods = [
    {
      label: 'Thanh toán qua QR code',
      value: 'QR',
      image: './assets/media/misc/qr_code_PNG10 1.png',
      disable: false,
    },
    {
      label: 'Thanh toán bằng Visa',
      value: 'VISA',
      image: './assets/media/misc/Visa_Inc._logo.svg 1.png',
      disable: true,
    },
    {
      label: 'Thanh toán bằng ví điện tử',
      value: 'E-wallet',
      image: './assets/media/misc/wallet.png',
      disable: true,
    },
    {
      label: 'Thanh toán bằng thẻ nội địa',
      value: 'DomesticCard',
      image: './assets/media/misc/credit-card.png',
      disable: true,
    },
  ];

  // Phương thức thanh toán đã chọn
  selectedPaymentMethod: string | null = null;

  // Thông tin mã QR đã quét
  scannedQRCode: string | null = null;

  selectedOption: string | null = null; // Lưu trữ tùy chọn đã chọn

  selectedOptionplanByProductId: any; //b1 chọn

  // Danh sách các kỳ hạn cho POSTPAID
  postpaidPeriodsOptionplanByProductId: any; //b2 chọn

  durationMapping = [
    { label: 'Hàng ngày', value: 'DAILY' },
    { label: 'Hàng tháng', value: 'MONTHLY' },
    { label: 'Hàng Năm', value: 'YEARLY' },
  ];
  selectedPeriod: string | null = null;
  // Các gói dịch vụ tương ứng với từng kỳ hạn
  packagesPeriodsOptionplanByProductId: any; //b3 chọn

  filteredPackages: any[] = []; // Dữ liệu đã lọc theo selectedPeriod

  ouputOrderAPI: any;
  outputConfirmOrderAPI: any;
  outputStatusOrderAPI: any;
  packageChooseData: any;

  //
  countdownMinutes: number = 5;
  countdownSeconds: number = 0;
  countdownInterval: any;
  dataProduct: any;


  selectedOptionDetails: {
    label: string;
    unitPrice: number;
    amount: number;
    total: number;
  } | null = null;

  user:any;
  isPOSTPAID:boolean=false;
  ngOnInit(): void {

    this.authService.getUserByToken().subscribe((data) => {
      this.user = data;
      if(data.payment_type==='POSTPAID' || data.account?.payment_type==='POSTPAID'){
          this.isPOSTPAID=true;
      }else{
        this.isPOSTPAID=false;
      }
    });


    // Lấy id từ URL
    this.productID = Number(this.route.snapshot.paramMap.get('id'));
    this.getDetailProduct();
    this.updatePackageDetails();
    // Clone danh sách để không làm thay đổi bản gốc
    const mergedOptions = [...this.paymentOptions];

    this.buyService.getPlanByProductId(this.productID).subscribe((data) => {
      if (data?.data && Array.isArray(data.data)) {
        const apiItems = data.data;
        // Merge danh sách
        this.planByProductIdData = this.paymentOptions.map((option) => {
          const match = apiItems.find(
            (apiItem: { planType: string }) =>
              apiItem.planType === option.planType
          );
          // Nếu tìm thấy dữ liệu khớp, thêm `plans`
          if (match) {
            return {
              ...option,
              display: true, // Kích hoạt hiển thị
              plans: match, // Gán dữ liệu chi tiết từ API
            };
          }
          return option;
        });
        console.log("this.planByProductIdData", this.planByProductIdData)
        const firstObjectWithPlans = this.planByProductIdData.find(item => item.plans !== null);

        const datan= firstObjectWithPlans;
        const selectDefault = firstObjectWithPlans.planType;
        this.updateDetails(selectDefault, datan)
      } else {
        this.planByProductIdData = [];
      }
      this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
    });

    const state = history.state;
    console.log("State:", state);
    if (state && state.isWarehousePurchase) {
        this.warehousePurchaseId = Number(this.route.snapshot.paramMap.get('id'));
        this.isWarehouseOrder = state.isWarehousePurchase;

        console.log("warehouse id: ", this.warehousePurchaseId);
        this.goToNextStep();


    }
    else if (state && state.isExtendPackagePurchase) {
      this.extendOrderId = Number(this.route.snapshot.paramMap.get('id'));
        console.log('extendOrderId: ', this.extendOrderId);

        this.isExtendOrder = state.isExtendPackagePurchase;
        this.goToNextStep();
    }
    else {
      this.goToPreviousStep();
    }

  }

  showNotification(severity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: lifetime })
  }

  // Hàm xử lý thay đổi giá trị
  onRequestOptionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedValue = Number(target.value);

    // Tìm đối tượng option tương ứng
    this.selectedRequestOptionObject =
      this.selectedOptionplanByProductId.planOptions.find(
        (option: { requestNumber: number }) =>
          option.requestNumber == selectedValue
      );

    console.log(
      'this.selectedRequestOption Option:',
      this.selectedRequestOptionObject
    );
    // Thực hiện các hành động khác tại đây
  }

  selectedPlanAdditionServicesValues: number[] = [];

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = +checkbox.value;

    if (checkbox.checked) {
      this.selectedPlanAdditionServicesValues.push(value);
    } else {
      this.selectedPlanAdditionServicesValues =
        this.selectedPlanAdditionServicesValues.filter((v) => v !== value);
    }
  }

  getDetailProduct() {
    this.productService.getDetailProduct(this.productID).subscribe((data) => {
      this.dataProduct = data;
    });
  }
  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      if (this.countdownSeconds === 0) {
        if (this.countdownMinutes === 0) {
          clearInterval(this.countdownInterval);
          console.log('Hết thời gian!');
        } else {
          this.countdownMinutes--;
          this.countdownSeconds = 59;
        }
      } else {
        this.countdownSeconds--;
      }
      // Cập nhật giao diện
      this.cdr.detectChanges();
    }, 1000);
  }

  // Chuyển sang bước tiếp theo là tạo đơn
  goToNextStep(): void {
    this.status = this.status === 'inactive' ? 'active' : 'inactive';

    const state = history.state;
    console.log("State:", state);

    if (this.selectedOption ) {
      this.activeStep = 2;
      var createOrrderInput = null;
      if (this.selectedOptionplanByProductId?.planType === 'DURATION') {
        createOrrderInput = {
          paymentType: "PREPAID",
          productName: this.dataProduct?.description?.name,
          productType: this.dataProduct?.data_type,
          providerId:this.dataProduct?.owner_id,
          productProviderName: this.dataProduct?.provider_name,
          productId: this.productID,
          productPlanId: this.selectedOptionplanByProductId.id,
          productPlanOptionId: this.packageChooseData?.id,
          duration: this.packageChooseData?.optionDuration,
          amount: this.packageChooseData?.optionPrice,
          status: 'CREATED',
          paymentId: 'string',
          additionServiceIds:
            this.selectedPlanAdditionServicesValues &&
            this.selectedPlanAdditionServicesValues.length > 0
              ? this.selectedPlanAdditionServicesValues
              : [],
        };
      }else if (this.selectedOptionplanByProductId?.planType === 'REQUEST') {
        createOrrderInput = {
          paymentType: "PREPAID",
          productName: this.dataProduct?.description?.name,
          productType: this.dataProduct?.data_type,
          providerId:this.dataProduct?.owner_id,
          productProviderName: this.dataProduct?.provider_name,
          productId: this.productID,
          productPlanId: this.selectedOptionplanByProductId.id,
          productPlanOptionId: this.selectedRequestOptionObject?.id,
          duration: this.selectedRequestOptionObject?.optionDuration,
          amount: this.selectedRequestOptionObject.optionPrice,
          status: 'CREATED',
          paymentId: 'string',
          additionServiceIds:[],
        };
      }  else {
        createOrrderInput = {
          paymentType: "PREPAID",
          productName: this.dataProduct?.description?.name,
          productType: this.dataProduct?.data_type,
          providerId:this.dataProduct?.owner_id,
          productProviderName: this.dataProduct?.provider_name,
          productId: this.productID,
          productPlanId: this.selectedOptionplanByProductId.id,
          productPlanOptionId: this.packageChooseData?.id,
          duration: this.packageChooseData?.optionDuration,
          amount: this.selectedOptionplanByProductId?.basePrice,
          status: 'CREATED',
          paymentId: 'string',
          additionServiceIds: [], //this.selectedPlanAdditionServicesValues
        };
      }
      if(this.isPOSTPAID){
        this.buyService.createOrder(createOrrderInput).subscribe((data) => {
          this.ouputOrderAPI = data?.data;
          this.orderDetail = {
            id: data?.data.id,
            name: data?.data.productName,
            amount: data?.data.amount
          };

          if(!this.isConfirmed) {
            this.isConfirmed = true;

            this.buyService.confirmOrder(this.ouputOrderAPI?.id).subscribe((data) => {
              this.ouputOrderAPI = data?.data;
              if(this.ouputOrderAPI.code==='200'){

                this.messageService.add({
                  severity: 'success',
                  summary: 'Thực hiện thành công!',
                  life: 3000
                });
                //Delay navigation by 3 seconds
                setTimeout(() => {
                  this.router.navigate(['/buyed']); // Thay thế '/your-information-page' với đường dẫn thực tế
                }, 3000);
              }else{
                this.messageService.add({
                  severity: 'error',
                  summary: 'Thực hiện không thành công!',
                  life: 3000
                });
              }

              this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
            });

          }
        });
      }else{
        this.buyService.createOrder(createOrrderInput).subscribe((data) => {
          this.ouputOrderAPI = data?.data;

          this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
        });
      }
    }

    if (state.isWarehousePurchase) {
      this.activeStep = 2;
      this.buyService.getDetailOrder(this.warehousePurchaseId).subscribe(res => {
        console.log("order detail: ", res.data);
        this.ouputOrderAPI = res.data;
        if(res.data.productId) {
          this.warehouseOrderProductId = res.data.productId;
          this.warehouseService.getWarehouseOrderDetail(this.warehouseOrderProductId).subscribe({
            next: (res) => {
              this.orderDetail = {
                id: res?.data.id,
                name: res?.data.warehouseName,
                amount: res?.data.priceOneHour * res?.data.hourOfUse,
                ram: res?.data.ram,
                rom: res?.data.rom,
                cpu: res?.data.cpu,
                hourOfUse: res?.data.hourOfUse
              };
              console.log("order detail: ", this.orderDetail);
            },
            error: (err) => {
              console.error('error: ', err);
            }
          })
        }
        // this.warehouseOrderProductId = this.ouputOrderAPI.productId;
        console.log("order warehouse id: ", this.warehouseOrderProductId);
      })
      this.buyService.confirmOrder(this.warehouseOrderDetail).subscribe(res => {
        if(res?.code === '200') {
          this.messageService.add({
            severity: 'success',
            summary: 'Thực hiện thành công!',
            life: 3000
          });
          setTimeout(() => {
            this.router.navigate(['/buyed']); // Thay thế '/your-information-page' với đường dẫn thực tế
          }, 3000);
        }
        else {
          this.messageService.add({
            severity: 'error',
            summary: 'Thực hiện không thành công!',
            life: 3000
          });
        }
      })
    }

    if (state.isExtendPackagePurchase) {
      this.activeStep = 2;
      this.buyService.getDetailOrder(this.extendOrderId).subscribe({
        next: (res) => {
          this.ouputOrderAPI = res.data;
          console.log('res: ', res.data)
          this.orderDetail = {
            name: res?.data.productName,
            amount: res?.data.amount
          }
          this.buyService.getPlanByProductId(res?.data.productId).subscribe({
            next: (res) => {
              console.log('res: ', res.data)
              this.extendPlanName = res?.data[0].planName;
              console.log('extendPlanName: ', res.data[0].planName);
            }
          })

        },
        error: (err) => {
          console.error('error: ', err)
        }
      })
      // this.buyService.confirmOrder(this.extendOrderId).subscribe(res => {
      //   if(res?.code === '200') {
      //     this.messageService.add({
      //       severity: 'success',
      //       summary: 'Thực hiện thành công!',
      //       life: 3000
      //     });
      //     setTimeout(() => {
      //       this.router.navigate(['/buyed']); // Thay thế '/your-information-page' với đường dẫn thực tế
      //     }, 3000);
      //   }
      //   else {
      //     this.messageService.add({
      //       severity: 'error',
      //       summary: 'Thực hiện không thành công!',
      //       life: 3000
      //     });
      //   }
      // })
    }


  }

  // Quay lại bước trước
  goToPreviousStep(): void {
    this.activeStep = 1;
  }

  // Hoàn tất quá trình
  completeProcess(): void {
    console.log('Quá trình hoàn tất với lựa chọn:', this.selectedOption);
    alert(`Hoàn tất! Bạn đã chọn hình thức: ${this.selectedOption}`);
  }
  selectedUpdateDetails: any;
  // Cập nhật thông tin chi tiết khi chọn tùy chọn
  updateDetails(selectedValue: string, data: any) {
    this.selectedUpdateDetails = data;
    this.selectedOption = selectedValue;
    // Tìm thông tin chi tiết của tùy chọn đã chọn
    const planMergeSelected = this.planByProductIdData.find(
      (option) => option.planType === selectedValue
    );

    this.selectedOptionplanByProductId = planMergeSelected?.plans;
    // Kiểm tra dữ liệu hợp lệ
    if (
      this.selectedOptionplanByProductId &&
      this.selectedOptionplanByProductId.planOptions &&
      Array.isArray(this.selectedOptionplanByProductId.planOptions)
    ) {
      this.postpaidPeriodsOptionplanByProductId = Array.from(
        new Set<string>(
          this.selectedOptionplanByProductId.planOptions.map(
            (option: any) => option.optionDuration
          )
        )
      ).map((duration: string) => {
        // Tìm nhãn tương ứng từ durationMapping
        const mapping = this.durationMapping.find(
          (map) => map.value === duration
        );
        return mapping ? mapping : { label: 'Không xác định', value: duration };
      });

      // Tự động chọn giá trị đầu tiên (nếu danh sách không rỗng)
      if (this.selectedOptionplanByProductId.planOptions.length > 0) {
        this.selectedRequestOption =
          this.selectedOptionplanByProductId.planOptions[0].requestNumber;
        this.selectedRequestOptionObject =
          this.selectedOptionplanByProductId.planOptions[0];
      }
    } else {
      console.error('Dữ liệu không hợp lệ hoặc không tồn tại');
      this.postpaidPeriodsOptionplanByProductId = [];
    }

    if(selectedValue=== 'DURATION'){
      this.updatePackageGiaoDien(data.plans.planOptions[0])
    }
    if(this.selectedOptionplanByProductId?.planType==='REQUEST'){
       // Tự động chọn giá trị đầu tiên (nếu danh sách không rỗng)
       if (this.selectedOptionplanByProductId.planOptions.length > 0) {
        this.selectedRequestOption =
          this.selectedOptionplanByProductId.planOptions[0].requestNumber;
        this.selectedRequestOptionObject =
          this.selectedOptionplanByProductId.planOptions[0];
      }
    }


    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
  }
  optionChukyGiaodien: any;
  // Hàm cập nhật gói dịch vụ khi chọn kỳ hạn
  updatePackageGiaoDien(packageChoose: any) {
    this.optionChukyGiaodien = packageChoose;
    // this.packageChooseData=null;
    // // Kiểm tra nếu có dữ liệu
    // if (this.selectedOptionplanByProductId?.planOptions) {
    //   this.filteredPackages = this.selectedOptionplanByProductId.planOptions;
    // }
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện

  }
  // Hàm cập nhật gói dịch vụ khi chọn kỳ hạn
  updatePackageDetails() {
    this.packageChooseData = null;
    // Kiểm tra nếu có dữ liệu
    if (this.selectedOptionplanByProductId?.planOptions) {
      this.filteredPackages = this.selectedOptionplanByProductId.planOptions;
    }
  }

  updatePackageChoose(packageChoose: any) {
    this.packageChooseData = packageChoose;
    this.selectedPlanAdditionServicesValues = [];
    this.goToNextStep();
  }

  confirmOrder(method: string) {
    // this.loading = true; // Bật trạng thái loading
    this.selectedPaymentMethod = method; // Cập nhật giá trị của radio button
    // Giả lập quét mã QR
    this.scannedQRCode = 'QR_CODE_123456'; // Dữ liệu từ việc quét QR

    // Gọi API xác nhận đơn hàng
    this.buyService.confirmOrder(this.ouputOrderAPI?.id).subscribe({
      next: (data) => {
        this.outputConfirmOrderAPI = data?.data;
        this.startCountdown();

        // Cập nhật giao diện
        this.cdr.detectChanges();
        // Đợi 3 giây trước khi kiểm tra trạng thái đơn hàng
        setTimeout(() => this.getOrderStatus(), 15000);
      },
      error: (error) => {
        console.error('Lỗi khi gọi API confirmOrder:', error);
        // this.showError('Đã xảy ra lỗi khi xác nhận đơn hàng. Vui lòng thử lại!');
        //  this.loading = false; // Tắt loading nếu xảy ra lỗi
      },
      complete: () => {
        // Tắt loading khi API hoàn tất
        // this.loading = false;
      },
    });
  }

  getOrderStatus() {
    // Nếu không có `PaymentId` hoặc `id`, không gọi API
    if (!this.ouputOrderAPI?.id || !this.outputConfirmOrderAPI?.PaymentId) {
      console.error('Thiếu thông tin để gọi API getPaymentStatus');
      return;
    }

    // Gọi API kiểm tra trạng thái thanh toán
    this.buyService
      .getPaymentStatus(
        this.ouputOrderAPI?.id,
        this.outputConfirmOrderAPI?.PaymentId
      )
      .subscribe({
        next: (data) => {

          const state = history.state;
          console.log("State:", state);
          // Kiểm tra nếu PaymentStatus = 2
          if (data?.PaymentStatus === 2) {
            if (state.isWarehousePurchase) {
              console.log('Giao dịch thành công!');

              this.outputStatusOrderAPI = data;

              // Cập nhật giao diện
              this.cdr.detectChanges();

              this.loading = false; // Dừng trạng thái loading nếu có

              this.showNotification('success', 'Thông báo', 'Thanh toán warehouse thành công!', 2000);

              // Đợi 5 giây rồi chuyển hướng về trang thông tin
              setTimeout(() => {
                this.router.navigate(['/warehouse-management']); // Thay thế '/your-information-page' với đường dẫn thực tế
              }, 5000); // 5000ms = 5 giây

              return; // Kết thúc vòng gọi API
            }
            else if (state.isExtendPackagePurchase) {
              console.log('Giao dịch thành công!');

              this.outputStatusOrderAPI = data;

              // Cập nhật giao diện
              this.cdr.detectChanges();

              this.loading = false; // Dừng trạng thái loading nếu có

              this.showNotification('success', 'Thông báo', 'Thanh toán warehouse thành công!', 2000);

              // Đợi 5 giây rồi chuyển hướng về trang thông tin
              setTimeout(() => {
                this.router.navigate(['/buyed']); // Thay thế '/your-information-page' với đường dẫn thực tế
              }, 5000); // 5000ms = 5 giây

              return; // Kết thúc vòng gọi API
            }
            else {
              console.log('Giao dịch thành công!');

              this.outputStatusOrderAPI = data;

              // Cập nhật giao diện
              this.cdr.detectChanges();

              this.loading = false; // Dừng trạng thái loading nếu có

              // Đợi 5 giây rồi chuyển hướng về trang thông tin
              setTimeout(() => {
                this.router.navigate(['/buyed']); // Thay thế '/your-information-page' với đường dẫn thực tế
              }, 5000); // 5000ms = 5 giây

              return; // Kết thúc vòng gọi API
            }
          }

          // Nếu chưa đạt trạng thái mong muốn, tiếp tục kiểm tra sau 3 giây
          setTimeout(() => this.getOrderStatus(), 3000);
        },
        error: (error) => {
          console.error('Lỗi khi gọi API getOrderStatus:', error);

          // Hiển thị thông báo lỗi nếu cần (tùy logic của bạn)
          //  this.showError('Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại!');

          // Tắt loading (nếu bạn muốn dừng kiểm tra khi có lỗi)
          this.loading = false;
        },
      });
  }

 // Phương thức quét mã QR
 scanQRCode() {
  // Logic quét mã QR (ví dụ: mở camera, quét mã, và gán kết quả vào scannedQRCode)
  this.scannedQRCode = 'QR_CODE_123456'; // Giả lập việc quét mã QR
}

// Tiến hành thanh toán
proceedWithPayment() {
  if (this.selectedPaymentMethod && this.scannedQRCode) {
    alert(`Thanh toán thành công qua ${this.selectedPaymentMethod}`);
  } else {
    alert('Vui lòng chọn phương thức thanh toán và quét mã QR');
  }
}

getPlanByProductId() {
//  this.planByProductIdData = this.buyService.getPlanByProductId(this.productID);
  this.buyService.getPlanByProductId(this.productID).subscribe(data => {
    this.planByProductIdData =data?.data;
    this.plans = data.data;  // Dữ liệu bạn nhận từ API
  });
}
}
