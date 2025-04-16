import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApproveSellerService } from 'src/app/services/approve-seller.service';
import { ProductService } from 'src/app/services/product.service';
import { DecimalPipe } from '@angular/common';
import { ProviderDataService } from 'src/app/services/provider-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approve-seller-detail',
  templateUrl: './approve-seller-detail.component.html',
  styleUrls: ['./approve-seller-detail.component.scss'],
})
export class ApproveSellerDetailComponent implements OnInit {
  loading: boolean = false;
  isRejectModalVisible: boolean = false; 
  rejectionReason: string = ''; // Lý do từ chối
  isApprovalModalVisible: boolean = false;
  dataDetail: any = {}
  dataImages:any[]=[]
  frontDocument:any;
  backDocument:any;
  constructor(
    private approveSellerService: ApproveSellerService,
    private productService: ProductService,
    private providerDataService: ProviderDataService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private router: Router,

  ) {}

  ngOnInit(): void {
      // Lấy dữ liệu từ LocalStorage nếu tồn tại
      const storedListPay = localStorage.getItem('goDetail');
      if (storedListPay) {
        this.dataDetail = JSON.parse(storedListPay);
      }
      console.log('godataDetailDetail', this.dataDetail);
      this.getImage();

    this.cdr.detectChanges(); // Thông báo Angular cập nhật giao diện
  }

  openApprovalModal(): void {
    this.isApprovalModalVisible = true;
  }

  // Đóng modal khi nhấn vào nút "No"
  closeApprovalModal(): void {
    this.isApprovalModalVisible = false;
  }

  // Xử lý khi nhấn vào "Yes"
  approveSeller(): void {
    console.log("Người bán đã được phê duyệt");
    this.approveSellerService.doApprove(this.dataDetail.id).subscribe(
      (res) => {
        const snackBarRef = this.snackBar.open("Người bán đã được phê duyệt", '', {
          duration: 5000, // 5 seconds
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['success-snackbar'], // Custom class for styling
        });

        // After the snackbar is dismissed, navigate to the desired route
        snackBarRef.afterDismissed().subscribe(() => {
          this.router.navigate(['/approve-seller']);
        });
        
        // Close the modal after rejection
        this.isApprovalModalVisible = false;
      },
      (error) => {
        // Handle error response
        console.error('Error:', error);
        alert('Không thể thực hiện yêu cầu, vui lòng thử lại!');
      }
    );

  }
  openRejectModal(): void {
    this.isRejectModalVisible = true; // Hiển thị modal từ chối
  }

  closeRejectModal(): void {
    this.isRejectModalVisible = false; // Đóng modal từ chối
  }
  confirmRejection(): void {
    if (!this.rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
  
    console.log('Lý do từ chối:', this.rejectionReason);
    
    this.approveSellerService.doReject(this.dataDetail.id, this.rejectionReason).subscribe(
      (res) => {
        // If the response is the string "Đã duyệt", process it
        if (res === 'Đã duyệt') {
          const snackBarRef = this.snackBar.open("Đã thực hiện từ chối thành công", '', {
            duration: 5000, // 5 seconds
            verticalPosition: 'top',
            horizontalPosition: 'right',
            panelClass: ['success-snackbar'], // Custom class for styling
          });
  
          // After the snackbar is dismissed, navigate to the desired route
          snackBarRef.afterDismissed().subscribe(() => {
            this.router.navigate(['/approve-seller']);
          });
          
          // Close the modal after rejection
          this.isRejectModalVisible = false;
        } else {
          // Handle unexpected response
          alert('Có lỗi xảy ra, vui lòng thử lại.');
        }
      },
      (error) => {
        // Handle error response
        console.error('Error:', error);
        alert('Không thể thực hiện yêu cầu, vui lòng thử lại!');
      }
    );
  }
  
  getImage() {
    this.approveSellerService.getImage(this.dataDetail.customer_id).subscribe((res) => {
      this.dataImages = res;
      console.log("dataImages", this.dataImages);
      this.frontDocument = this.dataImages.find(doc => doc.name === 'front');
      this.backDocument = this.dataImages.find(doc => doc.name === 'back');
      
    })
  }
}
