import { ChangeDetectorRef, Component, inject, OnInit, TemplateRef } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileManagementService } from 'src/app/services/file-management.service';

@Component({
  selector: 'app-file-management',
  templateUrl: './file-management.component.html',
  styleUrl: './file-management.component.scss',
})
export class FileManagementComponent implements OnInit {
  fileData: any;
  fileImagePreview: any;
  filteredData: any[] = [];
  pagedData: any[] = [];
  filePath: any;
  linkDownload: any;
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 8;
  totalRecords: number = 0;
  loading: boolean = false;
  filePathObj: any;

  currentImage: string | null = null;

  constructor(
    private fileManagementService: FileManagementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.onLoadFileData();
  }

  isOwned: boolean;
  isShared: boolean;

  onLoadFileData() {
    this.loading = true;
    this.fileManagementService
      .getAllFile(this.searchTerm, this.currentPage - 1, this.pageSize)
      .subscribe((res) => {
        const shareFiles = res.shared.map((item: any) => ({
          ...item,
          isShared: true,
        }));

        const ownedFiles = res.owned.map((item: any) => ({
          ...item,
          isOwned: true,
        }));
        this.fileData = [...shareFiles, ...ownedFiles];
        this.applySearchFilter();

        this.totalRecords = this.filteredData.length;

        this.updatePagedData();
        this.loading = false;

        this.filePath = this.fileData.map((item: any) => item.filePath);
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applySearchFilter();
    this.updatePagedData();
  }

  clearSearch() {
    this.searchTerm = '';
  }

  onSearchTermChange() {
  }

  applySearchFilter(): void {
    // Lọc dữ liệu khi tìm kiếm
    if (this.searchTerm) {
      this.filteredData = this.fileData.filter((item: any) =>
        item.fileName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredData = [...this.fileData];
    }
  }

  private modalService = inject(NgbModal);
  closeResult = '';
  selectedFilePath: string = '';

  open(content: TemplateRef<any>, fileId: number) {
    const file = this.fileData.find((f: any) => f.id === fileId);

    if (file && this.isImageFile(file.fileName)) {
      this.fileManagementService.getDownloadFile(fileId).subscribe(
        (res) => {
          this.selectedFilePath = res.download_link;
          this.modalService
            .open(content, {
              ariaLabelledBy: 'modal-basic-title',
              windowClass: 'customModal',
              size: 'lg',
            })
            .result.then(
              (result) => {
                this.closeResult = `Close with: ${result}`;
              },
              (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              }
            );
        },
        (error) => {
          console.error('Lỗi lấy link ', error);
          alert('Không tải được ảnh');
        }
      );
    } else {
      alert('Không thể preview');
    }
  }

  openDeleteDialog(content: TemplateRef<any>) {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Close with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.totalRecords / this.pageSize)) {
      this.currentPage = page;
      this.updatePagedData();
    }
  }

  updatePagedData(): void {
    if (!this.filteredData || this.filteredData.length === 0) {
      console.log('Không có dữ liệu để phân trang');
      this.pagedData = [];
      return;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.filteredData.length
    );

    this.pagedData = this.filteredData.slice(startIndex, endIndex);

    this.cdr.detectChanges();
  }

  getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  isImageFile(fileName: string) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'];
    const fileExtensions = fileName.split('.').pop()?.toLowerCase();
    return fileExtensions ? imageExtensions.includes(fileExtensions) : false;
  }
  onDownloadFile(id: number) {
    this.fileManagementService.getDownloadFile(id).subscribe((res) => {
      const downloadLink = res.download_link;
      const fileName = res.name;

      const anchor = document.createElement('a');
      anchor.href = downloadLink;
      anchor.download = fileName;
      anchor.click();
    });
  }

  onPreviewFile(id: number) {
    this.fileManagementService.getDownloadFile(id).subscribe((res) => {
      const downloadLink = res.download_link;
      this.fileImagePreview = res.download_link;
      const fileName = res.name;
    });
  }
}
