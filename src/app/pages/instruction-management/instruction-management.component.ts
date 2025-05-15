import { Component, TemplateRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { InstructionManagementService } from 'src/app/services/instruction-management.service';
import { ProjectSessionService } from 'src/app/services/project-session.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser'


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
  steps: any[] = [];
  projectSessionList: any;
  selectedSession: any;
  instructionName: any;
  instructionCode: any;
  projectStartDate: any;

  currentWeek = 1;

  // Nội dung từ editor
  taskContent = '';
  contentContent = '';
  resultContent = '';

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private messageService: MessageService,
    private projectSessionService: ProjectSessionService,
    private instructionProcessService: InstructionManagementService
  ) {}

  ngOnInit() {
    this.onLoadAllSession();
    this.cols = [
      { field: 'week', header: 'Tuần' },
      { field: 'start_date', header: 'Bắt đầu' },
      { field: 'end_date', header: 'Kết thúc' },
      { field: 'task_title', header: 'Công việc' },
      { field: 'content', header: 'Nội dung' },
      { field: 'result', header: 'Kết quả' },
    ];

    // const categories = [
    //   'Electronics',
    //   'Fashion',
    //   'Accessories',
    //   'Household',
    //   'Books',
    // ];

    // this.products = Array.from({ length: 10 }, (_, i) => ({
    //   week: `Tuần ${(i + 1).toString().padStart(1, '0')}`,
    //   task: `Product ${i + 1}`,
    //   content: categories[Math.floor(Math.random() * categories.length)],
    //   result: Math.floor(Math.random() * 100) + 1,
    // }));
  }

  onSessionChange() {
    console.log('selectedSession: ', this.selectedSession);

    if (this.selectedSession?.start_date) {
      this.projectStartDate = new Date(this.selectedSession.start_date);

      console.log(
        'projectStartDate: ',
        this.projectStartDate.toISOString().split('T')[0]
      );

      this.currentWeek = 1;
    }
  }

  addRow() {
    const weekNumber = this.currentWeek++;
    const startDate = new Date(this.projectStartDate);
    startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7); // mỗi tuần tăng 7 ngày
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // giả sử 1 tuần là 7 ngày

    this.steps.push({
      step: weekNumber,
      week: `Tuần ${weekNumber}`,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      task_title: this.taskContent,
      content: this.contentContent,
      result: this.resultContent,
    });

    // Reset nội dung sau khi thêm
    this.taskContent = '';
    this.contentContent = '';
    this.resultContent = '';
  }

  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  onLoadFormCreateOrUpdate(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
      windowClass: 'formDetailClass',
    });
  }

  onLoadAllSession() {
    this.projectSessionService
      .getSessionWithoutInstructionProcess()
      .subscribe((res) => {
        if (res) {
          this.projectSessionList = res.data;
          console.log('product: ', this.steps);
        }
      });
  }

  // onRowReorder(event: any) {
  //   console.log('Row reorder event:', event);
  //   const dragItem = event.dragIndex;
  //   const dropIndex = event.dropIndex;

  //   this.products = [...event.rows]
  // }

  onRowReorder(event: any) {
    // this.steps = [...event.value];
    const startDate = new Date(this.projectStartDate);

    // Cập nhật lại số thứ tự tuần sau khi reorder
    this.steps.forEach((item, index) => {
      item.step = index + 1; // cập nhật lại số thứ tự tuần
      item.week = `Tuần ${index + 1}`;

      const newStart = new Date(startDate);
      newStart.setDate(startDate.getDate() + index * 7);

      const newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + 6);

      item.start_date = newStart.toISOString().split('T')[0];
      item.end_date = newEnd.toISOString().split('T')[0];
    });
  }

  generateCode() {
    if (!this.instructionName) {
      this.instructionCode = '';
      return;
    }

    const normalized = this.instructionName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const words = normalized.trim().split(/\s+/);

    let code = '';

    for (const word of words) {
      if (/^[A-Za-z]+\d+$/.test(word)) {
        code += word.toUpperCase(); // giữ nguyên nếu là dạng chữ+số, như K19
      } else {
        code += word[0].toUpperCase(); // lấy chữ đầu
      }
    }

    this.instructionCode = code;
  }
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
    this.isLoading = true;
    const data = {
      process: {
        project_session_id: this.selectedSession.id,
        name: this.instructionName,
        code: this.instructionCode,
      },
      steps: this.steps.map((step) => ({
        step: step.step,
        week: step.week,
        start_date: step.start_date,
        end_date: step.end_date,
        task_title: step.task_title,
        content: step.content,
        result: step.result,
      })),
    };

    console.log('data: ', data);

    this.instructionProcessService
      .createInstructionProcess(data)
      .subscribe((res) => {
        if (res) {
          this.isLoading = false;
          this.showNotification('success', 'Thành công', res.message, 3000);
          this.modalService.dismissAll();
          this.steps = [];
        }
      });
  }
}
