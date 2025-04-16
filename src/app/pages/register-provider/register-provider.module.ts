import {NgModule} from "@angular/core";
import {ProfileComponent} from "../profile/profile.component";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {ModalsModule, WidgetsModule} from "../../_metronic/partials";
import {FormsModule} from "@angular/forms";
import {RegisterProviderComponent} from "./register-provider.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: RegisterProviderComponent,
      },
    ]),
    WidgetsModule,
    ModalsModule,
    FormsModule,
    RegisterProviderComponent,
    // Thêm FormsModule ở đây

  ],
})
export class RegisterProviderModule {}
