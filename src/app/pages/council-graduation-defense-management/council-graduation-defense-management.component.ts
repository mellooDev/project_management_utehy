import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-council-graduation-defense-management',
  templateUrl: './council-graduation-defense-management.component.html',
  styleUrl: './council-graduation-defense-management.component.scss',
  providers: [MessageService],
})
export class CouncilGradutationDefenseManagementComponent implements OnInit {
  actions: any[] = [];
  defenseApproveSelect: any;
  selectedAction: any;
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

  constructor(private modalService: NgbModal, messageService: MessageService) {}

  ngOnInit(): void {
    this.actions = [
      { name: 'Xem chi tiết đề tài', code: 'viewDetailProject' },
      { name: 'In quá trình báo cáo', code: 'printProgressReport' },
      { name: 'Phản biện sinh viên', code: 'counterArgumentStudent' },
      { name: 'Xem chi tiết báo cáo', code: 'viewDetailProgress' },
    ];
  }

  @ViewChild('viewDetailProject') viewDetailProject!: TemplateRef<any>;
  @ViewChild('printProgressReport') printProgressReport!: TemplateRef<any>;
  @ViewChild('counterArgumentStudent')
  counterArgumentStudent!: TemplateRef<any>;
  @ViewChild('viewDetailProgress') viewDetailProgress!: TemplateRef<any>;

  handleActionChange(event: any): void {
    const code = event.value?.code;

    switch (code) {
      case 'viewDetailProject':
        this.modalService.open(this.viewDetailProject, {
          centered: true,
        });
        break;

      case 'printProgressReport':
        this.modalService.open(this.printProgressReport, {
          centered: true,
        });
        break;

      case 'counterArgumentStudent':
        this.modalService.open(this.counterArgumentStudent, {
          centered: true,
          windowClass: 'counterArgumentStudent'
        });
        break;

      case 'viewDetailProgress':
        this.modalService.open(this.viewDetailProgress, {
          centered: true,
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
