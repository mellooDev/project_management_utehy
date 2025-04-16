import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {ProfileComponent } from './profile.component';
import { ModalsModule, WidgetsModule } from '../../_metronic/partials';
import {ToastModule} from 'primeng/toast'
import { RippleModule } from 'primeng/ripple';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from "../../_metronic/shared/shared.module";
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProfileComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    NgbDatepickerModule,
    ToastModule,
    RippleModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule

  ],
})
export class ProfileModule {}
