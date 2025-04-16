import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from "../../_metronic/shared/shared.module";
import { StatisticComponent } from './statistic.component';



@NgModule({
  declarations: [StatisticComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: StatisticComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    NgbDropdownModule,
    NgbPaginationModule,
    SharedModule,
    FormsModule // Thêm FormsModule ở đây

  ],
})
export class StatisticModule {}
