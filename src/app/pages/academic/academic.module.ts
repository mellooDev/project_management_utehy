import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { TreeModule } from 'primeng/tree';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ToastModule } from 'primeng/toast';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ModalsModule, WidgetsModule } from 'src/app/_metronic/partials';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import {DividerModule} from 'primeng/divider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DepartmentManagementComponent } from './department-management/department-management.component';
import { MajorManagementComponent } from './major-management/major-management.component';
import { ClassManagementComponent } from './class-management/class-management.component';
import { LecturerManagementComponent } from './lecturer-management/lecturer-management.component';
import { StudentManagementComponent } from './student-management/student-management.component';


@NgModule({
  declarations: [
    DepartmentManagementComponent,
    MajorManagementComponent,
    ClassManagementComponent,
    LecturerManagementComponent,
    StudentManagementComponent
  ],
  imports: [
    CommonModule,
    TreeModule,
    FormsModule,// Thêm FormsModule ở đây

    RouterModule.forChild([
      {
        path: 'class-management',
        component: ClassManagementComponent,
      },
      {
        path: 'major-management',
        component: MajorManagementComponent,
      },
      {
        path: 'department-management',
        component: DepartmentManagementComponent,
      },
      {
        path: 'lecturer-management',
        component: LecturerManagementComponent,
      },
      {
        path: 'student-management',
        component: StudentManagementComponent,
      },

    ]),
    WidgetsModule,
    ModalsModule,
    TableModule,
    FormsModule, // Thêm FormsModule ở đây
    NgbPaginationModule,
    ButtonModule,
    NgbTooltipModule,
    MatDialogModule,
    ToggleButtonModule,
    DividerModule,
    InputSwitchModule,
    CalendarModule,
    NgbDropdownModule,
    InputIconModule,
    IconFieldModule,
    InputTextModule,
    DropdownModule,
    MatIconModule,
    NgxBootstrapIconsModule.pick(allIcons),
    AngularEditorModule,
    ToastModule,
    RippleModule,
    CodemirrorModule,
    CheckboxModule
  ],
})
export class AcademicModule { }
