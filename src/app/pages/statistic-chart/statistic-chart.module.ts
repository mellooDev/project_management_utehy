import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogContent } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'primeng/api';
import { WidgetsModule, ModalsModule } from 'src/app/_metronic/partials';
import { StatisticChartComponent } from './statistic-chart.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [StatisticChartComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: StatisticChartComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    FormsModule,
    MatInputModule,
    MatDialogContent,
    MatTabsModule,
  ],
})
export class StatisticChartModule {}
