import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {ActivatedRoute, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {MatPaginatorModule} from "@angular/material/paginator";
import {SharedModule} from "../../_metronic/shared/shared.module";
import {MatInputModule} from "@angular/material/input";
import {CommonModule, NgForOf, NgOptimizedImage} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {AuthHTTPService} from "../../modules/auth/services/auth-http";
import {ProductService} from "../../services/product.service";
import {BuyService} from "../../services/buy.service";
import {KeywordService} from "../../services/keyword.service";
import { SearchService } from 'src/app/services/search.service';
import { AppConstants } from 'src/app/utils/app.constants';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatPaginatorModule,
    SharedModule,
    MatInputModule,
    NgForOf,
    FormsModule,
    CommonModule,
    RouterLinkActive,
    RouterLink,
    NgOptimizedImage
  ],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  icon = [
    {icon: 'fas fa-users'},
    {icon: 'fas fa-briefcase'},
    {icon: 'fas fa-globe'},
    {icon: 'fas fa-chart-line'},
    {icon: 'fas fa-heart'},
    {icon: 'fas fa-bullhorn'},
    {icon: 'fas fa-dollar-sign'},
    {icon: 'fas fa-gavel'},
    {icon: 'fas fa-bolt'},
    {icon: 'fas fa-cloud'},
    {icon: 'fas fa-cloud'}
  ];

  logos = [
    {src: './assets/media/logos/factset.png', alt: 'Factset'},
    {src: './assets/media/logos/hubspot.png', alt: 'HubSpot'},
    {src: './assets/media/logos/cb.png', alt: 'CB'},
    {src: './assets/media/logos/hero-section.jpg', alt: 'Stripe'},
    {src: './assets/media/logos/DEP_icon.ico', alt: 'AI Network'},
  ];

  responseCategories: any;
  data: any;
  filteredData: any;
  searchTerm: string = '';
  isLogin: boolean;
  token: string;
  profile: any;
  listProduct: any[] = []
  planType: string
  planByProductIdData:any[] = [];
  mediaUrl: string;
  searchKeyword: string;
  offset: number = 0;
  slideWidth: number = 0;
  constructor(private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private cdr: ChangeDetectorRef,
              private router: Router,
              private authService: AuthHTTPService,
              private productService: ProductService,
              private searchService: SearchService,
              private buyService: BuyService,
              private keywordService: KeywordService) {
  }


  getUserByToken() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    if (!!this.token) {
      this.authService.getUserByToken(this.token).subscribe(res => {

        if (res) {
          this.isLogin = true;
          this.profile = res;
        } else {
          this.isLogin = false
        }
        this.cdr.detectChanges()
      })
    }
  }

  applySearchFilter(): void {
    // Lọc dữ liệu khi tìm kiếm
    if (this.searchTerm) {
      this.filteredData = this.listProduct.filter((item: any) =>
        item.description.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredData = [...this.listProduct].slice(0, 12);
    }
  }


  navigateToDetail(id: number) {
    this.router.navigate(['/category/category-detail', id])
  }

  navigateToRegistration() {
    this.router.navigate(['/auth/registration'])
  }

  navigateToListProduct() {
    this.router.navigate(['/products'])
  }

  getListCatalogs() {
    this.categoryService.getListCategory().subscribe((data) => {
      this.mediaUrl = AppConstants.API_CATALOG_BASE_URL;
      this.responseCategories = data;
    });
  }

  onSearch(): void {
    this.applySearchFilter();
  }

  getListProducts() {
    this.productService.getListProducts(this.searchTerm).subscribe((data) => {
      this.listProduct = data;

      this.applySearchFilter();
    })
  }


  navigateToDetailProduct(id: number) {
    this.router.navigate(['products/', id])
  }
  slide(direction: number): void {
    const maxOffset = -(this.responseCategories.length - 6) * this.slideWidth;

    // Update the offset based on direction
    this.offset = Math.min(0, Math.max(this.offset + direction * this.slideWidth, maxOffset));
  }

  onWheel(event: WheelEvent): void {
    const direction = event.deltaY > 0 ? 1 : -1; // Determine scroll direction
    this.slide(direction);
    event.preventDefault(); // Prevent default scroll behavior
  }
  ngOnInit() {
    this.getListProducts()
    this.getUserByToken()
    this.getListCatalogs()

    this.slideWidth = window.innerWidth / 6;
  setInterval(() => this.slide(1), 3000); // Slide tự động mỗi 3 giây
    
    this.searchService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
      this.applySearchFilter();
    })
    this.cdr.detectChanges()

  }
}

