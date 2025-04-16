import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApproveSellerService } from 'src/app/services/approve-seller.service';
import { ProductService } from 'src/app/services/product.service';
import { DecimalPipe } from '@angular/common';
import { ProviderDataService } from 'src/app/services/provider-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approve-seller',
  templateUrl: './approve-seller.component.html',
  styleUrls: ['./approve-seller.component.scss'],
})
export class ApproveSellerComponent implements OnInit {
  loading: boolean = false;
  data: any[] = []; // Raw data from API
  filteredData: any[] = []; // Filtered data after search
  pagedData: any[] = []; // Data displayed for the current page
  searchTerm: string = ''; // Search keyword
  currentPage: number = 1; // Current page
  pageSize: number = 10; // Number of records per page
  totalRecords: number = 0; // Total number of records (for pagination)
  selectedPaymentMethod: string = ''; // Lưu giá trị đã chọn
  selectedDataType: string = '';
  // Danh sách các tùy chọn thanh toán
  paymentOptions = [
    {
      plans: null,
      display: false,
      label: 'DAAS',
      planType: 'POSTPAID',
      des: 'Người mua thanh toán qua mỗi lần query dữ liệu thông qua API',
    },
    {
      plans: null,
      display: false,
      label: 'Full purchase',
      planType: 'FULLPURCHASE',
      des: 'Người mua thanh toán sản phẩm một lần và sở hữu hoàn toàn dữ liệu ',
    },
    {
      plans: null,
      display: false,
      label: 'Trả sau',
      planType: 'PAYPERUSE',
      des: 'Người mua thanh toán và gia hạn theo chu kỳ',
    },
    {
      plans: null,
      display: false,
      label: 'Subcriptions',
      planType: 'DURATION',
      des: 'Người mua dùng thử sản phẩm theo chu kỳ và thanh toán sau khi chu kỳ hết hạn',
    },
  ];
  typeOptions = [
    { label: 'Phi cấu trúc', value: '0' },
    { label: 'Có cấu trúc', value: '1' },
  ];

  constructor(
    private approveSellerService: ApproveSellerService,
    private productService: ProductService,
    private providerDataService: ProviderDataService,
    private cdr: ChangeDetectorRef,
    private router: Router,

  ) {}

  ngOnInit(): void {
    this.loadData(); // Fetch initial data on component load
    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
  }
  loadData(): void {
    this.loading = true;

    // Make API call to fetch data
    this.approveSellerService
      .getSearch()
      .subscribe(
        (response) => {
          // Assuming the API returns 'data' for the items and 'recordsTotal' for total count
          this.data = response; // Assign data from API response
          this.pagedData = response;
          this.totalRecords =  this.data.length; // Total records for pagination
       
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false;
        }
      );
  }

  goDetail(item:any){
    localStorage.setItem('goDetail', JSON.stringify(item));
    this.router.navigate(['/approve-seller/'+item.id]);

  }
  applySearchFilter(): void {
    // Lọc dữ liệu khi tìm kiếm
    if (this.searchTerm) {
      this.filteredData = this.data.filter((item: any) =>
        item?.customer_name?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredData = [...this.data];
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
  // convertMount(amount: number): string {
  //   // Kiểm tra nếu amount không phải là NaN hoặc null
  //   return amount.toLocaleString('en-US'); // 'en-US' đảm bảo sử dụng dấu ',' cho phân cách hàng nghìn
  // }

  convertTimestampToDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString();
  }
  onSearch(): void {
    this.currentPage = 1;
    this.applySearchFilter();
    this.updatePagedData();
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
  const normalizedPlanType = planType === null ? "0" : planType;

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

  getFileDownload(item: any) {
    // Lấy product_image_id có "type": "example"
    const exampleImage = item.detailProduct.images.find(
      (image: any) => image.type === 'example'
    );
  
    if (exampleImage) {
      const productImageId = exampleImage.product_image_id;
  
      // Gọi API để lấy `download_link`
      this.providerDataService.getFileDownload(productImageId).subscribe((res: any) => {
        if (res && res.download_link) {
          // Tạo một thẻ <a> để tải tệp
          const a = document.createElement('a');
          a.href = res.download_link; // URL tải về từ API
          a.download = res.name; // Tên tệp nếu muốn thiết lập
          document.body.appendChild(a); // Thêm vào DOM
          a.click(); // Kích hoạt nhấp chuột
          document.body.removeChild(a); // Loại bỏ khỏi DOM sau khi tải
        }
      });
    } else {
      console.error('Không tìm thấy hình ảnh với type "example"');
    }
  }
  
}
