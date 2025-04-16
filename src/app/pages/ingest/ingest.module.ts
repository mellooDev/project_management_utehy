import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DataTablesModule } from 'angular-datatables';
import { ModalsModule, WidgetsModule } from 'src/app/_metronic/partials';
import { CreateIngestionJobComponent } from './components/create-ingestion-job/create-ingestion-job.component';
import { IngestionJobListComponent } from './components/ingestion-job-list/ingestion-job-list.component';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { IngestionJobDetailComponent } from './components/ingestion-job-detail/ingestion-job-detail.component';
import { UpdateIngestionJobComponent } from './components/update-ingestion-job/update-ingestion-job.component';

@NgModule({
  declarations: [
    IngestionJobListComponent,
    CreateIngestionJobComponent,
    IngestionJobDetailComponent,
    UpdateIngestionJobComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    DataTablesModule,
    NgbModalModule,
    RouterModule.forChild([
      {
        path: '',
        component: IngestionJobListComponent,
      },
      {
        path: 'create',
        component: CreateIngestionJobComponent,
      },
      {
        path: 'detail/:id',
        component: IngestionJobDetailComponent,
      },
      
      {
        path: 'update/:id',
        component: UpdateIngestionJobComponent,
      },
    ]),
    SweetAlert2Module.forRoot(),
    WidgetsModule,
    ModalsModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatCheckboxModule,
    MatTooltipModule,
    SharedModule,
  ],
  exports: [
    IngestionJobListComponent,
    CreateIngestionJobComponent, // Nếu cần sử dụng ở các module khác
  ],
})
export class IngestModule {}
