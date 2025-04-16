import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { FormsModule } from '@angular/forms';
import { HistoryComponent } from './history.component';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [HistoryComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HistoryComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    FormsModule // Thêm FormsModule ở đây
    , NgbPaginationModule
  ],
})
export class HistoryModule {}
