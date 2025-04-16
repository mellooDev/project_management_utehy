import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import * as jwt_decode from 'jwt-decode';
import {AuthHTTPService} from "../../../../../modules/auth/services/auth-http";

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  constructor(private authService: AuthHTTPService,
              private cdr: ChangeDetectorRef) { }

  groupdId: number;

  getUserByToken() {
    const token = <string>localStorage.getItem('v8.2.3-auth-token');
    this.authService.getUserByToken(token).subscribe(res => {
      if(res) {
        this.groupdId = res.group_id
      }
      this.cdr.detectChanges()
    }, error => {
      console.log(error);
    })
  }
  ngOnInit(): void {
   this.getUserByToken()
  }

}
