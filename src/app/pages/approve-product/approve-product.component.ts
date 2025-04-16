import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApproveProductService } from 'src/app/services/approve-product.service';

@Component({
  selector: 'app-approve-product',
  templateUrl: './approve-product.component.html',
  styleUrl: './approve-product.component.scss'
})
export class ApproveProductComponent implements OnInit {

  requestProd: any[] = [];
  currentPage: number = 1;
  // perPage: number = 10;
  recordsTotal: number = 0;
  pageSize: number = 10;
  searchTerm: string = '';

  sortDesc: boolean = true;
  productDetailItem: any;
  selectedProductId: number;
  filter = '';

  constructor( private approveProdService: ApproveProductService, private router: Router ) {}

  ngOnInit(): void {
    this.onLoadProdRequest();
  }

  navigateToComponent(item:any) {
    this.approveProdService.setRequestId(item.id);
    if(item.data_type==1){
      this.router.navigate(
        ['/approve-product/structured-data/'+item.product_id]
      );
    }else{
      this.router.navigate(
        ['/approve-product/unstructured-data/'+item.product_id]
      );
    }
  }

  clearSearch() {
    this.filter = '';
    this.onLoadProdRequest();
  }

  onSearch(): void {
    this.onLoadProdRequest();
  }

  onLoadProdRequest() {
    // const params =
    this.approveProdService.getProdRequest(this.currentPage, this.pageSize, this.sortDesc, this.filter.trim()).subscribe({
      next: (res) => {
        console.log('response: ', res);
        this.requestProd = res.data;
        this.recordsTotal = res.recordsTotal;
        console.log('records total: ', this.recordsTotal);

      },
      error: (err) => {
        console.error('error: ', err)
      }
    })
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.onLoadProdRequest();
  }

  getApproveStatusText(status: number): string {
    switch(status) {
      case 0:
        return 'Chờ duyệt';
      case 1:
        return 'Đã phê duyệt';
      case 2:
        return 'Từ chối';
      case 3:
        return 'Ngừng bán';
      default:
        return 'Không xác định';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 0:
        return '#F29339';
      case 1:
        return '#198574';
      case 2:
        return '#344CB7'
      case 3:
        return '#dc3545';
      default:
        return '#000';
    }
  }


}
