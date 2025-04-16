import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbPaginationModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import { ProductProviderComponent } from './product-provider.component';
import { UnstructuredDataComponent } from './unstructured-data/unstructured-data.component';
import { PackageDeleteDialogComponent } from './structured-data/package-delete-dialog/package-delete-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PackageInputDialogComponent } from './structured-data/package-input-dialog/package-input-dialog.component';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { UnstructruedDeleteDialogComponent } from './unstructured-data/unstructrued-delete-dialog/unstructrued-delete-dialog.component';
import { UnstructruedInputDialogComponent } from './unstructured-data/unstructrued-input-dialog/unstructrued-input-dialog.component';
import { TreeModule } from 'primeng/tree';
import { DataListComponent } from './data-list/data-list.component';
import { StructuredDataComponent } from './structured-data/structured-data.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { UnstructuredDataDetailComponent } from './unstructured-data/unstructured-data-detail/unstructured-data-detail.component';
import { StructuredDataDetailComponent } from './structured-data/structured-data-detail/structured-data-detail.component';
import { ToastModule } from 'primeng/toast';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import {InputSwitchModule} from 'primeng/inputswitch'
// import { Step1Component } from './step1/step1.component';

@NgModule({
  declarations: [
    ProductProviderComponent,
    DataListComponent,
    PackageDeleteDialogComponent,
    PackageInputDialogComponent,
    StructuredDataComponent,
    UnstructuredDataComponent,
    UnstructruedDeleteDialogComponent,
    UnstructruedInputDialogComponent,
    UnstructuredDataDetailComponent,
    StructuredDataDetailComponent
  ],
  imports: [
    CommonModule,
    TreeModule,
    FormsModule ,// Thêm FormsModule ở đây

    RouterModule.forChild([
      {
        path: '',
        component: ProductProviderComponent,
      },
      {
        path: 'data-list',
        component: DataListComponent,
      },
      {
        path: 'unstructured-data',
        component: UnstructuredDataComponent,
      },
      {
        path: 'unstructured-data/:id',
        component: UnstructuredDataDetailComponent,
      },
      {
        path: 'structured-data',
        component: StructuredDataComponent,
      },
      {
        path: 'structured-data/:id',
        component: StructuredDataDetailComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    FormsModule, // Thêm FormsModule ở đây
    NgbPaginationModule,
    MatDialogModule,
    InputSwitchModule,
    MatIconModule,
    NgbRatingModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgxBootstrapIconsModule.pick(allIcons),
    AngularEditorModule,
    ToastModule,
    CodemirrorModule
  ],
})
export class ProductProviderModule {}
