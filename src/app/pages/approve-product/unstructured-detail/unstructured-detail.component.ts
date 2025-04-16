import {
  Component,
  OnInit,
  ChangeDetectorRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { ProviderDataService } from 'src/app/services/provider-data.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { PaymentListService } from 'src/app/services/payment-list.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { ProductProviderService } from 'src/app/services/product-provider.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentUnstructruedService } from 'src/app/services/payment-unstructrued.service';
import { ProductService } from 'src/app/services/product.service';
import { BuyService } from 'src/app/services/buy.service';
import { AppConstants } from 'src/app/utils/app.constants';
import { ApproveProductService } from 'src/app/services/approve-product.service';
import { NgbModal, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { RatingService } from 'src/app/services/rating.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-unstructured-detail',
  templateUrl: './unstructured-detail.component.html',
  styleUrl: './unstructured-detail.component.scss',
  providers: [MessageService, DatePipe],
})
export class UnstructuredDetailComponent  implements OnInit {
  @Input() inputDataFrom: any; // Thuộc tính nhận dữ liệu từ Component 1

  loading: boolean = false;
  activeStep = 1; // Bước hiện tại
  status: 'active' | 'inactive' = 'inactive'; // Trạng thái ban đầu
  stepForms: FormGroup[] = [];
  messageStep1File = '';
  messageStep2Name = {
    dataName: '',
    shortDescription: '',
    longDescription: '',
    version: '',
    dataField: '',
  };
  productID!: number;
  approvalProdId: number;
  selectedReason: string = '';
  customReason: string = '';
  approveStatus!: number;
  planList: any;
  isLoading: boolean = false;
  currentProdId: number;
  selectedRatingId: number;
  selectedRating: any;
  selectedRatingOwner: string;

  pendingValue: boolean | null = null;


  currentPage: number = 1;
  pageSize: number = 5;
  recordsTotal: number = 0;
  selectedButtonFilter: number = 0;
  defaultImage = '../../../../../assets/media/avatars/user-image.jpg'

  ratingDatas: any[] = [];

  steps = ['Chọn dữ liệu', 'Thông tin', 'Tài liệu', 'Chi phí'];
  currentStep = 0;
  // Danh sách bên trái
  selectedData: string[] = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  isSelected: string = 'free';
  isPlanSelected: 'free' | 'paid' = 'free'

  paymentData: any[] = [];
  paymentDataLocal: any[] = [];

  // Danh sách bên phải
  selectedDataDone: any[] = [];

  // Các mục đã chọn
  selectedLeftItems: any[] = [];
  selectedRightItems: any[] = [];
  dataFiles: any[] = [];
  dataFilesOld: any[] = [];

  // Data binding variables
  dataName: string = '';
  dataField: string = '';
  fields: string[] = ['Lĩnh vực A', 'Lĩnh vực B', 'Lĩnh vực C'];
  shortDescription: string = '';
  longDescription: string = '';
  dataDescription: string = '';
  version: string = '';
  displayOption: string = 'hiển thị'; // Mặc định là "hiển thị"
  ownershipOption: string = 'Chủ sở hữu'; // Mặc định là "Chủ sở hữu"

  dataAPIField: any[] = [];
  isDataFieldInvalid: boolean = false;
  unstructuredData:any;
  unstructuredDataID:number;
  dataProductItems:any;

  productImages:any[] =[];
  urlImage= AppConstants.API_BASE_URL+"api/product/image/";
  productCerti:any[] =[];
  planByProductIdData:any[] =[];

  rejectReasons = [
    { key: '1', name: 'Dữ liệu chứa thông tin vi phạm pháp luật' },
    { key: '2', name: 'Dữ liệu chứa thông tin nhạy cảm, không phù hợp' },
    { key: '3', name: 'Dữ liệu chứa thông tin không phù hợp với chính sách và điều khoản của sàn' },
    { key: '4', name: 'Chất lượng dữ liệu không đạt yêu cầu' },

  ]

