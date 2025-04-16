import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { FormsModule } from '@angular/forms';
import { BuyedComponent } from './buyed.component';
import { NgbDropdownModule, NgbPaginationModule, NgbRatingModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {CodemirrorModule} from '@ctrl/ngx-codemirror'
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [BuyedComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: BuyedComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    ToastModule,
    CodemirrorModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbRatingModule,
    FormsModule // Thêm FormsModule ở đây
    , NgbPaginationModule
  ],
})
export class BuyedModule {}
