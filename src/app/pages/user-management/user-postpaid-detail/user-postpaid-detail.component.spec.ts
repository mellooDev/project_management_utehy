import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPostpaidDetailComponent } from './user-postpaid-detail.component';

describe('UserPostpaidDetailComponent', () => {
  let component: UserPostpaidDetailComponent;
  let fixture: ComponentFixture<UserPostpaidDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPostpaidDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserPostpaidDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
