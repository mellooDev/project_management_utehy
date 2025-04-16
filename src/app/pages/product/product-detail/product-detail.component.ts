import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthHTTPService } from '../../../modules/auth/services/auth-http';
import { ProductService } from '../../../services/product.service';
import { BuyService } from '../../../services/buy.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CategoryService } from 'src/app/services/category.service';
import { AppConstants } from 'src/app/utils/app.constants';
import { NgbDropdownModule, NgbPaginationModule, NgbRatingConfig, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { RatingService } from 'src/app/services/rating.service';

@Component({
  providers: [DatePipe],
  selector: 'app-product-detail',
  imports: [CommonModule, NgbDropdownModule, NgbRatingModule, NgbPaginationModule],
  templateUrl: './product-detail.component.html', // Correct HTML file
  styleUrls: ['./product-detail.component.scss'],
  standalone: true,
})
export class ProductDetailComponent implements OnInit {
  activeTab: string = 'overview'; // Default tab

  isLogin: boolean;
  token: string;
  profile: any;
  value: number = 4;

  selectedButtonFilter: number = 0;
  ratingDatas :any[] = [];
  currentPage: number = 1;
  pageSize: number = 2;
  recordsTotal: number = 0;
  productID: number;
  ratingAverage: number;

  id: number;
  isBought: boolean = false;
  isOwner: boolean = false;
  uidLogin: any;
  urlImage = AppConstants.API_PRODUCT_BASE_URL + 'api/product/image/';
  defaultImage = '../../../../assets/media/avatars/user-image.jpg'

  buttonRatingArray = [
    { label: 'Tất cả', value: 'all', count: null },
    { label: '5 sao', value: '5', count: 0 },
    { label: '4 sao', value: '4', count: 0 },
    { label: '3 sao', value: '3', count: 0 },
    { label: '2 sao', value: '2', count: 0 },
    { label: '1 sao', value: '1', count: 0 },
    { label: 'Có nội dung', value: 'content', count: 0 },
  ]

  constructor(
    private router: Router,
    private authService: AuthHTTPService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private buyService: BuyService,
    private sanitizer: DomSanitizer,
    private config: NgbRatingConfig,
    private ratingService: RatingService,
    private datePipe: DatePipe
  ) {
    config.max = 5;
    config.readonly = true;
  }

  fullText: string = '';

  truncateText: string = '';

  truncateUseCaseText: string = '';
  showMore: boolean = false;
  isLongText: boolean = false;

  showMoreUseCase: boolean = false;
  maxLengthUseCase: number = 800;
  isUsecaseLongText: boolean = false;

  maxLength: number = 2000;

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    const element = document.getElementById(tab);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  setActiveButtonRating(index: number) {
    this.selectedButtonFilter = index;
    const selectedValue = this.buttonRatingArray[index].value;

    const payload = {
      currentPage: this.currentPage - 1,
      perPage: this.pageSize,
      prodId: this.productID,
      isShow: 1, 
      hasContent: selectedValue === 'content' ? 1 : 0, 
      rate: ['all', 'content'].includes(selectedValue) ? null : parseInt(selectedValue) 
    };
  
    console.log('Payload gửi đi:', payload);
  
    this.ratingService.getRating(payload).subscribe({
      next: (res) => {
        console.log('Dữ liệu nhận về:', res);
        this.ratingDatas = res.data || [];
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
      }
    });
  }

  getData(id: number) {
    this.router.navigate(['/data-management/']);
  }

  getUserByToken() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    if (this.token) {
      this.authService.getUserByToken(this.token).subscribe((res) => {
        if (res) {
          this.isLogin = true;
          this.profile = res;
          this.uidLogin = this.profile.uid;

          this.productService
            .checkSubscriptionsUserProduct(this.profile.uid, this.id)
            .subscribe((data) => {
              if (data) {
                this.isBought = data.isValid;
                this.cdr.detectChanges();
              }
            });
        } else {
          this.isLogin = false;
        }
        this.cdr.detectChanges();
      });
    }
  }

  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
  }

  toggleShowMoreUseCase() {
    this.showMoreUseCase = !this.showMoreUseCase;
  }

  // filterRatingByStar(star: number) {

  // }

  roundedStar(v: any, n: any) {
    return Math.round((v+Number.EPSILON)* Math.pow(10, n))/Math.pow(10, n);
  } 

  loadAverageRating() {
    this.productID = this.activatedRoute.snapshot.params['id'];
    const payload = {
      currentPage: this.currentPage - 1,
      perPage: this.pageSize,
      prodId: this.productID,
    }
    this.ratingService.getRating(payload).subscribe({
      next: (res) => {
        console.log('average star: ', res.avgStar)
        this.ratingAverage = this.roundedStar(res.avgStar, 0);
        console.log('average star: ', this.ratingAverage);
      }
    })
  }

  loadRating() {
    this.productID = this.activatedRoute.snapshot.params['id'];
    const payload = {
      currentPage: this.currentPage - 1,
      perPage: this.pageSize,
      prodId: this.productID,
      isShow: 1
    }
    this.ratingService.getRating(payload).subscribe({
      next: (res) => {
        console.log('Response received:', res);
        if (!res || !res.data || res.data.length === 0) {
          console.warn('No data received from API.');
        }
        this.buttonRatingArray[1].count = res.fiveStar;
        this.buttonRatingArray[2].count = res.fourStar;
        this.buttonRatingArray[3].count = res.threeStar;
        this.buttonRatingArray[4].count = res.twoStar;
        this.buttonRatingArray[5].count = res.oneStar;
        this.buttonRatingArray[6].count = res.hasContent;
        this.ratingDatas = res.data;

        // this.ratingDatas = res.data.filter((item: any) => item.isShow === '1').map((item: any) => ({
        //   fullName: item.fullName,
        //   rate: item.rate,
        //   image: item.image,
        //   createAt: new Date(item.createAt),
        //   content: item.content,
        // }))
        console.log('response: ', this.ratingDatas);
        this.recordsTotal = res.recordsTotal ?? this.ratingDatas.length;
        console.log('records total: ', this.recordsTotal);
      },
      error: (err) => {
        console.error('error: ', err)
      }
    })
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRating();
  }

  sortRating(key: number) {
    this.ratingDatas.sort((a: any, b: any) => {

    const dateA = new Date(a.createAt);
    const dateB = new Date(b.createAt);


      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        console.error("Invalid date format");
        return 0; // Không thay đổi vị trí nếu ngày không hợp lệ
      }
  

      if(key === 1) {
        return dateB.getTime() - dateA.getTime()
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    })
  }

  clickBuyData(id: number) {
    // if (this.isLogin) {
    //   this.router.navigate(['/buy/', id]);
    // } else {
    //   this.router.navigate(['/auth/login']);
    // }
    this.router.navigate(['/buy/', id]);
  }
  dataProduct: any;
  dataProductItems: any;
  planByProductIdData: any[] = [];
  price: number;
  productImages: any[] = [];

  getDetailProduct(id: number) {
    this.productService.getDetailProduct(id).subscribe((data) => {
      this.dataProduct = data;
      if (this.uidLogin == data?.owner_id) {
        this.isOwner = true;
      }

      this.isLongText =
        this.dataProduct?.description?.description?.length > this.maxLength;
      this.truncateText = this.dataProduct?.description?.description;
      // this.isLongText ? this.dataProduct.description?.description.slice(0, this.maxLength) + '...   '
      // : this.dataProduct.description.description;

      this.isUsecaseLongText =
        this.dataProduct?.description?.use_cases?.length >
        this.maxLengthUseCase;
      this.truncateUseCaseText = this.isUsecaseLongText
        ? this.dataProduct?.description.use_cases.slice(
          0,
          this.maxLengthUseCase
        ) + '...   '
        : this.dataProduct?.description.use_cases;

      this.getDetailCategory(this.dataProduct?.category_id);
      this.getPrice(this.id);

      console.log('isBought', this.isBought);
      console.log('isFREE', this.isFREE);
      console.log('isOwner', this.isOwner)

      // Lọc tất cả các hình ảnh có `type = "example"`
      this.productImages = this.dataProduct.images.filter(
        (image: any) => image.type === 'example'
      );
      this.cdr.detectChanges();
    });
  }

  freePlan: any;

  getPrice(id: number) {
    this.buyService.getPlanByProductId(id).subscribe((data) => {
      if (data?.data && Array.isArray(data.data)) {
        this.planByProductIdData = data.data;

        // Tìm object có planName là "FREE"
        this.freePlan = this.planByProductIdData.find(
          (plan) => plan.planName === 'FREE'
        );

        console.log('freePlan', this.freePlan);
        if (this.freePlan) {
          this.isFREE = true;
          this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện

        }
      } else {
        this.planByProductIdData = [];
      }
      this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
    });
  }
  isFREE: boolean = false;
  isTermsModalOpen: boolean = false; // Điều khiển hiển thị modal

  // Hàm xử lý khi trạng thái checkbox thay đổi
  onTermsChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    // this.termsAccepted = checkbox.checked;
  }
  openTermsPopup(): void {
    this.isTermsModalOpen = true; // Mở modal
  }

  closeTermsPopup(): void {
    this.isTermsModalOpen = false; // Đóng modal
  }
  yesTermsPopup(): void {
    var createOrrderInput = {
      paymentType: 'PREPAID',
      productName: this.dataProduct?.description?.name,
      productType: this.dataProduct?.data_type,
      providerId: this.dataProduct?.owner_id,
      productProviderName: this.dataProduct?.provider_name,
      productId: this.id,
      productPlanId: this.planByProductIdData[0]?.id,
      productPlanOptionId: null,
      duration: 'FREE',
      amount: 0,
      status: 'CREATED',
      paymentId: 'string',
      additionServiceIds: [0], //this.selectedPlanAdditionServicesValues
    };

    localStorage.setItem('createOrrderFREE', JSON.stringify(createOrrderInput));
    this.router.navigate(['buyed']);
    console.log('createOrrderInput', createOrrderInput);
    //this.router.navigate(['product-provider']);
    // this.buyService.createOrder(createOrrderInput).subscribe(data => {
    //   this.router.navigate(['buyed']);
    // });
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];

    // this.activatedRoute.params.subscribe((params) => {
    //   this.id = params['id'];
    //   this.getDetailProduct(this.id);
    // })

    this.getUserByToken();
    this.getDetailProduct(this.id);
    this.getDetailProductItems(this.id);
    this.loadRating();
    this.loadAverageRating();

    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện

  }

  example_json: any;
  previewData: any;
  // activeTabPreview: string = 'cot'; // Tab mặc định
  activeTabPreview: any;

  switchTabPreview(tab: string): void {
    this.activeTabPreview = tab;
  }

  navigateToDetailProduct(id: number) {
    this.router.navigate(['products', id]).then(() => {
      window.location.reload(); // Reload toàn bộ trang
    });
  }

  getDetailProductItems(id: number) {
    this.productService.getDetailProductItems(id).subscribe((data: any) => {
      this.dataProductItems = data;
      this.activeTabPreview = data[0].id;

      // Parse `table_structure` và `example_json`
      this.dataProductItems = data.map((item: any) => {
        try {
          return {
            ...item,
            table_structure: JSON.parse(item.table_structure),
            example_json: JSON.parse(item.example_json),
          };
        } catch (error) {
          return {
            ...item,
            table_structure: JSON.parse(item.table_structure),
            example_json: item.example_json,
          };
        }
      });
    });
  }

  isPopupVisible = false;

  showPopup(): void {
    this.isPopupVisible = true;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }

  //
  listProductByCategory: any[] = [];

  getDetailCategory(id: number) {
    this.categoryService.getCategoryById(id).subscribe((res) => {
      this.listProductByCategory = res.items;
      this.cdr.detectChanges();
    });
  }
}
