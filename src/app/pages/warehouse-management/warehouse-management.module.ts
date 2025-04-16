import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { FormsModule } from '@angular/forms';
import { WarehouseManagementComponent } from './warehouse-management.component';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from "../../_metronic/shared/shared.module";
import {CdkAccordionModule} from "@angular/cdk/accordion";
import {MatCheckboxModule} from "@angular/material/checkbox";
import localeVi from '@angular/common/locales/vi'
import { ToastModule } from 'primeng/toast';
import { WarehouseDetailComponent } from './warehouse-detail/warehouse-detail.component';

registerLocaleData(localeVi);


@NgModule({
  providers: [{provide: LOCALE_ID, useValue:'vi-VN'}],
  declarations: [
    WarehouseManagementComponent,
    WarehouseDetailComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: WarehouseManagementComponent,
      },
      {
        path: ':id',
        component: WarehouseDetailComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    NgbDropdownModule,
    NgbPaginationModule,
    SharedModule,
    FormsModule,
    CdkAccordionModule,
    MatCheckboxModule,
    ToastModule,
    // Thêm FormsModule ở đây

  ],
})
export class WarehouseManagementModule {}
