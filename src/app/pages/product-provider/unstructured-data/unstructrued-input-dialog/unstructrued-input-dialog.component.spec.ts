import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnstructruedInputDialogComponent } from './unstructrued-input-dialog.component';

describe('UnstructruedInputDialogComponent', () => {
  let component: UnstructruedInputDialogComponent;
  let fixture: ComponentFixture<UnstructruedInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnstructruedInputDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnstructruedInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
