import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lecturer-project-management',
  templateUrl: './lecturer-project-management.component.html',
  styleUrl: './lecturer-project-management.component.scss',
})
export class LecturerProjectManagementComponent {
  constructor(private router: Router) {}

  onLoadFormRegister() {
    this.router.navigate(['/lecturer-project-management/create-topic']);
  }
}
