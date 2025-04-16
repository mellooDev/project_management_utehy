import { NgbModal, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { PaymentListService } from 'src/app/services/payment-list.service';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  inject,
  TemplateRef,
} from '@angular/core';
import { ProviderDataService } from 'src/app/services/provider-data.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

import { MessageService, TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { DatasetNodeService } from 'src/app/services/dataset-node.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaymentUnstructruedService } from 'src/app/services/payment-unstructrued.service';
import { ProductProviderService } from 'src/app/services/product-provider.service';
import { ProductService } from 'src/app/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PackageDeleteDialogComponent } from '../package-delete-dialog/package-delete-dialog.component';
import { PackageInputDialogComponent } from '../package-input-dialog/package-input-dialog.component';
import { BuyService } from 'src/app/services/buy.service';
import { AppConstants } from 'src/app/utils/app.constants';
import { RatingService } from 'src/app/services/rating.service';
import { DatePipe } from '@angular/common';
import { animate, state, style, trigger, transition } from '@angular/animations';

interface CustomNodeTree extends TreeNode {
  tableInfo?: any;
}
@Component({
  providers: [MessageService, DatePipe],
  selector: 'app-structured-data-detail',
  templateUrl: './structured-data-detail.component.html',
  styleUrls: ['./structured-data-detail.component.scss'],
  animations: [
    trigger('toggleForm', [
      state('hidden', style({
        opacity: 0,
        transform: 'scale(0.9)',
        display: 'none'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'scale(1)',
        display: 'block',
      })),
      transition('hidden <=> visible', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class StructuredDataDetailComponent implements OnInit {
  loading: boolean = false;
  activeStep = 1; // Bước hiện tại
  status: 'active' | 'inactive' = 'inactive'; // Trạng thái ban đầu
  isSelected: string = 'free';

  paymentData: any[] = [];
  paymentDataLocal: any[] = [];
  pendingValue: boolean | null = null;
  tableInfoData: any = {};
  currentPage: number = 1;
  pageSize: number = 5;
  recordsTotal: number = 0;
  selectedButtonFilter: number = 0;
  defaultImage = '../../../../../assets/media/avatars/user-image.jpg'

  ratingDatas: any[] = [];
  isFormNewVersionAvailable = false;

  newVersionForm: FormGroup;
  listVersion: any;

  isEyeSlashVisible = true;


  constructor(
    private providerDataService: ProviderDataService,
    private cdr: ChangeDetectorRef,
    private paymentService: PaymentListService,
    private dialog: MatDialog,
    private nodeService: DatasetNodeService,
    private paymentUnstructure: PaymentUnstructruedService,
    private route: ActivatedRoute,
    private productProviderService: ProductProviderService,
    private productService: ProductService,
    private ratingService: RatingService,
    private router: Router,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private buyService: BuyService,
    private config: NgbRatingConfig,
    private modalService: NgbModal,
    private fb: FormBuilder,

  ) {
    config.max = 5;
    config.readonly = true;
    const formatDate = datePipe.transform(new Date(), 'dd-MM-yyyy');

    this.newVersionForm = this.fb.group({
      updateDate: [formatDate],
      versionDescription: ['']
    })
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


  openCreate() {
    if (this.paymentDataLocal.length == 0) {
      localStorage.setItem('listPay', JSON.stringify([]));
    }

    const dialogRef = this.dialog.open(PackageInputDialogComponent, {
      width: '600px',
      data: {} // Không truyền id, hiểu là thêm mới
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Thêm mới
        result.id = new Date().getTime(); // Tạo id giả định, có thể thay bằng id từ server
        for(let i = 0; i < this.paymentDataLocal.length; i++) {
          if (this.paymentDataLocal[i].planName === result.planName) {
            this.snackBar.open('Tên gói đã tồn tại', 'Đóng', {
              duration: 2000,
            });
            return;
          }
        }
        this.paymentDataLocal = this.paymentDataLocal.concat(result);
        localStorage.setItem('listPay', JSON.stringify(this.paymentDataLocal));
      }
    });
    this.cdr.detectChanges()
  }

  openUpdate(id: number) {
    const itemToUpdate = this.paymentDataLocal.find(item => item.id === id);

    const dialogRef = this.dialog.open(PackageInputDialogComponent, {
      width: '600px',
      data: { ...itemToUpdate } // Truyền thông tin cần cập nhật
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Cập nhật dữ liệu
        const index = this.paymentDataLocal.findIndex(item => item.id === id);
        if (index !== -1) {
          this.paymentDataLocal[index] = result[0];
        }
        localStorage.setItem('listPay', JSON.stringify(this.paymentDataLocal));
      }
    });
    this.cdr.detectChanges()

  }

  openDelete(id: number) {
    const dialogRef = this.dialog.open(PackageDeleteDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc chắn muốn tiếp tục?' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.paymentDataLocal = this.paymentDataLocal.filter(item => item.id !== id); // Xóa dữ liệu
        localStorage.setItem('listPay', JSON.stringify(this.paymentDataLocal));
      }
    });
    this.cdr.detectChanges()

  }

  isInvalidForm(controlName: string) {
    const control = this.newVersionForm.get(controlName);
    return control?.invalid && (control.dirty || control.touched);
  }

  toggleForm() {
    this.isFormNewVersionAvailable = !this.isFormNewVersionAvailable;
  }

  hideNewFormVersion() {
    this.isFormNewVersionAvailable = false;
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
        this.ratingDatas = res.data;
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
      }
    });
  }


  columns: any[] = [];
  rows: any[] = [];

  files: TreeNode<any>[] = [];
  selectedFiles: TreeNode<any>[] = [];
  tableDataResponse: any[] = [];
  maxColumn: number = 5;
  selectedNodes: any[] = [];

  stepForms: FormGroup[] = [];
  messageStep1File = '';
  messageStep2Name = {
    dataName: '',
    shortDescription: '',
    version: '',
  };
  productID = 0;

  // Danh sách bên trái
  selectedData: string[] = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

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
  tableData: any[] = []
  dataDescription: string = '';
  version: string = '';
  displayOption: string = 'hiển thị'; // Mặc định là "hiển thị"
  ownershipOption: string = 'Chủ sở hữu'; // Mặc định là "Chủ sở hữu"
  dataAPIField: any[] = [];
  isTableSelected = false;


  unstructuredData: any;
  unstructuredDataID: number;
  dataProductItems: any[] = [];

  productImages: any[] = [];
  urlImage = AppConstants.API_BASE_URL + "api/product/image/";
  productCerti: any[] = [];
  planByProductIdData: any[] = [];

  ngOnInit(): void {
    this.productID = Number(this.route.snapshot.paramMap.get('id'))
    // Lấy dữ liệu từ LocalStorage nếu tồn tại
    const storedListPay = localStorage.getItem('unstructuredData');
    if (storedListPay) {
      this.unstructuredData = JSON.parse(storedListPay);
      this.unstructuredDataID = this.unstructuredData.product_id;
      this.dataField = this.unstructuredData.category_id;
      this.version = this.unstructuredData.version;
      this.dataName = this.unstructuredData?.description?.name;
      this.htmlContentDes = this.unstructuredData?.description?.description;
      this.shortDescription = this.unstructuredData?.description?.short_description;
      this.htmlContentApp = this.unstructuredData?.description?.use_guide;
      this.htmlContentExample = this.unstructuredData?.description?.use_cases;

      // Lọc tất cả các hình ảnh có `type = "example"`
      this.productImages = this.unstructuredData.images.filter(
        (image: any) => image.type === 'example'
      );
      this.productCerti = this.unstructuredData.images.filter(
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

    }

    this.loadNodeDatabase();
    this.loadPaymentList();
    this.getCategories();
    this.getDeliveryMethods();
    this.getPrice();
    this.getListVersion();
    this.getDetailProductItems();
    this.loadRating();
    this.cdr.detectChanges();
  }

  toggleComment(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
    })
  }

  getListVersion() {
    this.productService.getListVersion(this.productID).subscribe({
      next: (res) => {
        console.log('success', res);
        this.listVersion = res.data;
      }
    })
  }


  getDetailProductItems() {
    this.productService.getDetailProductItems(this.unstructuredDataID).subscribe((data: any) => {
      this.dataProductItems = data;

      // Parse `table_structure` và `example_json`
      this.dataProductItems = data.map((item: any) => {
        return {
          ...item,
          table_structure: JSON.parse(item.table_structure),
          example_json: JSON.parse(item.example_json),
        };
      });
      this.example_json = data[0].example_json;

      // Lấy danh sách các `file_id` và `id` từ `comparisonList`
      const fileDataToRemove = this.dataProductItems.map(item => ({ file_id: item.file_id, id: item.id }));

      // Tách danh sách `file_id` ra để so sánh
      const fileIdsToRemove = fileDataToRemove.map(item => item.file_id);

      // Lọc danh sách ban đầu
      this.dataFiles = this.dataFilesOld.filter(item => !fileIdsToRemove.includes(item.id));

      // Lấy danh sách đã loại bỏ (có cả `id` và `file_id`)
      this.selectedDataDone = this.dataFilesOld.map(item => {
        // Find the matching entry in fileDataToRemove
        const matchingData = fileDataToRemove.find(data => data.file_id === item.id);
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
  getPrice() {
    this.buyService.getPlanByProductId(this.unstructuredDataID).subscribe(data => {
      if (data?.data && Array.isArray(data.data)) {
        this.planByProductIdData = data.data;
      } else {
        this.planByProductIdData = [];
      }
      if (this.planByProductIdData.length > 0) {
        // Transform data
        const transformedData = this.planByProductIdData.flatMap((plan: any) =>
          plan.planType === 'DURATION' && Array.isArray(plan.planOptions)
            ? plan.planOptions.map((option: any) => ({
              ...plan, // Copy all top-level fields of the current plan
              planOptions: [option] // Replace `planOptions` with the single option
            }))
            : [plan] // Keep the plan unchanged if the condition is not met
        );

        // Add optionPrice to planAttributes for each transformed plan
        const fullyTransformedData = transformedData.map((plan: any) => ({
          ...plan, // Copy all top-level fields
          planOptions: plan.planOptions.map((option: any) => ({
            ...option,
            planAttributes: option.planAttributes.map((attribute: any) => ({
              ...attribute,
              optionPrice: option.attrName, // Add `optionPrice` from the parent planOption
            })),
          })),
        }));
        const arrayPay: any[] = [];
        transformedData.forEach(element => {
          const data1 = {
            "id": element.id,
            "optionMount": "package",
            "planName": element.planName,
            "planType": element.planType,
            "basePrice": element.basePrice,
            "duration": element.duration,
            "optionDuration": element.duration,
            "optionName": element.planOptions[0].optionName,
            "optionPrice": element.planOptions[0].optionPrice,
            "description": element.planOptions[0].description,
            "planAttributes": element.planOptions[0].planAttributes,
            "planAdditionServices": [
              {
                "serviceName": "string",
                "servicePrice": 0,
                "description": "string"
              }
            ]
          }
          arrayPay.push(data1)
        });

        this.isSelected = 'paid';
        this.paymentDataLocal = arrayPay;
        localStorage.setItem('listPay', JSON.stringify(this.paymentDataLocal));
      }
      this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
    });
  }

  getCategories() {
    this.productService.getCategories().subscribe((res) => {
      this.dataAPIField = res;
    })
  }
  getCellValue(value: any) {
    if (value.n !== undefined) {
      return value.n;
    } else if (value.s !== undefined) {
      return value.s;
    } else if (value.b !== undefined) {
      return value.b ? 'true' : 'false';
    } else {
      return '';
    }
  }

  databaseId: number;
  convertData: any = {};
  selectedTableId: number | null = null;
  dataJson: any = {};

  onNodeSelect(event: any) {
    const selectedNode = event.node;
    this.isTableSelected = true;
    this.messageStep1File = '';
    this.dataJson = {};
    this.convertData = {};
    if (selectedNode.children && selectedNode.children.length > 0) {
      selectedNode.children.forEach((child: CustomNodeTree) => {
        if (child.tableInfo) {
          const tableInfo = child.tableInfo;
          this.tableInfoData = {
            databaseName: selectedNode.data,
            tableName: tableInfo.tableName,
            schemaDefinition: tableInfo.schemaDefinition,
            count: tableInfo.count,
            createdAt: tableInfo.createdAt,
            isDeleted: tableInfo.isDeleted,
            deletedAt: tableInfo.deletedAt,
          };
        }
      });
    } else {
      if (selectedNode.tableInfo) {
        const tableInfo = selectedNode.tableInfo;
        this.selectedTableId = selectedNode.tableInfo.id;
        this.tableInfoData = {
          databaseName: selectedNode.parent?.data,
          tableName: tableInfo.tableName,
          schemaDefinition: tableInfo.schemaDefinition,
          count: tableInfo.count,
          createdAt: tableInfo.createdAt,
          isDeleted: tableInfo.isDeleted,
          deletedAt: tableInfo.deletedAt,
        };
      } else {
        console.error('TableInfo is undefined');
      }
    }

    this.databaseId = selectedNode.parent?.data;
    const tableName = selectedNode.data;

    if (this.databaseId && tableName) {
      const sql = `select * from ${tableName} limit 5`;

      this.nodeService.queryTable(this.databaseId, sql).subscribe({
        next: (response) => {

          if (response && response.columns && response.rows) {
            this.tableDataResponse = response.rows || [];

            this.columns = response.columns
              .map((column: any) =>
                column.name.split('.').pop()?.replace(')', '')
              )
              .slice(0, this.maxColumn);

            this.dataJson = this.tableDataResponse = response.rows.map((row: any) => {
              let rowData: any = {};

              row.columns.forEach((column: string, index: number) => {
                const value = row.values[index];
                if (value?.n !== undefined) {
                  rowData[this.columns[index]] = value.n; // Số
                } else if (value?.s !== undefined) {
                  rowData[this.columns[index]] = value.s; // Chuỗi
                } else if (value?.b !== undefined) {
                  rowData[this.columns[index]] = value.b; // Boolean
                }
              });
              return rowData;
            });

            this.convertData = JSON.stringify(this.dataJson);
          }
          this.onDataUploadLast()

        },
        error: (error) => {
          console.log('Error: ', error);
        },
      });
    }

  }

  onNodeUnselect(event: any) {
    this.tableDataResponse = [];
    this.columns = [];
    this.isTableSelected = false;

    this.cdr.detectChanges();
  }

  steps = ['Chọn dữ liệu', 'Thông tin', 'Tài liệu', 'Chi phí'];
  currentStep = 0;

  onRequestVersion() {
    const payload = {
      visibility: true,
      group_id: 1,
      sku: 'DATA-' + Date.now(),
      category_id: this.dataField ? this.dataField : 1,
      version: this.version ? this.version : '1.1.1',
      update_interval: '6 MONTH',
      name: this.dataName,
      description: this.htmlContentDes,
      short_description: this.shortDescription,
      tags: 'health',
      use_guide: this.htmlContentApp,
      use_cases: this.htmlContentExample,
      data_type: 1,
      origin_product_id: this.productID,
      updatedAt: this.newVersionForm.get('updateDate')?.value,
      versionDescription: this.newVersionForm.get('versionDescription')?.value,
    }

    console.log('payload: ', payload);
    this.loading = true;

    this.productService.createNewVersion(payload).subscribe({
      next: (res) => {
        console.log('create new ver success: ', res);
        this.loading = false;
        this.getListVersion();
        this.isFormNewVersionAvailable = false;
      },
      error: (err) => {
        console.error('error: ', err);
        this.loading = false;
        this.getListVersion();
      }
    })
  }

  nextStep() {
    if (this.currentStep === 0) {
      if (!this.isTableSelected) {
        this.messageStep1File = 'Vui lòng chọn dữ liệu trước khi tiếp tục.'
        return;
      }
      else {
        this.messageStep1File = '';
      }
    }
    if (this.currentStep === 1) {
      this.onInputChange('dataName');
      this.onInputChange('shortDescription');
      this.onInputChange('version');

      if (
        this.isDataNameInvalid ||
        this.isShortDescriptionInvalid ||
        this.isVersionInvalid
      ) {
        return;
      } else {
        this.messageStep1File = '';
      }
    }

    // Nếu hợp lệ, chuyển sang bước tiếp theo
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    } else {
      this.createData();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  selectPayment(paymentType: string) {
    this.isSelected = paymentType;
  }

  loadNodeDatabase() {
    this.nodeService.getFiles().subscribe(res => {
      this.files = res;
      this.cdr.detectChanges()
    })
  }

  loadPaymentList() {
    this.paymentService.getAll().subscribe((res) => {
      this.paymentData = res;
      this.cdr.detectChanges();
    });
  }

  loadRating() {
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

  loadRatingUnhide() {
    const payload = {
      currentPage: this.currentPage - 1,
      perPage: this.pageSize,
      prodId: this.productID,
      isShow: 0
    }
    this.ratingService.getRating(payload).subscribe({
      next: (res) => {
        this.ratingDatas = res.data;
        console.log('response: ', this.ratingDatas);
        this.recordsTotal = res.recordsTotal;
        console.log('records total: ', this.recordsTotal);
      },
      error: (err) => {
        console.error('error: ', err)
      }
    })
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

  isDataNameInvalid: boolean = true;
  // isOtherFieldInvalid: boolean = false;
  isShortDescriptionInvalid: boolean = true;
  isVersionInvalid: boolean = true;

  currentInvalidField:
    | 'dataName'
    | 'shortDescription'
    | 'version'
    | 'longDescription'
    | null = null;

  isDataFieldInvalid: boolean = false;

  onDataFieldChange() {
    this.isDataFieldInvalid = !this.dataField || this.dataField === '';
  }

  onInputChange(field: 'dataName' | 'shortDescription' | 'version' | 'longDescription') {

    if (field === 'dataName') {
      this.isDataNameInvalid = !this.dataName || this.dataName.trim().length === 0;
      this.messageStep2Name.dataName = this.isDataNameInvalid ? 'Vui lòng nhập tên dữ liệu' : '';
    }

    if (field === 'shortDescription') {
      this.isShortDescriptionInvalid = !this.shortDescription || this.shortDescription.trim().length === 0;
      this.messageStep2Name.shortDescription = this.isShortDescriptionInvalid ? 'Vui lòng nhập mô tả ngắn' : '';
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
            this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diệ
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

  moveItems(sourceList: any[], targetList: any[], selectedItems: any[]): void {
    selectedItems.forEach((item) => {
      sourceList.splice(sourceList.indexOf(item), 1);
      targetList.push(item);
    });
    selectedItems.length = 0; // Clear selection
  }


  // Chọn item trong danh sách
  selectItem(item: string, side: 'left' | 'right'): void {
    if (side === 'left') {
      if (this.selectedLeftItems.includes(item)) {
        this.selectedLeftItems = this.selectedLeftItems.filter(i => i !== item);
      } else {
        this.selectedLeftItems.push(item);
      }
    } else {
      if (this.selectedRightItems.includes(item)) {
        this.selectedRightItems = this.selectedRightItems.filter(i => i !== item);
      } else {
        this.selectedRightItems.push(item);
      }
    }
  }

  // Chuyển item từ danh sách bên trái sang phải
  moveToRight(): void {
    this.selectedLeftItems.forEach(item => {
      this.selectedData = this.selectedData.filter(i => i !== item);
      this.selectedDataDone.push(item);
    });
    this.selectedLeftItems = []; // Xóa danh sách chọn sau khi chuyển
  }

  // Chuyển item từ danh sách bên phải sang trái
  moveToLeft(): void {
    this.selectedRightItems.forEach(item => {
      this.selectedDataDone = this.selectedDataDone.filter(i => i !== item);
      this.selectedData.push(item);
    });
    this.selectedRightItems = []; // Xóa danh sách chọn sau khi chuyển
  }

  // Handle file upload
  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.inputAPILogo = file;
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
    'assets/default1.jpg',
    'assets/default2.jpg',
    'assets/default3.jpg',
  ]; // Default images
  selectedImageIndex: number = 0; // Default selected image index

  inputAPILogo: any;
  inputAPIImage: any[] = [];
  inputAPICertificate: any[] = [];
  uploadedPdfs: { name: string; url: string }[] = [];
  deliveryMethods: any[] = [];
  delivery_id: number = 3;
  example_json: any;

  onImageUpload(event: Event, index: number): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
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

  removePdf(index: number): void {
    this.inputAPICertificate.splice(index, 1); // Remove the file from the array
    this.uploadedPdfs.splice(index, 1);
  }

  getDeliveryMethods() {
    this.productService.getDeliveryMethods().subscribe((res) => {
      this.deliveryMethods = res;
    })
  }

  onCloseModal(): void {
    this.modalService.dismissAll();
  }

  // Chuyển sang bước tiếp theo là tạo đơn
  // Chuyển sang bước tiếp theo là tạo đơn
  createData(): void {
    var createOrrderInput = {
      visibility: true,
      group_id: 1,
      category_id: this.dataField ? this.dataField : 1,
      update_interval: '6 MONTH',
      name: this.dataName,
      description: this.dataDescription,
      short_description: this.shortDescription,
      tags: 'health',
      use_guide: this.htmlContentApp,
      use_cases: this.htmlContentExample,
      data_type: 1
    };

    this.providerDataService.updateData(this.unstructuredDataID, createOrrderInput).subscribe((data) => {
      this.productID = data.product_id;
      this.onDataUploadLast();
      console.log('Tạo mới thành công');
      // this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
      // Show the success message
      const snackBarRef = this.snackBar.open('Tạo mới thành công!', '', {
        duration: 5000, // 5 seconds
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['success-snackbar'] // Custom class for styling
      });

      // After the snackbar is dismissed, navigate to the product provider list
      snackBarRef.afterDismissed().subscribe(() => {
        this.router.navigate(['/product-provider']);
      });

    });
  }

  onDataUploadLast(): void {
    this.providerDataService
      .uploadFileLogo(this.productID, this.inputAPILogo, { customField: 'customValue' })
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
          },
          error: (error) => {
            console.error(`Error uploading file ${index + 1}:`, error);
            // Xử lý lỗi nếu cần
          }
        });
    });
    this.inputAPICertificate.forEach((file, index) => {
      this.providerDataService
        .uploadFileCertificate(this.productID, file, { customField: 'customValue' })
        .subscribe({
          next: (response) => {
          },
          error: (error) => {
            console.error(`Error uploading file ${index + 1}:`, error);
            // Xử lý lỗi nếu cần
          }
        });
    });

    //  this.selectedDataDone.forEach((file, index) => {


    const dataInpop = {
      "name": this.tableInfoData.tableName || '',
      "example_json": this.example_json,
      "table_structure": this.tableInfoData.schemaDefinition,
      "example_images": "",
      "database_id": this.databaseId,
      "table_id": this.selectedTableId,
      // "file_id": file.id,
      // "shared_columns": "{\"name\":\"read\"}"
    }
    console.log("datainpop: ", dataInpop);
    console.log(this.convertData);


    this.providerDataService
      .createProductItem(this.productID, dataInpop)
      .subscribe({
        next: (response) => {
          //  console.log(`File ${index + 1} uploaded successfully:`, response);
          // Cập nhật trạng thái file nếu cần
        },
        error: (error) => {
          //   console.error(`Error uploading file ${index + 1}:`, error);
          // Xử lý lỗi nếu cần
        }
      });
    //    });

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
          planName: durationPlans[0]?.planName,
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
