import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from "../../../_metronic/shared/shared.module";
import { CommonModule, NgClass, NgForOf } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatInputModule } from "@angular/material/input";
import { ProductService } from "../../../services/product.service";
import { error } from "@angular/compiler-cli/src/transformers/util";
import { AuthService } from "../../../modules/auth";
import { AuthHTTPService } from "../../../modules/auth/services/auth-http";
import { BuyService } from "../../../services/buy.service";
import { CategoryService } from "../../../services/category.service";
import { KeywordService } from "../../../services/keyword.service";
import { Subscription } from "rxjs/internal/Subscription";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { from } from "rxjs";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    MatPaginatorModule,
    SharedModule,
    MatInputModule,
    NgForOf,
    FormsModule,
    NgClass,
    CommonModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy {
  dataProducts: any[] = [];

  isLogin: boolean;
  token: string;

  planByProductIdData: any[] = [];

  listCategories: any[] = []

  selectedCategory: number | null = null;

  currentKeyword: string = '';

  private keywordSubscription: Subscription = new Subscription();

  constructor(private router: Router,
    private productService: ProductService,
    private authService: AuthHTTPService,
    private cdr: ChangeDetectorRef,
    private buyService: BuyService,
    private categoryService: CategoryService,
    private keywordService: KeywordService) {
  }

  navigateToDetail(id: number) {
    this.router.navigate(['/products', id])
  }

  getUserByToken() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    if (this.token != undefined || this.token != null) {
      this.authService.getUserByToken(this.token).subscribe(res => {
        if (res) {
          this.isLogin = true;
        } else {
          this.isLogin = false
        }
        this.cdr.detectChanges()
      })
    }
  }

  async getListProducts(keyword: string) {
    try {
      this.dataProducts = []
      const data = await this.productService.search(keyword).toPromise();
      const promises = data?.map(async (product: any) => {
        if (!product.plans) {
          product.plans = [];
        }
        try {
          const planData = await this.buyService.getPlanByProductId(product.product_id).toPromise();
          if (planData?.data && Array.isArray(planData.data)) {
            this.planByProductIdData = planData.data;
            this.planByProductIdData.forEach(newItem => {
              if (newItem && newItem.planType) {
                const planExists = product.plans.some((plan: any) => plan.planType === newItem.planType);
                if (!planExists) {
                  if (newItem.planType !== 'FREE') {
                    product.plans.push({
                      planType: 'PAID'
                    });
                  } else {
                    product.plans.push({
                      planType: 'FREE'
                    });
                  }
                }
                this.dataProducts.push(product);
              } else {
                console.log("newItem hoặc planType không hợp lệ:", newItem);
              }
            });
          } else {
            this.planByProductIdData = [];
          }
        } catch (error) {
            console.log(error);
            this.dataProducts.push(product);
        }

      });
      await Promise.all(promises);
      this.cdr.detectChanges();
      return this.dataProducts;  // Trả về mảng sản phẩm
    } catch (error) {
      console.log(error);
      return [];  // Trả về mảng trống nếu có lỗi
    }
  }

  getListCategories() {
    this.categoryService.getListCategory().subscribe((data) => {
      this.listCategories = data;
      this.listCategories.unshift({
        categoryId: null,
        name: 'Lĩnh vực'
      });
      this.selectedCategory = null
    }, error => {
      console.log(error);
    })
  }

  onChangeCategory(event: any) {
    this.selectedCategory = event.target.value;
  }

  ngOnInit() {
    this.getUserByToken()
    this.getListCategories()
    this.keywordSubscription = this.keywordService.currentKeyword.pipe(
      debounceTime(1500),
      distinctUntilChanged(),
      switchMap((keyword) => {
        if (keyword.trim()) {
          return from(this.getListProducts(keyword));
        } else {
          return from(this.getListProducts(""));  // Nếu từ khóa rỗng, gọi API với từ khóa rỗng
        }
      })
    ).subscribe(
      (products) => {

        this.dataProducts = products;  // Cập nhật danh sách sản phẩm
      },
      (error) => {
        console.error('Error fetching products:', error);  // Xử lý lỗi nếu có
      }
    );
  }

  ngOnDestroy() {
    // Hủy subscription khi component bị hủy
    this.keywordSubscription.unsubscribe();
  }


}
