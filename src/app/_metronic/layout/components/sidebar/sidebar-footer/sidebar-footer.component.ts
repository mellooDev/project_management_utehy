import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import {AuthHTTPService} from "../../../../../modules/auth/services/auth-http";
import {Router} from "@angular/router";
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-sidebar-footer',
  templateUrl: './sidebar-footer.component.html',
  styleUrls: ['./sidebar-footer.component.scss'],
})
export class SidebarFooterComponent implements OnInit {
  // appPreviewChangelogUrl: string = environment.appPreviewChangelogUrl;

  profile: any
  token: string
  constructor(private authService: AuthHTTPService,
              private cdr: ChangeDetectorRef,
              private authLogoutService: AuthService,
              private router: Router) {}

  ngOnInit() {
    this.getUserByToken()
  }


  getUserByToken() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    this.authService.getUserByToken(this.token).subscribe(res => {
      if(res) {
        this.profile = res;
      }
      this.cdr.detectChanges()
    }, error => {
      console.log(error);
    })
  }

  showMore = false;

  toggleShowMore() {
    this.showMore = !this.showMore;
  }

  logout() {
    this.authLogoutService.logout();
  }
}
