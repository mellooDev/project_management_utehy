import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {CrudModule} from "../../modules/crud/crud.module";
import {SharedModule} from "../../_metronic/shared/shared.module";
import {NgbCollapseModule, NgbDropdownModule, NgbNavModule, NgbRatingModule, NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {SweetAlert2Module} from "@sweetalert2/ngx-sweetalert2";
import {ProductDetailComponent} from "./product-detail/product-detail.component";
import {ProductListComponent} from "./product-list/product-list.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProductListComponent
      },

      {
        path: ':id',
        component: ProductDetailComponent,
      },

    ]),
    CrudModule,
    SharedModule,
    NgbNavModule,
    NgbDropdownModule,
    NgbRatingModule,
    NgbCollapseModule,
    NgbTooltipModule,
    SweetAlert2Module.forChild(),
  ]
})
export class ProductModule {
}
