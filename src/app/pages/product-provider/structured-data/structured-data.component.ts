import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
import { PackageDeleteDialogComponent } from './package-delete-dialog/package-delete-dialog.component';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PackageInputDialogComponent } from './package-input-dialog/package-input-dialog.component';
export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

import { MessageService, TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { DatasetNodeService } from 'src/app/services/dataset-node.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { FormGroup } from '@angular/forms';
import { PaymentUnstructruedService } from 'src/app/services/payment-unstructrued.service';
import { ProductProviderService } from 'src/app/services/product-provider.service';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ToastrService} from "ngx-toastr";

interface CustomNodeTree extends TreeNode {
  tableInfo?: any;
}
@Component({
  selector: 'app-structured-data',
  templateUrl: './structured-data.component.html',
  styleUrls: ['./structured-data.component.scss'],
  providers: [MessageService]
})
export class StructuredDataComponent implements OnInit {
  loading: boolean = false;
  loadingSubmit: boolean = false;

  activeStep = 1; // Bước hiện tại
  status: 'active' | 'inactive' = 'inactive'; // Trạng thái ban đầu
  isSelected: string = 'free';
  selectedFiles: any;

  paymentData: any[] = [];
  paymentDataLocal: any[] = [];
  tableInfoData: any = {};


  constructor(
    private providerDataService: ProviderDataService,
    private cdr: ChangeDetectorRef,
    private paymentService: PaymentListService,
    private dialog: MatDialog,
    private nodeService: DatasetNodeService,
    private paymentUnstructure: PaymentUnstructruedService,
    private productProviderService: ProductProviderService,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar,
            private messageService: MessageService,
    private toastr: ToastrService
  ) { }

  // openDelete() {
  //   this.dialog.open(PackageDeleteDialogComponent, {
  //     width: '400px',
  //     data: { message: 'Bạn có chắc chắn muốn tiếp tục?' },
  //   });
  // }

  // openCreate() {
  //   this.dialog.open(PackageInputDialogComponent, {
  //     width: '600px',
  //     data: { message: 'Bạn có chắc chắn muốn tiếp tục?' },
  //   });
  // }

  // openUpdate() {
  //   this.dialog.open(PackageInputDialogComponent, {
  //     width: '600px',
  //     data: { message: 'Bạn có chắc chắn muốn tiếp tục?' },
  //   });
  // }


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
        console.log(result);

        for(let i = 0; i < this.paymentDataLocal.length; i++) {
          if (this.paymentDataLocal[i].planName === result[0].planName) {
            this.toastr.error('Tên gói đã tồn tại', 'Thông báo', {timeOut: 3000});
            return;
          }
        }

        // Thêm mới
        result.id = new Date().getTime(); // Tạo id giả định, có thể thay bằng id từ server
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

        for(let i = 0; i < this.paymentDataLocal.length; i++) {
          if (this.paymentDataLocal[i].id != result[0].id &&
            this.paymentDataLocal[i].planName === result[0].planName) {
            this.toastr.error('Tên gói đã tồn tại', 'Thông báo', {timeOut: 3000});
            return;
          }
        }
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



  columns: any[] = [];
  rows: any[] = [];

  files: TreeNode<any>[] = [];
  tableDataResponse: any[] = [];
  maxColumn: number = 5;
  selectedNodes: any[] = [];

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
  longDescription: string = '';
  dataDescription: string = '';
  version: string = '';
  displayOption: string = 'hiển thị'; // Mặc định là "hiển thị"
  ownershipOption: string = 'Chủ sở hữu'; // Mặc định là "Chủ sở hữu"
  dataAPIField: any[] = [];
  isTableSelected = false;

