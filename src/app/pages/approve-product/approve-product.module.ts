import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbPaginationModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { TreeModule } from 'primeng/tree';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ToastModule } from 'primeng/toast';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ApproveProductComponent } from './approve-product.component';
import { StructuredDetailComponent } from './structured-detail/structured-detail.component';
import { UnstructuredDetailComponent } from './unstructured-detail/unstructured-detail.component';
import { ModalsModule, WidgetsModule } from 'src/app/_metronic/partials';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
  declarations: [
    ApproveProductComponent,
    StructuredDetailComponent,
    UnstructuredDetailComponent,
  ],
  imports: [
    CommonModule,
    TreeModule,
    FormsModule,// Thêm FormsModule ở đây

    RouterModule.forChild([
      {
        path: '',
        component: ApproveProductComponent,
      },
      {
        path: 'structured-data/:id',
        component: StructuredDetailComponent
      },
      {
        path: 'unstructured-data/:id',
        component: UnstructuredDetailComponent
      }

    ]),
    WidgetsModule,
    ModalsModule,
    FormsModule, // Thêm FormsModule ở đây
    NgbPaginationModule,
    MatDialogModule,
    InputSwitchModule,
    NgbRatingModule,
    NgbDropdownModule,
    MatIconModule,
    NgxBootstrapIconsModule.pick(allIcons),
    AngularEditorModule,
    ToastModule,
    CodemirrorModule
  ],
})
export class ApproveProductModule { }
