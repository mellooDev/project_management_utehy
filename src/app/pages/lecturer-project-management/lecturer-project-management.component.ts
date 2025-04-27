import { Component, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-lecturer-project-management',
  templateUrl: './lecturer-project-management.component.html',
  styleUrl: './lecturer-project-management.component.scss',
  providers: [MessageService],
})
export class LecturerProjectManagementComponent {
  isLoading: any;
  constructor(private router: Router, private modalService: NgbModal, private messageService: MessageService) {}

  onLoadFormRegister() {
    this.router.navigate(['/lecturer-project-management/create-topic']);
  }

  onLoadFormDelete(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
    })
  }

  onLoadFormUpdate(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
    })
  }
}
