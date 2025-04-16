import { Component, OnInit, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { ProductProviderService } from 'src/app/services/product-provider.service';
import { ProviderDataService } from 'src/app/services/provider-data.service';

@Component({
  selector: 'app-product-provider',
  templateUrl: './product-provider.component.html',
  styleUrls: ['./product-provider.component.scss'],
  providers: [MessageService],
})
export class ProductProviderComponent implements OnInit {
  loading: boolean = false;
  data: any[] = []; // Raw data from API
  filteredData: any[] = []; // Filtered data after search
  pagedData: any[] = []; // Data displayed for the current page
  searchTerm: string = ''; // Search keyword
  currentPage: number = 1; // Current page
  pageSize: number = 10; // Number of records per page
  totalRecords: number = 0; // Total number of records (for pagination)
  showMore = false;
  pendingValue: boolean | null = null;
  isModalVisible = false;
  modalRef: any;
  selectedItem: any;

  // switchedStatus : boolean;
  isSwitchChecked: boolean = false;

  constructor(
    private productService: ProductProviderService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private providerDataService:ProviderDataService,
    private snackBar: MatSnackBar,
    private modalService: NgbModal,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadData(); // Fetch initial data on component load
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
  }

  openModalVisibility(content: TemplateRef<any>) {
    this.modalService.open(content)
  }

  loadData(): void {
    this.loading = true;
    // Lấy dữ liệu từ API
    this.productService
      .getSearchOwner(this.searchTerm, this.currentPage - 1, this.pageSize)
      .subscribe(
        (response) => {
          console.log('Dữ liệu từ API:', response);
          this.data = response; // Dữ liệu gốc
          this.filteredData = [...this.data]; // Cập nhật filteredData chính xác



          console.log(
            'Số bản ghi trong filteredData sau khi tải:',
            this.filteredData.length
          );
          this.updatePagedData(); // Cập nhật dữ liệu hiển thị
          this.loading = false;
        },
        (error) => {
          console.error('Lỗi khi tải dữ liệu:', error);
          this.loading = false;
        }
      );
  }

  onSwitchChange(event: any, item: any, content: TemplateRef<any>) {
    this.pendingValue = event.checked;
    this.selectedItem = item;

    this.modalRef = this.modalService.open(content);
    setTimeout(() => {
      item.visibility = !event.checked;
    }, 0);
  }

  onVisibleSubmit() {
    if (this.selectedItem) {
      this.providerDataService.changeVisibility(this.selectedItem.product_id, this.pendingValue ? 'true' : 'false').subscribe(
        (res) => {
          if(res.success) {
            this.selectedItem.visibility = this.pendingValue;
            this.pendingValue = null;
            this.modalRef.close();
          } else {
            console.error('Error: ', res)
          }
        },
        (error) => {
          console.error('Error when call API: ', error)
        }
      )
      this.selectedItem.visibility = this.pendingValue;
    }
    this.pendingValue = null;
    this.modalRef.close();
  }

  closeModal() {
    this.pendingValue = null;
    this.selectedItem = null;
    this.modalRef.dismiss();
  }

  convertTimestampToDate(timestamp: number): string {
    const date = new Date(Math.floor(timestamp) * 1000);


    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();

    // Trả về định dạng dd/mm/yyyy
    return `${day}/${month}/${year}`;
  }
  onSearch(): void {
    this.currentPage = 1; // Reset lại trang khi tìm kiếm
    this.filteredData = this.data.filter((item) =>
      item.description.name.includes(this.searchTerm)
    );
    this.updatePagedData(); // Cập nhật dữ liệu phân trang
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện

  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagedData();
    this.loadData();
    this.cdr.detectChanges();
  }

  updatePagedData(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      console.log('Không có dữ liệu để phân trang');
      return;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Cập nhật `pagedData` chỉ với số bản ghi có sẵn
    this.pagedData = this.filteredData.slice(startIndex, endIndex);
  }

  navigateToComponent(item:any) {
    localStorage.setItem('unstructuredData', JSON.stringify(item));
    if(item.data_type==1){
      this.router.navigate(['/product-provider/structured-data/'+item.product_id]);
    }else{
      this.router.navigate(['/product-provider/unstructured-data/'+item.product_id]);
    }
  }
  //check status
  changeVisibility(item: any, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      item.visibility = target.checked;
      this.providerDataService.changeVisibility(item.product_id,  item.visibility).subscribe((res) => {
        this.snackBar.open('Thay đổi trạng thái thành công!', '', {
          duration: 5000, // 5 seconds
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['success-snackbar'], // Custom class for styling
        });
        this.cdr.detectChanges();
      });
    }
  }
}
