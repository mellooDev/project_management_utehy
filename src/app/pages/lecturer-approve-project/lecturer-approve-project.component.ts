import { Component, TemplateRef } from '@angular/core';
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
}
