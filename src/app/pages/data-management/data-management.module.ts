import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {ModalsModule, WidgetsModule} from "../../_metronic/partials";
import {FormsModule} from "@angular/forms";
import {DataManagementComponent} from "./data-management.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DataManagementComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    FormsModule,
    // Thêm FormsModule ở đây

  ],
})
export class DataManagementModule {
}