  constructor(
    private providerDataService: ProviderDataService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private productProviderService: ProductProviderService,
    private dialog: MatDialog,
    private paymentUnstructure: PaymentUnstructruedService,
    private productService: ProductService,
    private ratingService: RatingService,
    private router: Router,
    private snackBar: MatSnackBar,
    private buyService: BuyService,
    private activatedRouter: ActivatedRoute,
    private approveProdService: ApproveProductService,
    private modalService: NgbModal,
    private messageService: MessageService,
    private config: NgbRatingConfig

  ) {
    config.max = 5;
    config.readonly = true;
  }

  buttonRatingArray = [
    { label: 'Tất cả', value: 'all', count: null },
    { label: '5 sao', value: '5', count: 0 },
    { label: '4 sao', value: '4', count: 0 },
    { label: '3 sao', value: '3', count: 0 },
    { label: '2 sao', value: '2', count: 0 },
    { label: '1 sao', value: '1', count: 0 },
    { label: 'Có nội dung', value: 'content', count: 0 },
  ]

  ngOnInit(): void {
    this.productID = +this.activatedRouter.snapshot.paramMap.get('id')!;
    const id = this.approveProdService.getRequestId();
    console.log('request id: ', id);

    this.getDetailProductItems();

    this.getListFile();
    this.getCategories();
    this.loadRating(2);
    // this.getPrice();
    this.loadPlans();
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
  }

