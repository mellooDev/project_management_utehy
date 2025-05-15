import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { TreeModule } from 'primeng/tree';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ToastModule } from 'primeng/toast';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ModalsModule, WidgetsModule } from 'src/app/_metronic/partials';
import { DragDropModule } from 'primeng/dragdrop'
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import {DividerModule} from 'primeng/divider';
import { InstructionManagementComponent } from './instruction-management.component';
import {SafeHtmlPipe} from "../../utils/safehtml.pipe";



@NgModule({
  declarations: [
    InstructionManagementComponent
  ],
  imports: [
    CommonModule,
    TreeModule,
    FormsModule,// Thêm FormsModule ở đây

    RouterModule.forChild([
      {
        path: '',
        component: InstructionManagementComponent,
      },

    ]),
    WidgetsModule,
    DragDropModule,
    ModalsModule,
    DividerModule,
    FormsModule,
    NgbPaginationModule,
    MatDialogModule,
    TableModule,
    SafeHtmlPipe,
    NgbDropdownModule,
    NgbTooltipModule,
    MatIconModule,
    NgxBootstrapIconsModule.pick(allIcons),
    AngularEditorModule,
    ToastModule,
    RippleModule,
  ],
})
export class InstructionManagementModule { }
