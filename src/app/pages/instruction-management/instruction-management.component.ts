import { Component, TemplateRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-instruction-management',
  templateUrl: './instruction-management.component.html',
  styleUrl: './instruction-management.component.scss',
  providers: [MessageService],
})
export class InstructionManagementComponent {
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
  isLoading = false;
  cols: Column[];
  products: any[] = [];

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cols = [
      { field: 'week', header: 'Tuần' },
      { field: 'task', header: 'Công việc' },
      { field: 'content', header: 'Nội dung' },
      { field: 'result', header: 'Kết quả' },
    ];

    const categories = [
      'Electronics',
      'Fashion',
      'Accessories',
      'Household',
      'Books',
    ];

    this.products = Array.from({ length: 10 }, (_, i) => ({
      week: `Tuần ${(i + 1).toString().padStart(1, '0')}`,
      task: `Product ${i + 1}`,
      content: categories[Math.floor(Math.random() * categories.length)],
      result: Math.floor(Math.random() * 100) + 1,
    }));
  }

  onLoadFormCreateOrUpdate(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
      windowClass: 'formDetailClass',
    });
  }

  // onRowReorder(event: any) {
  //   console.log('Row reorder event:', event);
  //   const dragItem = event.dragIndex;
  //   const dropIndex = event.dropIndex;

  //   this.products = [...event.rows]
  // }

  onRowReorder(event: any) {
    this.products = [...event.rows];

    console.log('product new: ', this.products);

  }

}
