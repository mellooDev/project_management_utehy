import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject,
  TemplateRef,
} from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProviderDataService } from 'src/app/services/provider-data.service';

@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss'],
})
export class DataListComponent implements OnInit {
  loading: boolean = false;
  data: any[] = []; // Raw data from API
  filteredData: any[] = []; // Filtered data after search
  pagedData: any[] = []; // Data displayed for the current page
  searchTerm: string = ''; // Search keyword
  currentPage: number = 1; // Current page
  pageSize: number = 10; // Number of records per page
  totalRecords: number = 0; // Total number of records (for pagination)
  typeOptions = [
    { label: 'Phi cấu trúc', value: '0' },
    { label: 'Có cấu trúc', value: '1' },
  ];
  constructor(
    private providerDataService: ProviderDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    // Gọi API để lấy dữ liệu
    this.providerDataService
      .getAllDataList(this.searchTerm, this.currentPage - 1, this.pageSize)
      .subscribe(
        (response) => {
          this.data = response; 
          this.applySearchFilter(); 

          this.totalRecords = this.filteredData.length;

          this.updatePagedData();
          this.loading = false;
        },
        (error) => {
          console.error('Lỗi khi tải dữ liệu:', error);
          this.loading = false;
        }
      );
  }

  convertTimestampToDate(timestamp: number): string {
    // Chuyển timestamp sang milliseconds
    const date = new Date(Math.floor(timestamp) * 1000);

    // Lấy ngày, tháng, năm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();

    // Trả về định dạng dd/mm/yyyy
    return `${day}/${month}/${year}`;
  }

  private modalService = inject(NgbModal);
  closeResult = '';

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Close with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  applySearchFilter(): void {
    // Lọc dữ liệu khi tìm kiếm
    if (this.searchTerm) {
      this.filteredData = this.data.filter(
        (item) =>
          item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) 
      );
    } else {
      this.filteredData = [...this.data]; 
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applySearchFilter();
    this.updatePagedData();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.totalRecords / this.pageSize)) {
      this.currentPage = page;
      this.updatePagedData();
    }
  }

  updatePagedData(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      console.log('Không có dữ liệu để phân trang');
      this.pagedData = [];
      return;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.filteredData.length
    );

    this.pagedData = this.filteredData.slice(startIndex, endIndex);

    this.cdr.detectChanges();
  }

  getTypeLabel(planType: string | null) {
    // Nếu planType là null, gán giá trị mặc định là "0"
 const normalizedPlanType = planType === null ? "0" : planType;

   const option = this.typeOptions.find(
     (option) => option.value === normalizedPlanType
   );
   return option ? option.label : normalizedPlanType;
 }
}
