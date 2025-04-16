import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss'
})
export class ProjectManagementComponent {
  constructor(private router: Router) {}

  onLoadFormRegister() {
    this.router.navigate(['/project-management/register-project'])
  }
}
