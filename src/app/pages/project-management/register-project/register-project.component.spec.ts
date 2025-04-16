import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterProjectComponent } from './register-project.component';

describe('RegisterProjectComponent', () => {
  let component: RegisterProjectComponent;
  let fixture: ComponentFixture<RegisterProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterProjectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
