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
import { ModalsModule, WidgetsModule } from 'src/app/_metronic/partials';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RippleModule } from 'primeng/ripple';
import { LecturerProjectManagementComponent } from './lecturer-project-management.component';
import { CreateTopicComponent } from './create-topic/create-topic.component';
import { FileUploadModule } from 'primeng/fileupload';
import { MultiSelectModule } from 'primeng/multiselect';




@NgModule({
  declarations: [
    LecturerProjectManagementComponent,
    CreateTopicComponent
  ],
  imports: [
    CommonModule,
    TreeModule,
    FormsModule,// Thêm FormsModule ở đây

    RouterModule.forChild([
      {
        path: '',
        component: LecturerProjectManagementComponent,
      },
      {
        path: 'create-topic',
        component: CreateTopicComponent
      },

    ]),
    WidgetsModule,
    ModalsModule,
    FileUploadModule,
    FormsModule, // Thêm FormsModule ở đây
    NgbPaginationModule,
    MatDialogModule,
    InputSwitchModule,
    MultiSelectModule,
    NgbRatingModule,
    NgbDropdownModule,
    MatIconModule,
    NgxBootstrapIconsModule.pick(allIcons),
    AngularEditorModule,
    ToastModule,
    RippleModule,
    CodemirrorModule
  ],
})
export class LecturerProjectManagementModule { }
