import { Component, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { FileUploadEvent } from 'primeng/fileupload';

@Component({
  selector: 'app-create-topic',
  templateUrl: './create-topic.component.html',
  styleUrl: './create-topic.component.scss',
  providers: [MessageService],
})
export class CreateTopicComponent {
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

  constructor(private messageService: MessageService, private router: Router, private modalService: NgbModal) {}

  ngOnInit() {}

  showNotification(
    severity: string,
    summary: string,
    detail: string,
    lifetime: number
  ) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      life: lifetime,
    });
  }

  onSubmit() {
    this.showNotification('success', 'abc', 'def', 300000);
  }

  onBasicUploadAuto(event: FileUploadEvent) {
      this.messageService.add({
        severity: 'info',
        summary: 'Success',
        detail: 'File Uploaded with Auto Mode',
      });
    }

    onLoadFormConfirm(content: TemplateRef<any>) {
      this.modalService.open(content, {
        centered: true,
      })
    }
}
