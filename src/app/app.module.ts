import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {ClipboardModule} from 'ngx-clipboard';
import {TranslateModule} from '@ngx-translate/core';
import {InlineSVGModule} from 'ng-inline-svg-2';
import {NgbDateParserFormatter, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthService} from './modules/auth/services/auth.service';
import {environment} from 'src/environments/environment';
import {SweetAlert2Module} from '@sweetalert2/ngx-sweetalert2';
// #fake-start#
import {FakeAPIService} from './_fake/fake-api.service';
import {CommonModule} from "@angular/common";
import {TruncatePipe} from "./truncate.pipe";
import { TreeModule } from 'primeng/tree';
import { TokenInterceptor } from './services/token.interceptor';
import {ToastrModule} from "ngx-toastr";
import { CustomDateFormatter } from './utils/custom-date-formatter';


// #fake-end#


function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      //@ts-ignore
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}

@NgModule({
  declarations: [AppComponent],
  imports:[
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    ClipboardModule,
    NgbModule,
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
        passThruUnknownUrl: true,
        dataEncapsulation: false,
      })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
    SweetAlert2Module.forRoot(),
    CommonModule,
    TruncatePipe,
    TreeModule,
    ToastrModule.forRoot(), // ToastrModule added
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: NgbDateParserFormatter,
      useClass: CustomDateFormatter
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
