import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BuyComponent } from './buy.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { FormsModule } from '@angular/forms';
import localeVi from '@angular/common/locales/vi'
import { ToastModule } from 'primeng/toast';


registerLocaleData(localeVi);


@NgModule({
  providers: [{provide: LOCALE_ID, useValue:'vi-VN'}],
  declarations: [BuyComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: BuyComponent,
      },
    ]),
    WidgetsModule,
    ToastModule,
    ModalsModule,
    FormsModule // Thêm FormsModule ở đây

  ],
})
export class BuyModule {}
