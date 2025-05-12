import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthHTTPService } from 'src/app/modules/auth/services/auth-http';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];
  avatarUrl: string = './assets/media/avatars/300-1.jpg';
  info: any;
  fullName: any;
  class: any;
  email: any;
  phoneNumber: any;

  constructor(private cdr: ChangeDetectorRef, private authService: AuthHTTPService) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    this.getUserByToken();
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        this.avatarUrl = reader.result as string;
        console.log('avatarUrl: ', this.avatarUrl);

      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  saveSettings() {
    this.isLoading$.next(true);
    setTimeout(() => {
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    }, 1500);
  }

  getUserByToken() {
    const token = <string>localStorage.getItem('v8.2.3-auth-token');
    this.authService.getUserByToken(token).subscribe(res => {
      if(res) {
        this.info = res;
        console.log('info: ', this.info);
      }
      this.cdr.detectChanges()
    }, error => {
      console.log(error);
    })
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
