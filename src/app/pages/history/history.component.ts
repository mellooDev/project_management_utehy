import { Component, OnInit, ChangeDetectorRef, inject, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HistoryService } from 'src/app/services/history.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  loading: boolean = false;
  searchTerm: string = '';
  orderId: string = '';
  orderDetail: any;
  currentPage: number = 1;
  pageSize: number = 10;
  pagedData: any; // Dữ liệu hiển thị trên mỗi trang
  data: any[] = [];
  totalRecords: number = 0;
  selectedItem: any = null; // Dữ liệu của item được chọn
  typeOptions = [
    { label: 'Phi cấu trúc', value: '0' },
    { label: 'Có cấu trúc', value: '1' },
  ];

  constructor(
    private historyService: HistoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
    this.onSearch(); // Khởi tạo
  }

  getTypeLabel(planType: string | null): string {
    // Nếu planType là null, gán giá trị mặc định là "0"
    const normalizedPlanType = planType === null ? '0' : planType;

    const option = this.typeOptions.find(
      (option) => option.value === normalizedPlanType
    );
    return option ? option.label : normalizedPlanType;
  }

  loadData(): void {
    this.loading = true;
    // Make API call to fetch data
    this.historyService.getSearch(this.searchTerm, this.currentPage - 1, this.pageSize)
      .subscribe(
        (response) => {

          // Assuming the API returns 'data' for the items and 'recordsTotal' for total count
          this.data = response.data; // Assign data from API response
          this.pagedData = response.data;

          // this.pagedData.forEach((item: any) => {
          //   this.loadOrderDetail(item.id);
          // })

        
          this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện

          // this.updatePagedData(); // Update paged data based on current page and page size
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.totalRecords / this.pageSize)) {
      this.currentPage = page;
      this.loadData(); // Lấy dữ liệu trang mới
    }
  }

  onSearch(): void {
    this.currentPage = 1; // Reset về trang đầu
    this.loadData(); // Gọi API với từ khóa tìm kiếm
  }

  private modalService = inject(NgbModal);

  loadOrderDetail(id: any) {
    this.loading = true;
    this.historyService.getDetailOrder(id).subscribe(res => {
      this.orderDetail = res;
      this.loading = false;
    });
  }

  open(item: any, content: TemplateRef<any>) {
    this.loadOrderDetail(item.id);

    if(this.orderDetail) {
      this.modalService.open(content);
    }
  }
  
  convertTimestampToDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
  }

  formatNumber(amount: number): string {
    if (amount == null) return '';
    return amount.toLocaleString('en-GB'); // 'en-GB' tự động dùng dấu phẩy
  }
}
