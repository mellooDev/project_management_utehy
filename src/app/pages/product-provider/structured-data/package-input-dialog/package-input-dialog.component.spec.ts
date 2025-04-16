import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageInputDialogComponent } from './package-input-dialog.component';

describe('PackageInputDialogComponent', () => {
  let component: PackageInputDialogComponent;
  let fixture: ComponentFixture<PackageInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageInputDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackageInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
