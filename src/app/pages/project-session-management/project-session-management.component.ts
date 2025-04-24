import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import moment, { duration } from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare var $: any;
@Component({
  selector: 'app-project-session-management',
  templateUrl: './project-session-management.component.html',
  styleUrl: './project-session-management.component.scss',
  providers: [MessageService],
})
export class ProjectSessionManagementComponent {
  cities: any;
  date: Date[] | undefined;
  checked: boolean = false;

  students: any;

  settings = {
    dangKyDeTai: false,
    dangKyKhacBoMon: false,
    baoCaoKhacTuan: false,
    nhanXetKhacTuan: false,
    suaDeTaiTbm: false,
  };

  selectedAction : any = null;

  constructor(private modalService: NgbModal, private messageService: MessageService) {}

  ngOnInit() {
    this.cities = [
      { name: 'Cập nhật sinh viên', code: 'updateStudent' },
      { name: 'Cập nhật giảng viên', code: 'updateLecturer' },
      { name: 'Xem chi tiết', code: 'viewDetail' },
      { name: 'Sửa', code: 'edit' },
      { name: 'Xóa', code: 'delete' },
    ];

    this.students = [
      { maSinhVien: '11021274', ten: 'Hoàng Văn Thuận', lop: 'KTPM01' },
      { maSinhVien: '11021275', ten: 'Nguyễn Văn A', lop: 'KTPM02' },
    ];

  }


  onLoadModalCreateSession(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
      windowClass: 'formCreateOrUpdate'
    })
  }

  onLoadModalEdit(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
    })
  }

  @ViewChild('viewDetailTemplate') viewDetailTemplate!: TemplateRef<any>;
  @ViewChild('editTemplate') editTemplate!: TemplateRef<any>;
  @ViewChild('deleteTemplate') deleteTemplate!: TemplateRef<any>;
  @ViewChild('addLecturer') addLecturer!: TemplateRef<any>;

  handleActionChange(event: any): void {
    const code = event.value?.code;

    switch (code) {
      case 'LDN':
        this.modalService.open(this.viewDetailTemplate, {
          centered: true,
          windowClass: 'formCreateOrUpdate'
        });
        break;

      case 'IST':
        this.modalService.open(this.editTemplate, {
          centered: true,
          windowClass: 'formCreateOrUpdate'
        });
        break;

      case 'PRS':
        this.modalService.open(this.deleteTemplate, {
          centered: true,
          windowClass: 'formCreateOrUpdate'
        });
        break;

      case 'updateLecturer':
        this.modalService.open(this.addLecturer, {
          centered: true,
          windowClass: 'add-lecturer-modal'
        })
    }

    setTimeout(() => {
      this.selectedAction = null;
    });
  }


}
