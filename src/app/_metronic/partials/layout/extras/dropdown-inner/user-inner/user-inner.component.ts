import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { TranslationService } from '../../../../../../modules/i18n';
import { AuthService, UserType } from '../../../../../../modules/auth';
import { AuthHTTPService } from 'src/app/modules/auth/services/auth-http';

interface User {
  pic: string;
  firstname: string;
  lastname: string;
  email: string;
}

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  language: LanguageFlag;
  // user$: Observable<UserType>;
  langs = languages;
  private unsubscribe: Subscription[] = [];
  user$: Observable<User>;
  fullName: string;
  email: string;

  constructor(
    private auth: AuthService,
    private translationService: TranslationService,
    private authService: AuthHTTPService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.user$ = this.auth.currentUserSubject.asObservable();
    this.setLanguage(this.translationService.getSelectedLanguage());

    this.user$ = of({
      pic: './assets/media/avatars/user_avatar.jpg', // Avatar mặc định
      firstname: 'Guest',
      lastname: 'User',
      email: 'guest@example.com'
    });

    this.getUserByToken();
  }

  getUserByToken() {
    const token = <string>localStorage.getItem('v8.2.3-auth-token');
    this.authService.getUserByToken(token).subscribe(res => {
      if(res) {
        this.fullName = res.fullname;
        this.email = res.email;
        console.log('full name: ', this.fullName);
      }
      this.cdr.detectChanges()
    }, error => {
      console.log(error);
    })
  }

  logout() {
    this.auth.logout();
    document.location.reload();
  }

  selectLanguage(lang: string) {
    this.translationService.setLanguage(lang);
    this.setLanguage(lang);
    // document.location.reload();
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: './assets/media/flags/united-states.svg',
  },
  {
    lang: 'zh',
    name: 'Mandarin',
    flag: './assets/media/flags/china.svg',
  },
  {
    lang: 'es',
    name: 'Spanish',
    flag: './assets/media/flags/spain.svg',
  },
  {
    lang: 'ja',
    name: 'Japanese',
    flag: './assets/media/flags/japan.svg',
  },
  {
    lang: 'de',
    name: 'German',
    flag: './assets/media/flags/germany.svg',
  },
  {
    lang: 'fr',
    name: 'French',
    flag: './assets/media/flags/france.svg',
  },
];
