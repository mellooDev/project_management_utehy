import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MessageService} from "primeng/api";
import {WorksheetListComponent} from "./worksheet-list/worksheet-list.component";
import {MatTabsModule} from "@angular/material/tabs";
import {ToastModule} from "primeng/toast";
import {WorksheetRunningComponent} from "./worksheet-running/worksheet-running.component";
import {MatIconModule} from "@angular/material/icon";
import {MatTreeModule} from "@angular/material/tree";
import {MatListModule} from "@angular/material/list";
import {SharedModule} from "../../_metronic/shared/shared.module";
import {TreeModule} from "@ali-hm/angular-tree-component";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";


@NgModule({
  declarations: [
      WorksheetListComponent,
      WorksheetRunningComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: 'worksheet-list',
                component: WorksheetListComponent,
            },
            {
                path: 'worksheet-running/:id',
                component: WorksheetRunningComponent,
            }
        ]),
        NgbPagination,
        ReactiveFormsModule,
        FormsModule,
        MatTabsModule,
        MatIconModule,
        ToastModule,
        MatTreeModule,
        MatListModule,
        SharedModule,
        TreeModule,
        MatButtonModule,
        MatMenuModule
    ],
  providers: [MessageService]
})
export class WorksheetManagementModule {
}