  showNotification(severity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: lifetime })
  }

  toggleComment(content: TemplateRef<any>, ratingId: number, value: boolean, rating: any) {
    this.pendingValue = value;
    console.log('current pending value: ', this.pendingValue);
    this.selectedRating = rating;
    this.selectedRatingOwner = this.selectedRating.fullName;
    this.selectedRatingId = rating.reviewId;
    console.log('rating selected: ', this.selectedRatingId);
    
    this.modalService.open(content, {
      centered: true,
    })
  }

  onHideOrUnhide(event: Event, myForm: NgForm) {
      event.preventDefault();
  
      this.isLoading = true;
      if(myForm.invalid) {
        console.log('Form invalid');
        return;
      }
  
      const newStatusRating = this.pendingValue ? 1 : 0;
  
      this.ratingService.showOrHideRating(this.selectedRatingId, newStatusRating).subscribe({
        next: (res) => {
          console.log('update success: ', res);
          this.selectedRating.isShow = newStatusRating;
          this.isLoading = false;
          this.loadRating(2);
          
          this.closeModal()
        },
        error: (err) => {
          console.error('error: ', err);  
        }
      })
    }
  
    onDeleteRatingSubmit(event: Event, myForm: NgForm) {
      event.preventDefault();
  
      this.loading = true;
      if(myForm.invalid) {
        console.log('Form invalid');
        return;
      }
  
      this.ratingService.deleteRating(this.selectedRatingId).subscribe({
        next: (res) => {
          console.log('delete success: ', res);
          this.loading = false;
          this.loadRating();
          this.closeModal();
        },
        error: (err) => {
          console.error('error: ', err);
          this.loading = false;
        }
      })
  
    }

  getDetailProductItems() {
    this.approveProdService.getProductDetail(this.productID).subscribe((data: any) => {
      this.dataProductItems = data;
      console.log("detail: ", this.dataProductItems);

      this.dataField=  this.dataProductItems.category_id;
      this.approveStatus = this.dataProductItems.approval_status;
        this.version=  this.dataProductItems.version;
        this.dataName=  this.dataProductItems?.description?.name;
        this.htmlContentDes=  this.dataProductItems?.description?.description;
        this.shortDescription=  this.dataProductItems?.description?.short_description;
        this.htmlContentApp=  this.dataProductItems?.description?.use_guide;
        this.htmlContentExample=  this.dataProductItems?.description?.use_cases;
        this.currentProdId = this.dataProductItems?.product_id;
        console.log('current prod id: ', this.currentProdId);

        this.loadPlans();

        // Lọc tất cả các hình ảnh có `type = "example"`
        this.productImages = this.dataProductItems.images.filter(
          (image: any) => image.type === 'example'
        );
        this.productCerti = this.dataProductItems.images.filter(
          (image: any) => image.type === 'certificate'
        );
      // Cập nhật `uploadedImages` dựa trên số lượng hình ảnh đã lọc
        this.productImages.slice(0, 3).forEach((image: any, index: number) => {
          this.uploadedImages[index] = this.urlImage + image.product_image_id;
        });
        this.uploadedPdfs = this.productCerti.map((file: any) => ({
          name: file.origin_image,
          url: this.urlImage + file.product_image_id
        }));

      // Parse `table_structure` và `example_json`
      this.dataProductItems = data.map((item: any) => {
        return {
          ...item,
          table_structure: JSON.parse(item.table_structure),
          example_json: JSON.parse(item.example_json),
        };
      });

    //   // Lấy danh sách các `file_id` từ comparisonList
    //   const fileIdsToRemove =  this.dataProductItems.map(item => item.file_id);

    //   // Lọc danh sách ban đầu
    //  this.dataFiles = this.dataFilesOld.filter(item => !fileIdsToRemove.includes(item.id));

    //   // Lấy danh sách đã loại bỏ
    //  this.selectedDataDone = this.dataFilesOld.filter(item => fileIdsToRemove.includes(item.id));
    // this.selectedDataDone = this.dataFilesOld
    // .map(item => ({
    //   ...item, // Sao chép tất cả các trường hiện có trong `item`
    //   file_id: item.file_id // Thêm trường `file_id` với giá trị từ `item.id`
    // })).filter(item => fileIdsToRemove.includes(item.id));

    // Lấy danh sách các `file_id` và `id` từ `comparisonList`
    const fileDataToRemove = this.dataProductItems.map((item: any) => ({ file_id: item.file_id, id: item.id }));

    // Tách danh sách `file_id` ra để so sánh
    const fileIdsToRemove = fileDataToRemove.map((item: any) => item.file_id);

    // Lọc danh sách ban đầu
    this.dataFiles = this.dataFilesOld.filter(item => !fileIdsToRemove.includes(item.id));

    // Lấy danh sách đã loại bỏ (có cả `id` và `file_id`)
    this.selectedDataDone = this.dataFilesOld.map(item => {
      // Find the matching entry in fileDataToRemove
      const matchingData = fileDataToRemove.find((data: any) => data.file_id === item.id);
      return {
        ...item,
        file_id: item.file_id,
        idinfileDataToRemove: matchingData ? matchingData.id : null // Add id from fileDataToRemove
      };
    })
      .filter(item => fileIdsToRemove.includes(item.id))
    ;



     this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện

    });
  }
  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // 3 seconds
      verticalPosition: 'top',
      panelClass: ['success-snackbar'], // Custom class for styling
    });
  }

  openRefuseProdModal(content: TemplateRef<any>) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      windowClass: 'my-class',
    });
  }


  loadPlans() {
    this.approveProdService.getPlanProduct(this.currentProdId).subscribe((res) => {
      if(res.length === 1 && res[0].planType === 'FREE') {
        this.isPlanSelected = 'free';
        this.planList = [];
      }
      else {
        this.isPlanSelected = 'paid';
        this.planList = res.data;
        console.log('plan list: ', this.planList);

        this.planList.forEach((item: any) => {

          console.log("plan type: ", item.planType);
        })

      }
    })
  }

  selectPayment(type: 'free' | 'paid') {
    this.isPlanSelected = type;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  setActiveButtonRating(index: number) {
    this.selectedButtonFilter = index;
    const selectedValue = this.buttonRatingArray[index].value;

    const payload = {
      currentPage: this.currentPage - 1,
      perPage: this.pageSize,
      prodId: this.productID,
      isShow: 2, 
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
  loadRating(isShow?: number) {
    const payload = {
      currentPage: this.currentPage - 1,
      perPage: this.pageSize,
      prodId: this.productID,
      isShow: isShow
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
        console.log('response: ', this.ratingDatas);
        this.recordsTotal = this.ratingDatas.length;
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


  onAcceptProd() {
    const payload = {
      approval: 'APPROVED',
      description: 'null'
    }
    const id = this.approveProdService.getRequestId();

    console.log("payload: ", payload);

    this.isLoading = true;
    this.approveProdService.rejectProduct(id, payload).subscribe({
      next: (res) => {
        console.log('success', res);
        this.isLoading = false;
        this.showNotification('success', 'Thông báo', 'Phê duyệt sản phẩm thành công. Thông tin sẽ được gửi về email của người đăng tải dữ liệu', 3000);

        setTimeout(() => {
          this.closeModal()
          this.router.navigate(['/approve-product'])
        }, 1000);

      },
      error: (err) => {
        console.error('error: ', err);
        this.isLoading = false;
        this.showNotification('error', 'Thông báo', 'Có lỗi xảy ra. Vui lòng kiểm tra lại', 3000);
        setTimeout(() => {
          this.closeModal()
        }, 2000);
      }
    })
  }

  onRefuseProd() {
    let reason: string;
    const id = this.approveProdService.getRequestId();

    if (this.selectedReason === 'other') {
      reason = this.customReason;
    }
    else {
      reason = this.selectedReason;
    }

    if(reason === null || reason === undefined || reason === ''){
      this.showNotification('error', 'Thông báo', 'Vui lòng nhập lý do từ chối.', 3000);
    }else{
      const payload = {
        approval: 'REJECTED',
        description: reason
      }

      console.log("payload: ", payload);

      this.isLoading = true;
      this.approveProdService.rejectProduct(id, payload).subscribe({
        next: (res) => {
          console.log('success', res);
          this.isLoading = false;
          this.showNotification('success', 'Thông báo', 'Từ chối phê duyệt thành công. Thông tin sẽ được gửi về email của người đăng tải dữ liệu', 3000);
          setTimeout(() => {
            this.closeModal()
            this.router.navigate(['/approve-product'])
          }, 2000);

        },
        error: (err) => {
          console.error('error: ', err);
          this.isLoading = false;
          this.showNotification('error', 'Thông báo', 'Có lỗi xảy ra. Vui lòng kiểm tra lại', 3000);
          setTimeout(() => {
            this.closeModal()
          }, 2000);
        }
      })
    }



  }

  getCategories() {
    this.productService.getCategories().subscribe((res) => {
      this.dataAPIField = res;
    });
  }

  // Chuyển sang bước tiếp theo
  nextStep() {
    this.createData();
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  isDataNameInvalid: boolean = true;
  // isOtherFieldInvalid: boolean = false;

  isShortDescriptionInvalid: boolean = true;
  isVersionInvalid: boolean = true;
  isLongDescriptionInvalid: boolean = true;

  currentInvalidField:
    | 'dataName'
    | 'shortDescription'
    | 'version'
    | 'longDescription'
    | 'dataField'
    | null = null;

  onInputChange(
    field:
      | 'dataName'
      | 'shortDescription'
      | 'version'
      | 'longDescription'
      | 'dataField'
  ) {
    if (field === 'dataName') {
      this.isDataNameInvalid =
        !this.dataName || this.dataName.trim().length === 0;
      this.messageStep2Name.dataName = this.isDataNameInvalid
        ? 'Vui lòng nhập tên dữ liệu'
        : '';
    }

    if (field === 'dataField') {
      const isInvalidField = !this.dataField || this.dataField.trim() === '';

      this.isDataFieldInvalid = isInvalidField;

      this.messageStep2Name.dataField = isInvalidField
        ? 'Vui lòng chọn lĩnh vực'
        : '';
    }
    if (field === 'longDescription') {
      this.isLongDescriptionInvalid =
        !this.longDescription || this.longDescription.trim().length === 0;
      this.messageStep2Name.longDescription = this.isLongDescriptionInvalid
        ? 'Vui lòng nhập mô tả dữ liệu'
        : '';
    }

    if (field === 'shortDescription') {
      this.isShortDescriptionInvalid =
        !this.shortDescription || this.shortDescription.trim().length === 0;
      this.messageStep2Name.shortDescription = this.isShortDescriptionInvalid
        ? 'Vui lòng nhập mô tả ngắn'
        : '';
    }

    if (field === 'version') {
      const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+$/;
      this.version = this.version?.trim() || '';

      const isInvalidVersion =
        !this.version || !versionPattern.test(this.version);

      this.isVersionInvalid = isInvalidVersion;

      this.messageStep2Name.version = isInvalidVersion
        ? this.version.length === 0
          ? 'Vui lòng nhập phiên bản'
          : 'Phiên bản không hợp lệ'
        : '';
    }
  }
  // Gửi dữ liệu khi hoàn thành
  submitForm() {
    console.log(
      'Form đã được gửi:',
      this.stepForms.map((form) => form.value)
    );
    alert('Dữ liệu đã được gửi thành công!');
  }
  getListFile(): void {
    this.loading = true;
    // Make API call to fetch data
    this.providerDataService.getListFile().subscribe(
      (response) => {
        // Assuming the API returns 'data' for the items and 'recordsTotal' for total count
        this.dataFiles = response.owned; // Assign data from API response
        this.dataFilesOld = response.owned;

        this.getDetailProductItems();

        this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diệ
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.loading = false;
      }
    );
  }

  onDataUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      // if (!['.csv', '.json', '.xml', '.xlsx'].some(ext => file.name.endsWith(ext))) {
      //   console.error('Unsupported file type');
      //   return;
      // }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        console.error('File size exceeds 10MB');
        return;
      }
      this.providerDataService
        .uploadFile(file, { customField: 'customValue' })
        .subscribe({
          next: (response) => {
            this.dataFiles.push(response);
            const url = URL.createObjectURL(file);
            this.selectedData.push(file.name);
            this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
          },
          error: (error) => {
            console.error('Error uploading file:', error);
          },
        });
    }
  }

  toggleSelection(item: any, side: 'left' | 'right'): void {
    if (side === 'left') {
      if (this.selectedLeftItems.includes(item)) {
        this.selectedLeftItems = this.selectedLeftItems.filter(
          (i) => i.id !== item.id
        );
      } else {
        this.selectedLeftItems.push(item);
      }
    } else {
      if (this.selectedRightItems.includes(item)) {
        this.selectedRightItems = this.selectedRightItems.filter(
          (i) => i.id !== item.id
        );
      } else {
        this.selectedRightItems.push(item);
      }
    }
  }
  // Chọn item trong danh sách
  selectItem(item: any, side: 'left' | 'right'): void {
    if (side === 'left') {
      if (this.selectedLeftItems.includes(item)) {
        this.selectedLeftItems = this.selectedLeftItems.filter(
          (i) => i.id !== item.id
        );
      } else {
        this.selectedLeftItems.push(item);
      }
    } else {
      if (this.selectedRightItems.includes(item)) {
        this.selectedRightItems = this.selectedRightItems.filter(
          (i) => i.id !== item.id
        );
      } else {
        this.selectedRightItems.push(item);
      }
    }
  }

  moveItems(sourceList: any[], targetList: any[], selectedItems: any[]): void {
    selectedItems.forEach((item) => {
      sourceList.splice(sourceList.indexOf(item), 1);
      targetList.push(item);
    });
    selectedItems.length = 0; // Clear selection
  }

  moveToRight() {
    this.moveItems(
      this.dataFiles,
      this.selectedDataDone,
      this.selectedLeftItems
    );
  }

  moveToLeft() {
    this.selectedRightItems.forEach(element => {
      this.providerDataService.deleteItem(element.idinfileDataToRemove).subscribe((res) => {
      });
    });


    this.moveItems(
      this.selectedDataDone,
      this.dataFiles,
      this.selectedRightItems
    );
  }

  // Handle file upload
  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.inputAPILogo = file;
      console.log('Uploaded file:', file.name);
    }
  }

  // step 3
  htmlContentDes: string = '';
  htmlContentApp: string = '';
  htmlContentExample: string = '';
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '4rem',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [['bold', 'italic'], ['fontSize']],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };

  // For the first section: image uploads
  uploadedImages: string[] = [
    'assets/media/misc/image.png',
    'assets/media/misc/image.png',
    'assets/media/misc/image.png',
  ]; // Default images
  selectedImageIndex: number = 0; // Default selected image index

  inputAPILogo: any;
  inputAPIImage: any[] = [];
  inputAPICertificate: any[] = [];
  uploadedPdfs: { name: string; url: string }[] = [];

  onImageUpload(event: Event, index: number): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const id = this.uploadedImages[index].split('/').pop();
      if (id && !isNaN(Number(id))) {
        this.providerDataService.deleteImage(id).subscribe((res) => {
        });
      }

      this.inputAPIImage[index] = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedImages[index] = e.target.result;
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  }

  // For the second section: PDF uploads
  onPdfUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      this.inputAPICertificate.push(file);
      const url = URL.createObjectURL(file);
      this.uploadedPdfs.push({ name: file.name, url });
    }
  }

  removePdf(index: number, url:string): void {
    this.inputAPICertificate.splice(index, 1); // Remove the file from the array
    this.uploadedPdfs.splice(index, 1);
    const id = url.split('/').pop();
    if (id && !isNaN(Number(id))) {
      this.providerDataService.deleteImage(id).subscribe((res) => {
      });
    }

  }

  //tao

  // Chuyển sang bước tiếp theo là tạo đơn
  createData(): void {
    var createOrrderInput = {
      visibility: true,
      group_id: 1,
      category_id: this.dataField ? this.dataField : 1,
      update_interval: '6 MONTH',
      name: this.dataName,
      description: this.htmlContentDes,
      short_description: this.shortDescription,
      tags: 'health',
      use_guide: this.htmlContentApp,
      use_cases: this.htmlContentExample,
      data_type: 0,
    };

    this.providerDataService.updateData(this.unstructuredData.product_id, createOrrderInput).subscribe((data) => {
      this.productID = data.product_id;
      this.onDataUploadLast();
      console.log('Tạo mới thành công');
      //this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
      // Show the success message
      const snackBarRef = this.snackBar.open('Tạo mới thành công!', '', {
        duration: 5000, // 5 seconds
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['success-snackbar'], // Custom class for styling
      });

      // After the snackbar is dismissed, navigate to the product provider list
      snackBarRef.afterDismissed().subscribe(() => {
        this.router.navigate(['/product-provider']);
      });
    });
  }

  onDataUploadLast(): void {
    this.providerDataService
      .uploadFileLogo(this.productID, this.inputAPILogo, {
        customField: 'customValue',
      })
      .subscribe({
        next: (response) => {
          console.log('File uploaded successfully:', response);
        },
        error: (error) => {
          console.error('Error uploading file:', error);
        },
      });
    this.inputAPIImage.forEach((file, index) => {
      this.providerDataService
        .uploadFileExample(this.productID, file, { customField: 'customValue' })
        .subscribe({
          next: (response) => {
            console.log(`File ${index + 1} uploaded successfully:`, response);
            // Cập nhật trạng thái file nếu cần
          },
          error: (error) => {
            console.error(`Error uploading file ${index + 1}:`, error);
            // Xử lý lỗi nếu cần
          },
        });
    });
    this.inputAPICertificate.forEach((file, index) => {
      this.providerDataService
        .uploadFileCertificate(this.productID, file, {
          customField: 'customValue',
        })
        .subscribe({
          next: (response) => {
            console.log(`File ${index + 1} uploaded successfully:`, response);
            // Cập nhật trạng thái file nếu cần
          },
          error: (error) => {
            console.error(`Error uploading file ${index + 1}:`, error);
            // Xử lý lỗi nếu cần
          },
        });
    });

    this.selectedDataDone.forEach((file, index) => {
      const dataInpop = {
        name: file.fileName,
        // "example_json": "{\"name\": 123113}",
        // "table_structure": "",
        // "example_images": "",
        // "database_id": 1,
        // "table_id": 1,
        file_id: file.id,
        // "shared_columns": "{\"name\":\"read\"}"
      };
      this.providerDataService
        .createProductItem(this.productID, dataInpop)
        .subscribe({
          next: (response) => {
            console.log(`File ${index + 1} uploaded successfully:`, response);
            // Cập nhật trạng thái file nếu cần
          },
          error: (error) => {
            console.error(`Error uploading file ${index + 1}:`, error);
            // Xử lý lỗi nếu cần
          },
        });
    });

    if (this.isSelected === 'free') {
      var dataIn = {
        planName: 'FREE',
        productId: this.productID,
        planType: 'FREE',
        basePrice: 0,
        duration: 'string',
      };
      this.productProviderService.updatePlan(dataIn).subscribe({
        next: (response) => {
          console.log(`updatePlan successfully:`, response);
        },
        error: (error) => {
          console.error(`Error updatePlan:`, error);
        },
      });
    } else {
      // Separate the DURATION plans from the rest of the plans
      const durationPlans = this.paymentDataLocal.filter(
        (data) => data.planType === 'DURATION'
      );
      const otherPlans = this.paymentDataLocal.filter(
        (data) => data.planType !== 'DURATION'
      );

      otherPlans.forEach((data, index) => {
        var dataIn = {
          planName: data.planName,
          productId: this.productID,
          planType: data.planType,
          basePrice: data.basePrice,
          duration: 'string',
          planOptions: [
            {
              optionName: data.planName,
              optionPrice: data.optionPrice,
              optionDuration: data.optionDuration,
              description: data.description,
              planAttributes: [
                {
                  attrName: data.optionPrice,
                  attrDescription: data.optionPrice,
                },
              ],
              planAdditionServices: [
                {
                  serviceName: 'string',
                  servicePrice: 0,
                  description: 'string',
                },
              ],
            },
          ],
        };

        this.productProviderService.updatePlan(dataIn).subscribe({
          next: (response) => {
            console.log(`updatePlan successfully:`, response);
          },
          error: (error) => {
            console.error(`Error updatePlan:`, error);
          },
        });
      });
      if (durationPlans && durationPlans.length > 0) {
        var durationPlansInput = {
          planName:  durationPlans[0]?.planName,
          productId: this.productID,
          planType: 'DURATION',
          basePrice: durationPlans[0]?.basePrice || 0,
          duration: durationPlans[0]?.optionDuration || 0,
          planOptions: durationPlans.map(
            ({ optionName, optionPrice, optionDuration, description }) => ({
              optionName,
              optionPrice,
              optionDuration,
              description,
              planAttributes: [
                {
                  attrName: optionName,
                  attrDescription: description,
                },
              ],
              planAdditionServices: [
                {
                  serviceName: 'string',
                  servicePrice: 0,
                  description: 'string',
                },
              ],
            })
          ),
        };
        this.productProviderService.updatePlan(durationPlansInput).subscribe({
          next: (response) => {
            console.log(`updatePlan successfully:`, response);
          },
          error: (error) => {
            console.error(`Error updatePlan:`, error);
          },
        });
      }
    }
  }
}
