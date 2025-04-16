import {
  Component,
  OnInit,
  ChangeDetectorRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ProviderDataService } from 'src/app/services/provider-data.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentListService } from 'src/app/services/payment-list.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { UnstructruedDeleteDialogComponent } from './unstructrued-delete-dialog/unstructrued-delete-dialog.component';
import { UnstructruedInputDialogComponent } from './unstructrued-input-dialog/unstructrued-input-dialog.component';
import { PaymentUnstructruedService } from 'src/app/services/payment-unstructrued.service';
import { ProductProviderService } from 'src/app/services/product-provider.service';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-unstructured-data',
  templateUrl: './unstructured-data.component.html',
  styleUrls: ['./unstructured-data.component.scss'],
  providers: [MessageService]
})
export class UnstructuredDataComponent implements OnInit {
  loading: boolean = false;
  loadingSubmit: boolean = false;

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
  productID = 0;

  steps = ['Chọn dữ liệu', 'Thông tin', 'Tài liệu', 'Chi phí'];
  currentStep = 0;
  // Danh sách bên trái
  selectedData: string[] = ['Item 1', 'Item 2', 'Item 3', 'Item 4'];

  isSelected: string = 'free';

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

  constructor(
    private providerDataService: ProviderDataService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private productProviderService: ProductProviderService,
    private dialog: MatDialog,
    private paymentUnstructure: PaymentUnstructruedService,
    private productService: ProductService,
    private router: Router,
   private snackBar: MatSnackBar,
        private messageService: MessageService,
    
  ) { }

  ngOnInit(): void {
    this.getListFile();
    this.getCategories();
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
  }

  showNotification() {
    console.log('Notification triggered');
    this.messageService.add({
      severity: 'success',
      summary: 'Tạo mới thành công!',
      life: 3000
    });

  }
  

