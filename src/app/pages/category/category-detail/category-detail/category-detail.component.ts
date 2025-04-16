import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatPaginatorModule } from "@angular/material/paginator";
import { SharedModule } from "../../../../_metronic/shared/shared.module";
import { MatInputModule } from "@angular/material/input";
import { CommonModule, NgForOf } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Category } from "../../../../models/category";
import { CategoryService } from "../../../../services/category.service";
import { ProductService } from "../../../../services/product.service";
import { ProductModule } from "../../../product/product.module";
import { AuthHTTPService } from 'src/app/modules/auth/services/auth-http';


@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [
    MatPaginatorModule,
    SharedModule,
    MatInputModule,
    NgForOf,
    FormsModule,
    CommonModule
  ],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss'
})



export class CategoryDetailComponent implements OnInit {

  title = 'Demographics Filter UI';

  // Sorting options
  sortingOption = 'Most Popular';
  isLogin: boolean;
  profile: any;

  // View modes
  isGridView = true;

  // Switch view
  toggleView(mode: string) {
    this.isGridView = mode === 'grid';
  }

  files = [
    '2020_METADATA_CBG',
    '2020_CBG_GEOMETRY',
    '2020_CBG_B20',
    '2019_CBG_B22',
    '2019_CBG_PATTERNS',
    '2020_CBG_B17',
    '2019_CBG_B23'
  ];

  idCategory: number;
  token: string;
  category: Category = new Category();
  listProductByCategory: any;

  constructor(private router: Router,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private categoryService: CategoryService,
    private productService: ProductService,
    private authService: AuthHTTPService,) {
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

  navigateToDetail(id: number) {
    this.router.navigate(['/products', id])
  }

  options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];
  selectedOption = '1';

  onChangeOption(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
  }

  getDetailCategory(id: number) {
    this.categoryService.getCategoryById(id).subscribe((res) => {
      this.category = res.category;
      this.listProductByCategory = res.items;
      this.cdr.detectChanges();
    })
  }

  ngOnInit(): void {
    this.idCategory = this.activatedRoute.snapshot.params['id'];
    this.getDetailCategory(this.idCategory);
    this.getUserByToken();
  }


}
