import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss',
  providers: [MessageService]
})
export class ProjectManagementComponent implements OnInit {
  actions: any[] = [];
  selectedAction: any;

  constructor(private router: Router, private modalService: NgbModal, private messageService: MessageService) {}

  ngOnInit(): void {
    this.actions = [
      { name: 'Xem chi tiết', code: 'viewDetail' },
      { name: 'Đăng ký đề tài', code: 'registerProject' },
    ];
  }

  onLoadFormRegister() {
    this.router.navigate(['/project-management/register-project']);
  }

  @ViewChild('viewDetailTemplate') viewDetailTemplate!: TemplateRef<any>;
  @ViewChild('registerProjectTemplate') registerProjectTemplate!: TemplateRef<any>;

  handleActionChange(event: any): void {
    const code = event.value?.code;

    switch (code) {
      case 'viewDetail':
        this.modalService.open(this.viewDetailTemplate, {
          centered: true,
          windowClass: 'formCreateOrUpdate',
        });
        break;

      case 'registerProject':
        this.modalService.open(this.registerProjectTemplate, {
          centered: true,
        });
        break;
    }

    setTimeout(() => {
      this.selectedAction = null;
    });
  }
}