  openCreate() {
    if (this.paymentDataLocal.length == 0) {
      localStorage.setItem('listPay', JSON.stringify([]));
    }
    const dialogRef = this.dialog.open(UnstructruedInputDialogComponent, {
      width: '600px',
      data: {}, // Không truyền id, hiểu là thêm mới
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("result ", result)
        // Thêm mới
       // result.id = new Date().getTime(); // Tạo id giả định, có thể thay bằng id từ server
        //this.paymentDataLocal.push(result);
        this.paymentDataLocal = this.paymentDataLocal.concat(result);
        console.log("this.paymentDataLocal ", this.paymentDataLocal)

        localStorage.setItem('listPay', JSON.stringify(this.paymentDataLocal));
      }
    });
    this.cdr.detectChanges();
  }

  openUpdate(id: number) {
    const itemToUpdate = this.paymentDataLocal.find((item) => item.id === id);

    const dialogRef = this.dialog.open(UnstructruedInputDialogComponent, {
      width: '600px',
      data: { ...itemToUpdate }, // Truyền thông tin cần cập nhật
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Cập nhật dữ liệu
        const index = this.paymentDataLocal.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.paymentDataLocal[index] = result[0];
        }
        localStorage.setItem('listPay', JSON.stringify(this.paymentDataLocal));
      }
    });
    this.cdr.detectChanges();
  }

  openDelete(id: number) {
    const dialogRef = this.dialog.open(UnstructruedDeleteDialogComponent, {
      width: '400px',
      data: { message: 'Bạn có chắc chắn muốn tiếp tục?' },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.paymentDataLocal = this.paymentDataLocal.filter(
          (item) => item.id !== id
        ); // Xóa dữ liệu
        localStorage.setItem('listPay', JSON.stringify(this.paymentDataLocal));
      }
    });
    this.cdr.detectChanges();
  }

  getAllPackage() {
    this.paymentUnstructure.getAll().subscribe((res) => {
      this.paymentData = res;
      this.cdr.detectChanges();
    });
  }

  selectPayment(selectPayment: string) {
    this.isSelected = selectPayment;
  }

  getCategories() {
    this.productService.getCategories().subscribe((res) => {
      this.dataAPIField = res;
    });
  }

  // Chuyển sang bước tiếp theo
  nextStep() {

    if (this.loadingSubmit) return; // Prevent multiple clicks while loading
    if (this.currentStep === 0) {
      // Kiểm tra xem danh sách dữ liệu đã chọn có trống không
      if (this.selectedDataDone.length === 0) {
        this.messageStep1File = 'Vui lòng chọn ít nhất một sản phẩm trước khi tiếp tục.';
        return;
      } else {
        this.messageStep1File = ''; // Xóa thông báo lỗi nếu hợp lệ
      }
    }

    if (this.currentStep === 1) {
      this.onInputChange('dataName');
      this.onInputChange('shortDescription');
      this.onInputChange('version');
      this.onInputChange('longDescription');
      this.onInputChange('dataField');

      if (
        this.isDataNameInvalid ||
        this.isShortDescriptionInvalid ||
        this.isVersionInvalid ||
        this.isLongDescriptionInvalid ||
        this.isDataFieldInvalid
      ) {
        return;
      } else {
        this.messageStep1File = '';
      }
    }
    if (this.currentStep === 2) {
      if (this.isDataNameInvalid) {
        //this.messageStep2Name = 'Vui lòng nhập dữ liệu.';
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
    selectedItems.length = 0;
  }

  moveToRight() {
    this.messageStep1File = '';
    this.moveItems(
      this.dataFiles,
      this.selectedDataDone,
      this.selectedLeftItems,
    );
  }

  moveToLeft() {
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

  //tao

  // Chuyển sang bước tiếp theo là tạo đơn
  createData(): void {
    this.loadingSubmit=true;
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diệ

    var createOrrderInput = {
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
      data_type: 0,
    };

    this.providerDataService.createData(createOrrderInput).subscribe((data) => {
     // 
      this.productID = data.product_id;
      this.onDataUploadLast();
      console.log('Tạo mới thành công');
      //this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
      // Show the success message
      // const snackBarRef = this.snackBar.open('Tạo mới thành công!', '', {
      //   duration: 5000, // 5 seconds
      //   verticalPosition: 'top',
      //   horizontalPosition: 'right',
      //   panelClass: ['success-snackbar'], // Custom class for styling
      // });

      // // After the snackbar is dismissed, navigate to the product provider list
      // snackBarRef.afterDismissed().subscribe(() => {
      //   this.router.navigate(['/product-provider']);
      // });

      this.messageService.add({
        severity: 'success',
        summary: 'Tạo mới thành công!',
        life: 3000
      });
      //Delay navigation by 3 seconds
      setTimeout(() => {
        this.loadingSubmit=false;
        this.router.navigate(['/product-provider']);
      }, 3000);
    });
  }

  onDataUploadLast(): void {
    this.providerDataService
      .uploadFileLogo(this.productID, this.inputAPILogo, {
        customField: 'customValue',
      }).subscribe({
        next: (response) => {
          console.log('File uploaded successfully:', response);
        },
        error: (error) => {
          console.error('Error uploading file:', error);
        },
      });

    if (this.inputAPIImage) {
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
            },
          });
      });
    }

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

    if (this.selectedDataDone) {
      this.selectedDataDone.forEach((file, index) => {
        const dataInpop = {
          name: file.fileName,
          file_id: file.id,
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
    }

    if (this.isSelected === 'free') {
      var dataIn = {
        planName: 'FREE',
        productId: this.productID,
        planType: 'FREE',
        basePrice: 0,
        duration: '',
      };

      this.productProviderService.createPlan(dataIn).subscribe({
        next: (response) => {
          console.log(`createPlan successfully:`, response);
        },
        error: (error) => {
          console.error(`Error createPlan:`, error);
        },
      });
    } else {
      // Cập nhật productId
      this.paymentDataLocal.forEach(option => {
          option.productId = this.productID; // Thêm productId vào mỗi option
        });

        
        this.paymentDataLocal.forEach((data, index) => {
        this.productProviderService.createPlan(data).subscribe({
          next: (response) => {
            console.log(`createPlan successfully:`, response);
          },
          error: (error) => {
            console.error(`Error createPlan:`, error);
          },
        });
      });


      // // Separate the DURATION plans from the rest of the plans
      // const durationPlans = this.paymentDataLocal.filter(
      //   (data) => data.planType === 'DURATION'
      // );
      // const otherPlans = this.paymentDataLocal.filter(
      //   (data) => data.planType !== 'DURATION'
      // );

      // console.log('other plan:')
      // console.log(otherPlans);

      // otherPlans.forEach((data, index) => {
      //   var dataIn = {
      //     planName: data.planName,
      //     productId: this.productID,
      //     planType: data.planType,
      //     basePrice: data.basePrice,
      //     duration: '',
      //     planOptions: [
      //       {
      //         optionName: data.planName,
      //         optionPrice: data.optionPrice,
      //         optionDuration: data.optionDuration,
      //         description: data.description,
      //         planAttributes: data.planAttributes,
      //         planAdditionServices: [
      //           {
      //             serviceName: 'string',
      //             servicePrice: 0,
      //             description: 'string',
      //           },
      //         ],
      //       },
      //     ],
      //   };

      //   this.productProviderService.createPlan(dataIn).subscribe({
      //     next: (response) => {
      //       console.log(`createPlan successfully:`, response);
      //     },
      //     error: (error) => {
      //       console.error(`Error createPlan:`, error);
      //     },
      //   });
      // });
      // console.log('duration plan:')
      // console.log(durationPlans);

      // if (durationPlans && durationPlans.length > 0) {
      //   var durationPlansInput = {
      //     planName: durationPlans[0]?.planName,
      //     productId: this.productID,
      //     planType: 'DURATION',
      //     basePrice: durationPlans[0]?.basePrice || 0,
      //     duration: durationPlans[0]?.optionDuration || 0,
      //     planOptions: durationPlans.map(
      //       ({ planName, optionPrice, optionDuration, description, planAttributes }) => ({
      //         optionName: planName,
      //         optionPrice,
      //         optionDuration,
      //         description,
      //         planAttributes: planAttributes,
      //         planAdditionServices: [
      //           {
      //             serviceName: 'string',
      //             servicePrice: 0,
      //             description: 'string',
      //           },
      //         ],
      //       })
      //     ),
      //   };
      //   this.productProviderService.createPlan(durationPlansInput).subscribe({
      //     next: (response) => {
      //       console.log(`createPlan successfully:`, response);
      //     },
      //     error: (error) => {
      //       console.error(`Error createPlan:`, error);
      //     },
      //   });
      // }
    }
  }
}
