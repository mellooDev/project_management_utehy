import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MajorManagementComponent } from './major-management.component';

describe('MajorManagementComponent', () => {
  let component: MajorManagementComponent;
  let fixture: ComponentFixture<MajorManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MajorManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MajorManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
