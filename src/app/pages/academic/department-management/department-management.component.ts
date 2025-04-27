import { Component, TemplateRef, OnInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrl: './department-management.component.scss',
  providers: [MessageService]
})
export class DepartmentManagementComponent implements OnInit {

  isLoading: any;
  editorConfig: AngularEditorConfig = {
      sanitize: false,
      editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '10rem',
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

  constructor(
    private messageService: MessageService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {}

  onLoadCreateDepartment(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
      windowClass: 'formCreateOrUpdate',
    });
  }

  onDeleteDepartment(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
    });
  }
}
