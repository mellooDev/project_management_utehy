import { Component, TemplateRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-lecturer-project-management',
  templateUrl: './lecturer-project-management.component.html',
  styleUrl: './lecturer-project-management.component.scss',
  providers: [MessageService],
})
export class LecturerProjectManagementComponent implements OnInit {
  isLoading: any;

  cities!: City[];

  selectedCities!: City[];

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];
  }

  onLoadFormRegister() {
    this.router.navigate(['/lecturer-project-management/create-topic']);
  }

  onLoadFormDelete(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
    });
  }

  onLoadFormUpdate(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
    });
  }
}
