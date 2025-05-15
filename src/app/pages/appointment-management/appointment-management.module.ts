import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbPaginationModule, NgbRatingModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
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
import { LecturerAppointmentComponent } from './lecturer-appointment/lecturer-appointment.component';
import { StudentAppointmentComponent } from './student-appointment/student-appointment.component';
import { CardModule } from 'primeng/card';


@NgModule({
  declarations: [
    LecturerAppointmentComponent,
    StudentAppointmentComponent
  ],
  imports: [
    CommonModule,
    TreeModule,
    FormsModule,// Thêm FormsModule ở đây

    RouterModule.forChild([
      {
        path: 'lecturer-appointment',
        component: LecturerAppointmentComponent,
      },
      {
        path: 'student-appointment',
        component: StudentAppointmentComponent,
      },

    ]),
    WidgetsModule,
    ModalsModule,
    FormsModule,
    NgbPaginationModule,
    MatDialogModule,
    InputSwitchModule,
    NgbRatingModule,
    CardModule,
    NgbDropdownModule,
    NgbTooltipModule,
    MatIconModule,
    NgxBootstrapIconsModule.pick(allIcons),
    AngularEditorModule,
    ToastModule,
    RippleModule,
    CodemirrorModule
  ],
})
export class AppointmentManagementModule { }
