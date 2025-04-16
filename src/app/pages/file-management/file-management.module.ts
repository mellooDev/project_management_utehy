import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {ModalsModule, WidgetsModule} from "../../_metronic/partials";
import {FormsModule} from "@angular/forms";
import { FileManagementComponent } from "./file-management.component";
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { NgbPaginationModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [
    FileManagementComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: FileManagementComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    NgbPaginationModule,
    FormsModule,
    NgbTooltipModule,
    NgxBootstrapIconsModule.pick(allIcons)
    // Thêm FormsModule ở đây

  ],
})
export class FileManagementModule {
}