  ngOnInit(): void {
    this.loadNodeDatabase();
    // this.loadPaymentList();
    this.getCategories();
    this.getDeliveryMethods();
    this.cdr.detectChanges();
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
          //this.onDataUploadLast()

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

  nextStep() {
    if (this.loadingSubmit) return; // Prevent multiple clicks while loading

    if (this.currentStep === 0) {
      console.log(this.selectedFiles);
      if (this.selectedFiles.length < 1) {
        this.messageStep1File = 'Vui lòng chọn dữ liệu trước khi tiếp tục.'
        return;
      } else {
        this.messageStep1File = '';
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
      console.log(this.files);
      this.cdr.detectChanges()
    })
  }

  loadPaymentList() {
    this.paymentService.getAll().subscribe((res) => {
      this.paymentData = res;
      this.cdr.detectChanges();
    });
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

  isDataFieldInvalid: boolean = false;

  onDataFieldChange() {
    this.isDataFieldInvalid = !this.dataField || this.dataField === '';
  }


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

  // Chuyển sang bước tiếp theo là tạo đơn
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
      data_type: 1
    };

    this.providerDataService.createData(createOrrderInput).subscribe((data) => {
      this.productID = data.product_id;

      this.onDataUploadLast();
      // Show the success message
      // const snackBarRef = this.snackBar.open('Tạo mới thành công!', '', {
      //   duration: 5000, // 5 seconds
      //   verticalPosition: 'top',
      //   horizontalPosition: 'right',
      //   panelClass: ['success-snackbar'] // Custom class for styling
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
      // Delay navigation by 3 seconds
      setTimeout(() => {
        this.loadingSubmit=false;
        this.router.navigate(['/product-provider']);
      }, 3000);


    });
  }

  onDataUploadLast(): void {

    if (this.inputAPILogo) {
      this.providerDataService.uploadFileLogo(this.productID, this.inputAPILogo, { customField: 'customValue' })
        .subscribe({
          next: (response) => {
          },
          error: (error) => {
            console.error('Error uploading file:', error);
          },
        });
    }

    if (this.inputAPIImage) {
      this.inputAPIImage.forEach((file, index) => {
        this.providerDataService.uploadFileExample(this.productID, file, { customField: 'customValue' })
          .subscribe({
            next: (response) => {
            },
            error: (error) => {
              console.error(`Error uploading file ${index + 1}:`, error);
            }
          });
      });
    }

    if (this.inputAPICertificate) {
      this.inputAPICertificate.forEach((file, index) => {
        this.providerDataService
          .uploadFileCertificate(this.productID, file, { customField: 'customValue' })
          .subscribe({
            next: (response) => {
              // Cập nhật trạng thái file nếu cần
            },
            error: (error) => {
              console.error(`Error uploading file ${index + 1}:`, error);
            }
          });
      });
    }


    this.selectedFiles.forEach((selectedTable: any) => {
      if (!selectedTable.children) {
        let keyParts = selectedTable.key.split('-');
        this.files.forEach(file => {
          file.children?.forEach((tb: any) => {
            if (selectedTable.key == tb.key) {
              console.log("Table: " + selectedTable.key);

              const dataInpop = {
                "name": selectedTable.label || '',
                "example_json": this.example_json,
                "table_structure": tb.tableInfo?.schemaDefinition,
                "example_images": "",
                "database_id": keyParts[0],
                "table_id": keyParts[1],
              }

              this.providerDataService.createProductItem(this.productID, dataInpop)
                .subscribe({
                  next: (response) => {
                  },
                  error: (error) => {
                  }
                });
            }
          })
        })
      }
    });

    if (this.isSelected === 'free') {
      var dataIn = {
        planName: 'FREE',
        productId: this.productID,
        planType: 'FREE',
        basePrice: 0,
        duration: 'string',
      };

      this.productProviderService.createPlan(dataIn).subscribe({
        next: (response) => {
        },
        error: (error) => {
          console.error(`Error createPlan:`, error);
        },
      });
    } else {
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
      // Separate the DURATION plans from the rest of the plans
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
      //     },
      //     error: (error) => {
      //       console.error(`Error createPlan:`, error);
      //     },
      //   });
      // });


      // console.log('durationPlans her plan:')
      // console.log(durationPlans);

      // if (durationPlans && durationPlans.length > 0) {
      //   var durationPlansInput = {
      //     planName: durationPlans[0]?.planName,
      //     productId: this.productID,
      //     planType: 'DURATION',
      //     basePrice: durationPlans[0]?.basePrice || 0,
      //     duration: durationPlans[0]?.optionDuration || 0,
      //     planOptions: durationPlans.map(
      //       ({ planName, optionPrice, optionDuration, description, planAttributes}) => ({
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
      //     },
      //     error: (error) => {
      //       console.error(`Error createPlan:`, error);
      //     },
      //   });
      // }
    }

  }


}
