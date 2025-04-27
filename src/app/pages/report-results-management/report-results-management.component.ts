import { Component, OnInit } from '@angular/core';
// import { DomSanitizer } from '@angular/platform-browser';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import Pizzip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
// import { Blob } from 'buffer';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FileUploadEvent } from 'primeng/fileupload';

@Component({
  selector: 'app-report-results-management',
  templateUrl: './report-results-management.component.html',
  styleUrl: './report-results-management.component.scss',
  providers: [MessageService],
})
export class ReportResultsManagementComponent implements OnInit {
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
  constructor(
    private modalService: NgbModal,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {}

  async generateProgressReport() {
      const response = await fetch('../../../assets/test_baocao_pdf.pdf');

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

      window.open(this.fileUrl, '_blank')
    }

    downloadData() {
      if(this.blobData) {
        saveAs(this.blobData, 'baocao.docx');
      }
    }

    onBasicUploadAuto(event: FileUploadEvent) {
          this.messageService.add({
            severity: 'info',
            summary: 'Success',
            detail: 'File Uploaded with Auto Mode',
          });
        }
}
