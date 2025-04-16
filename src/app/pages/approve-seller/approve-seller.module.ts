import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { FormsModule } from '@angular/forms';
import { ApproveSellerComponent } from './approve-seller.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ApproveSellerDetailComponent } from './approve-seller-detail/approve-seller-detail.component';

@NgModule({
  declarations: [ApproveSellerComponent, ApproveSellerDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ApproveSellerComponent,
      },
      {
        path: ':id',
        component: ApproveSellerDetailComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    FormsModule // Thêm FormsModule ở đây
    , NgbPaginationModule
  ],
})
export class ApproveSellerModule {}
