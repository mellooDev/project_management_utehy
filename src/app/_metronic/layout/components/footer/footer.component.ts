import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { AuthHTTPService } from "../../../../modules/auth/services/auth-http";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input() appFooterContainerCSSClass: string = '';

  currentDateStr: string = new Date().getFullYear().toString();
  constructor(private authService: AuthHTTPService,
    private cdr: ChangeDetectorRef) { }
  isLogin: boolean;
  token: string;

  ngOnInit() {
    this.getUserByToken()
  }

  getUserByToken() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    if (this.token != undefined || this.token != null) {
      this.authService.getUserByToken(this.token).subscribe(res => {
        if (res) {
          this.isLogin = true;
        } else {
          this.isLogin = false
        }
        this.cdr.detectChanges()
      })
    }
  }

}
