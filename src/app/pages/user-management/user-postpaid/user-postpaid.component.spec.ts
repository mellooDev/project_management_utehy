import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPostpaidComponent } from './user-postpaid.component';

describe('UserPostpaidComponent', () => {
  let component: UserPostpaidComponent;
  let fixture: ComponentFixture<UserPostpaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPostpaidComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserPostpaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
