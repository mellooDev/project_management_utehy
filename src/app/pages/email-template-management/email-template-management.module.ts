import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from "../../_metronic/shared/shared.module";
import {ToastModule} from 'primeng/toast'
import { EmailTemplateManagementComponent } from './email-template-management.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import {SafeHtmlPipe} from "../../utils/safehtml.pipe";



@NgModule({
  declarations: [EmailTemplateManagementComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: EmailTemplateManagementComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    NgbDropdownModule,
    AngularEditorModule,
    NgbPaginationModule,
    NgbModalModule,
    SharedModule,
    ToastModule,
    FormsModule,
    SafeHtmlPipe,
    // Thêm FormsModule ở đây

  ],
})
export class EmailTemplateManagementModule {}
