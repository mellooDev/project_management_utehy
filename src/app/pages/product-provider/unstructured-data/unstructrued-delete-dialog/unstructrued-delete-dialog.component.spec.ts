import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnstructruedDeleteDialogComponent } from './unstructrued-delete-dialog.component';

describe('UnstructruedDeleteDialogComponent', () => {
  let component: UnstructruedDeleteDialogComponent;
  let fixture: ComponentFixture<UnstructruedDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnstructruedDeleteDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnstructruedDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
