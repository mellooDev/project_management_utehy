import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LayoutType} from '../../../core/configs/config';
import {LayoutInitService} from '../../../core/layout-init.service';
import {LayoutService} from '../../../core/layout.service';
import {AuthHTTPService} from "../../../../../modules/auth/services/auth-http";
import {KeywordService} from "../../../../../services/keyword.service";
import { SearchService } from 'src/app/services/search.service';

// import

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
})
export class HeaderMenuComponent implements OnInit {
  constructor(private router: Router,
              private layout: LayoutService,
              private layoutInit: LayoutInitService,
              private authService: AuthHTTPService,
              private cdr: ChangeDetectorRef,
              private searchService: SearchService,
              private keywordService: KeywordService) {
  }

  currentLayoutType: LayoutType | null;
  btnClass: string = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
  btnIconClass: string = 'fs-2 fs-md-1';
  isLogin: boolean;
  token: string;
  profile: any;
  filteredData: any;
  searchTerm: string = '';

  searchKeyword: string

  ngOnInit() {
    this.getUserByToken()
  }

  updateKeyword() {
    this.keywordService.changeKeyword(this.searchKeyword);
  }

  onChangeKeyword(event: any) {
    this.searchKeyword = event.target.value;
    console.log('keyword', this.searchKeyword);
  }

  getUserByToken() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    if (this.token != undefined || this.token != null) {
      this.authService.getUserByToken(this.token).subscribe(res => {
        if (res) {
          this.isLogin = true;
          this.profile = res
        } else {
          this.isLogin = false
        }
        console.log('is login', this.isLogin);
        this.cdr.detectChanges()
      })
    }
  }


  searchQuery: string = '';

  onSearch(): void {
    this.searchService.updateSearchTerm(this.searchTerm)
    // Add logic to handle search functionality here
  }

  calculateMenuItemCssClass(url: string): string {
    return checkIsActive(this.router.url, url) ? 'active' : '';
  }

  setBaseLayoutType(layoutType: LayoutType) {
    this.layoutInit.setBaseLayoutType(layoutType);
  }

  setToolbar(toolbarLayout: 'classic' | 'accounting' | 'extended' | 'reports' | 'saas') {
    const currentConfig = {...this.layout.layoutConfigSubject.value};
    if (currentConfig && currentConfig.app && currentConfig.app.toolbar) {
      currentConfig.app.toolbar.layout = toolbarLayout;
      this.layout.saveBaseConfig(currentConfig)
    }
  }

  // protected readonly is = is;

  clickLogin() {
    console.log("isLogin", this.isLogin)
    window.location.href = '/auth/login'
  }
}

const getCurrentUrl = (pathname: string): string => {
  return pathname.split(/[?#]/)[0];
};

const checkIsActive = (pathname: string, url: string) => {
  const current = getCurrentUrl(pathname);
  if (!current || !url) {
    return false;
  }

  if (current === url) {
    return true;
  }

  if (current.indexOf(url) > -1) {
    return true;
  }

  return false;

};


