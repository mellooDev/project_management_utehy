import { Component, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-lecturer-approve-project',
  templateUrl: './lecturer-approve-project.component.html',
  styleUrl: './lecturer-approve-project.component.scss',
  providers: [MessageService],
})
export class LecturerApproveProjectComponent {
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
  isLoading = false;
  confirmStatus: 'accept' | 'reject' = 'accept';

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private messageService: MessageService
  ) {}

  onLoadFormDetail(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
      windowClass: 'formDetailClass',
    });
  }
  showNotification(severity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: lifetime })
  }

  onLoadFormAccept(content: TemplateRef<any>) {
    this.confirmStatus = 'accept';
    this.modalService.open(content, {
      centered: true,
    });
  }


  onLoadFormReject(content: TemplateRef<any>) {
    this.confirmStatus = 'reject';
    this.modalService.open(content, {
      centered: true,
    });
  }

  onSubmit(event: Event, myForm: NgForm) {
    event.preventDefault();
    this.isLoading = true;
    if(myForm.invalid) {
      console.log('form invalid');
      return;
    }

    if(this.confirmStatus === 'accept') {
      setTimeout(() => {
        this.isLoading = false;
        this.modalService.dismissAll();

        this.showNotification('success', 'Thông báo', 'Phê duyệt đề tài thành công. Đề tài sẽ được gửi lên bộ môn để chờ duyệt', 3000);
      }, 2000);
    }

    if(this.confirmStatus === 'reject') {
      setTimeout(() => {
        this.isLoading = false;
        this.modalService.dismissAll();

        this.showNotification('success', 'Thông báo', 'Từ chối đề tài thành công', 3000);
      }, 2000);
    }
  }
}
