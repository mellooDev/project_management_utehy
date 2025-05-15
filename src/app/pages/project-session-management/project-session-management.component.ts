import { filter } from 'rxjs';
import {
  Component,
  OnInit,
  AfterViewInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import moment, { duration } from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AcademicYearService } from 'src/app/services/academic-year.service';
import { ProjectSessionService } from 'src/app/services/project-session.service';

declare var $: any;
@Component({
  selector: 'app-project-session-management',
  templateUrl: './project-session-management.component.html',
  styleUrl: './project-session-management.component.scss',
  providers: [MessageService],
})
export class ProjectSessionManagementComponent implements OnInit {
  ingredient!: string;
  cities: any;
  date: Date[] | undefined;
  checked: boolean = false;
  isLoading: boolean = false;

  students: any;
  lecturers: any;

  page: number = 1;
  pageSize: number = 10;
  recordsTotal = 0;
  studentName: string = '';
  studentCode: string = '';
  classCode: string = '';
  status: string = '';

  projectSessionList: any;
  startDate: Date | null = null;

  sessionName: string;
  sessionCode: string = '';

  settings = {
    dangKyDeTai: false,
    dangKyKhacBoMon: false,
    baoCaoKhacTuan: false,
    nhanXetKhacTuan: false,
    suaDeTaiTbm: false,
  };

  selectedAction: any = null;
  selectedStudentIds = new Set<string>();
  selectedLecturerIds = new Set<string>();

  selectedStudents: any[] = [];
  selectedLecturers: any[] = [];

    selectedYear: string = '';

  academicYear: any;

  constructor(
    private modalService: NgbModal,
    private messageService: MessageService,
    private academicYearService: AcademicYearService,
    private projectSessionService: ProjectSessionService,
  ) {}

  ngOnInit() {
    this.onLoadYear();
    this.onLoadSession();
    this.cities = [
      { name: 'Cập nhật sinh viên', code: 'updateStudent' },
      { name: 'Cập nhật giảng viên', code: 'updateLecturer' },
      { name: 'Xem chi tiết', code: 'viewDetail' },
      { name: 'Sửa', code: 'edit' },
      { name: 'Xóa', code: 'delete' },
    ];

    this.lecturers = [
      { maGiangVien: '11021274', ten: 'Hoàng Văn Thuận', soLuongHD: 10 },
      { maGiangVien: '11021275', ten: 'Nguyễn Văn A', soLuongHD: 11 },
    ];

    this.students = [
      { maSinhVien: '11021274', ten: 'Hoàng Văn Thuận', lop: 'KTPM01' },
      { maSinhVien: '11021275', ten: 'Nguyễn Văn A', lop: 'KTPM02' },
    ];
  }

  onLoadModalCreateSession(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
      windowClass: 'formCreateOrUpdate',
    });
  }

  onLoadModalEdit(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
    });
  }

  generateCode() {
    if (!this.sessionName) {
      this.sessionCode = '';
      return;
    }

    const normalized = this.sessionName
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

    this.sessionCode = code;
  }

  onLoadYear() {
    this.academicYearService.getYear().subscribe({
      next: (res) => {
        this.academicYear = res.data;
      },
      error: (err) => {
        console.log('error: ', err.message);
      },
    });
  }

  onLoadSession() {
    this.projectSessionService
      .searchProjectSession('', '', '2024-2025', this.page, this.pageSize)
      .subscribe((res) => {
        this.projectSessionList = res.data;

        this.recordsTotal = res.recordsTotal
      });
  }
  formatDate(date: Date | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // yyyy-mm-dd
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

  onSubmitSession() {
    const payload = {
      session: {
        project_session_name: this.sessionName,
        project_session_code: this.sessionCode,
        start_date: this.formatDate(this.startDate),
        type: this.ingredient,
        major_id: null, // hoặc truyền nếu không phải graduation
        academic_year_id: this.selectedYear,
        description: this.sessionName,
        status: 'open',
      },
      rounds: [
        {
          round_number: 1,
          start_date: this.formatDate(this.startDate),
          description: 'Lần 1',
        },
      ],
      settings: [
        {
          allow_topic_registration: this.settings.dangKyDeTai ? 1 : 0,
          allow_cross_department_registration: this.settings.dangKyKhacBoMon
            ? 1
            : 0,
          allow_report_out_of_week: this.settings.baoCaoKhacTuan ? 1 : 0,
          allow_evaluator_out_of_week: this.settings.nhanXetKhacTuan ? 1 : 0,
          allow_topic_modification: this.settings.suaDeTaiTbm ? 1 : 0,
        },
      ],
    };

    console.log('data:', payload);

    this.isLoading = true;
    this.projectSessionService.createProjectSession(payload).subscribe({
      next: (res) => {
        console.log('Tạo thành công:', res);
        this.isLoading = false;
        this.modalService.dismissAll();
        this.showNotification('success', 'Thành công', res.message, 3000);
        this.onLoadSession();
      },
      error: (err) => {
        console.error('Lỗi khi tạo:', err);
      },
    });
  }

  @ViewChild('viewDetailTemplate') viewDetailTemplate!: TemplateRef<any>;
  @ViewChild('editTemplate') editTemplate!: TemplateRef<any>;
  @ViewChild('deleteTemplate') deleteTemplate!: TemplateRef<any>;
  @ViewChild('addStudent') addStudent!: TemplateRef<any>;
  @ViewChild('addLecturer') addLecturer!: TemplateRef<any>;

  handleActionChange(event: any): void {
    const code = event.value?.code;

    switch (code) {
      case 'LDN':
        this.modalService.open(this.viewDetailTemplate, {
          centered: true,
          windowClass: 'formCreateOrUpdate',
        });
        break;

      case 'IST':
        this.modalService.open(this.editTemplate, {
          centered: true,
          windowClass: 'formCreateOrUpdate',
        });
        break;

      case 'PRS':
        this.modalService.open(this.deleteTemplate, {
          centered: true,
          windowClass: 'formCreateOrUpdate',
        });
        break;

      case 'updateStudent':
        this.modalService.open(this.addStudent, {
          centered: true,
          windowClass: 'add-student-modal',
        });
        break;

      case 'updateLecturer':
        this.modalService.open(this.addLecturer, {
          centered: true,
          windowClass: 'add-student-modal',
        });
        break;
    }

    setTimeout(() => {
      this.selectedAction = null;
    });
  }

  onCheckboxChange(checked: boolean, maSinhVien: string) {
    if (checked) {
      this.selectedStudentIds.add(maSinhVien);
    } else {
      this.selectedStudentIds.delete(maSinhVien);
    }
  }

  moveToSelected() {
    const toMove = this.students.filter((sv: any) =>
      this.selectedStudentIds.has(sv.maSinhVien)
    );
    this.selectedStudents.push(...toMove);
    this.students = this.students.filter(
      (sv: any) => !this.selectedStudentIds.has(sv.maSinhVien)
    );
    this.selectedStudentIds.clear();
  }

  moveToAvailable() {
    const toMove = this.selectedStudents.filter((sv: any) =>
      this.selectedStudentIds.has(sv.maSinhVien)
    );
    this.students.push(...toMove);
    this.selectedStudents = this.selectedStudents.filter(
      (sv: any) => !this.selectedStudentIds.has(sv.maSinhVien)
    );
    this.selectedStudentIds.clear();
  }
}
