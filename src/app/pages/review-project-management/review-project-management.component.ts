import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-review-project-management',
  templateUrl: './review-project-management.component.html',
  styleUrl: './review-project-management.component.scss',
  providers: [MessageService],
})
export class ReviewProjectManagementComponent implements OnInit {
  reviewAction: any;

  constructor(
    private modalService: NgbModal,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.reviewAction = [
      { name: 'Xem chi tiết', code: 'viewDetail' },
      { name: 'Xuất quá trình thực hiện', code: 'printProgress' },
      { name: 'Đánh giá nhận xét', code: 'review' },
    ]
  }
}
