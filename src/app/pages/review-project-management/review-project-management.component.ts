import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
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
  selectedAction: any = null;

  editorConfig: AngularEditorConfig = {
    sanitize: false,
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '14rem',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'no',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };

  @ViewChild('reviewModal') reviewModal: TemplateRef<any>;
  @ViewChild('printProgress') printProgress: TemplateRef<any>;
  @ViewChild('viewDetail') viewDetail: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.reviewAction = [
      { name: 'Xem chi tiết', code: 'viewDetail' },
      { name: 'Xuất quá trình thực hiện', code: 'printProgress' },
      { name: 'Đánh giá nhận xét', code: 'review' },
    ];
  }

  handleActionChange(event: any): void {
    const code = event.value?.code;

    switch (code) {
      case 'review':
        this.modalService.open(this.reviewModal, {
          centered: true,
          windowClass: 'formReviewModal',
        });
        break;

      case 'printProgress':
        this.modalService.open(this.printProgress, {
          centered: true,
        });
        break;

      case 'viewDetail':
        this.modalService.open(this.viewDetail, {
          centered: true,
          windowClass: 'formReviewModal',
        });
        break;

      default:
        break;
    }

    setTimeout(() => {
      this.selectedAction = null;
    });
  }
}
