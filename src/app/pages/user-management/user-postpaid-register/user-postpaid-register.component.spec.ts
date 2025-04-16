import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPostpaidRegisterComponent } from './user-postpaid-register.component';

describe('UserPostpaidRegisterComponent', () => {
  let component: UserPostpaidRegisterComponent;
  let fixture: ComponentFixture<UserPostpaidRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPostpaidRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserPostpaidRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
