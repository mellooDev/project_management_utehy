import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserListComponent} from "./user-list/user-list.component";
import {UserPostpaidComponent} from "./user-postpaid/user-postpaid.component";
import {RouterModule} from "@angular/router";
import {
  StructuredDataDetailComponent
} from "../product-provider/structured-data/structured-data-detail/structured-data-detail.component";
import {NgbInputDatepicker, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UserPostpaidDetailComponent} from "./user-postpaid-detail/user-postpaid-detail.component";
import {MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {UserPostpaidRegisterComponent} from "./user-postpaid-register/user-postpaid-register.component";
import {TrimDirective} from "../../utils/trim.directive";


@NgModule({
  declarations: [
    UserListComponent,
    UserPostpaidComponent,
    UserPostpaidDetailComponent,
    UserPostpaidRegisterComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'user-list',
        component: UserListComponent,
      },
      {
        path: 'user-postpaid',
        component: UserPostpaidComponent,
      },
    ]),
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
    MatDialogContent,
    MatDialogClose,
    MatDialogTitle,
    MatInputModule,
    ToastModule,
    NgbInputDatepicker,
    TrimDirective
  ],
  providers: [MessageService]
})
export class UserManagementModule {
}
