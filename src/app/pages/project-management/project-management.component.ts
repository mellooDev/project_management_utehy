import { Component, OnInit,  } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss'
})
export class ProjectManagementComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    
  }

  onLoadFormRegister() {
    this.router.navigate(['/project-management/register-project'])
  }
}
