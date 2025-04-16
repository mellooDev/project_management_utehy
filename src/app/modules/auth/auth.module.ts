import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AuthComponent } from './auth.component';
import { TranslationModule } from '../i18n/translation.module';
import {SocialComponent} from "./components/social/social.component";
import { RecaptchaModule } from "ng-recaptcha";
import {ToastModule} from 'primeng/toast'
import { RippleModule } from 'primeng/ripple';
import {InputOtpModule} from 'primeng/inputotp';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { VerifyOtpComponent } from './components/verify-otp/verify-otp.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    LogoutComponent,
    AuthComponent,
    SocialComponent,
    VerifyOtpComponent
  ],
  imports: [
    CommonModule,
    TranslationModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RecaptchaModule,
    HttpClientModule,
    ToastModule,
    InputOtpModule,
    RippleModule
  ],
})
export class AuthModule {}
