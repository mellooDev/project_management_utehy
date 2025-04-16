import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageDeleteDialogComponent } from './package-delete-dialog.component';

describe('PackageDeleteDialogComponent', () => {
  let component: PackageDeleteDialogComponent;
  let fixture: ComponentFixture<PackageDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageDeleteDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackageDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
