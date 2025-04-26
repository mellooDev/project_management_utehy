import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import Pizzip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
// import { Blob } from 'buffer';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-review-project-management',
  templateUrl: './review-project-management.component.html',
  styleUrl: './review-project-management.component.scss',
  providers: [MessageService],
})
export class ReviewProjectManagementComponent implements OnInit {
  reviewAction: any;
  selectedAction: any = null;
  safeFileUrl: SafeResourceUrl | null = null;

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

  fileUrl: string | null = null;
  blobData: Blob | null = null;

  @ViewChild('reviewModal') reviewModal: TemplateRef<any>;
  @ViewChild('printProgress') printProgress: TemplateRef<any>;
  @ViewChild('viewDetail') viewDetail: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.reviewAction = [
      { name: 'Xem chi tiết', code: 'viewDetail' },
      { name: 'Xuất quá trình thực hiện', code: 'printProgress' },
      { name: 'Đánh giá nhận xét', code: 'review' },
    ];
  }

  async generateProgressReport() {
    const response = await fetch('../../../assets/test_baocao.docx');

    const arrayBuffer = await response.arrayBuffer();

    const zip = new Pizzip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,

    });

    doc.setData({
      giaovien: 'Vũ Xuân Thắng',
      sinhvien: 'Hoàng Văn Thuận'
    })

    try {
      doc.render();
    } catch (error) {
      console.error('render.error', error);
      return;
    }

    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })

    this.blobData = blob;
    this.fileUrl = URL.createObjectURL(blob);
    this.safeFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(this.fileUrl)
    )

    console.log('url: ', this.safeFileUrl);

    this.modalService.open(this.printProgress, {
      centered: true,
      windowClass: 'formReviewModal'
    })
  }

  downloadData() {
    if(this.blobData) {
      saveAs(this.blobData, 'baocao.docx');
    }
  }

  encodeUrl(url: string): string {
    return encodeURIComponent(url);
  }

  async handleActionChange(event: any): Promise<void> {
    const code = event.value?.code;

    switch (code) {
      case 'review':
        this.modalService.open(this.reviewModal, {
          centered: true,
          windowClass: 'formReviewModal',
        });
        break;

      case 'printProgress':
        // this.modalService.open(this.printProgress, {
        //   centered: true,
        // });
        await this.generateProgressReport();
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
