import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { PagingResponse } from 'src/app/models/base';
import {
  IngestionJobListDTO,
  IngestionJobListReq,
  IngestionJobState,
  JobSrcType,
} from 'src/app/models/ingestion-job';
import { IngestionJobService } from 'src/app/services/ingestion-job.service';

@Component({
  selector: 'app-ingestion-job-list',
  templateUrl: './ingestion-job-list.component.html',
  styleUrls: ['./ingestion-job-list.component.scss'],
})
export class IngestionJobListComponent implements OnInit {
  // Danh sách jobs
  jobs: IngestionJobListDTO[] = [];
  totalRecords = 0;
  currentPage = 1;
  itemsPerPage = 10;
  isLoading = false;

  // Bộ lọc
  searchText: string;
  selectedJobSrcType: JobSrcType;
  selectedJobState: IngestionJobState;

  // Các loại dữ liệu và trạng thái
  jobSrcTypes: string[] = ['API', 'KAFKA', 'FILE']; // Loại nguồn
  jobStates: string[] = ['CREATED', 'RUNNING', 'PAUSED', 'COMPLETED', 'FAILED']; // Trạng thái job

  idToDelete: number | null;

  @ViewChild('deleteSwal') deleteSwal: SwalComponent;

  constructor(
    private router: Router,
    private ingestionJobService: IngestionJobService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadJobs(); // Tải danh sách jobs khi component khởi tạo
  }

  /**
   * Tải danh sách jobs từ API
   */
  loadJobs(): void {
    this.isLoading = true;

    const filter = {
      filter: this.searchText || null,
      jobSrcType: this.selectedJobSrcType || null,
      ingestionJobState: this.selectedJobState || null,
      currentPage: this.currentPage,
      perPage: this.itemsPerPage,
    } as IngestionJobListReq;

    this.ingestionJobService.getList(filter).subscribe({
      next: (response: PagingResponse<IngestionJobListDTO[]>) => {
        this.jobs = response.data || [];
        this.totalRecords = response.recordsTotal || 0;
      },
      error: (error: Error) => {
        this.isLoading = false;
        console.error('Có lỗi xảy ra khi load ingestion job:', error.message);
        alert(error.message);
      },
    });
  }

  /**
   * Hàm xử lý khi thay đổi nội dung ô tìm kiếm
   */
  onSearchChange(): void {
    this.currentPage = 1; // Quay về trang đầu tiên
    this.loadJobs(); // Tải lại danh sách jobs
  }

  /**
   * Hàm xử lý khi thay đổi bộ lọc
   */
  onFilterChange(): void {
    this.currentPage = 1; // Quay về trang đầu tiên
    this.loadJobs(); // Tải lại danh sách jobs
  }

  /**
   * Lấy class badge theo trạng thái của job
   */
  getBadgeClass(state: string): string {
    switch (state) {
      case 'RUNNING':
        return 'badge badge-primary';
      case 'PAUSED':
        return 'badge badge-warning';
      case 'COMPLETED':
        return 'badge badge-success';
      case 'FAILED':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  }

  /**
   * Chỉnh sửa job
   */
  onEdit(id: number): void {
    this.router.navigate(['/ingest/update', id]);
  }

  /**
   * Thay đổi trạng thái job (bắt đầu hoặc dừng)
   */
  onToggleState(job: IngestionJobListDTO): void {
    if (job.ingestionJobState == IngestionJobState.RUNNING) {
      this.ingestionJobService.stop(job.id).subscribe(
        () => {
          const snackBarRef = this.snackBar.open(
            'Tạm dừng job thành công!',
            '',
            {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'right',
              panelClass: ['success-snackbar'],
            }
          );
          snackBarRef.afterDismissed().subscribe(() => {
            this.loadJobs();
          });
        },
        (error: Error) => {
          this.isLoading = false;
          console.error('Có lỗi xảy ra khi tạm dừng job:', error.message);
          alert(error.message);
        }
      );
    } else {
      this.ingestionJobService.start(job.id).subscribe(
        () => {
          const snackBarRef = this.snackBar.open(
            'Khởi chạy job thành công!',
            '',
            {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'right',
              panelClass: ['success-snackbar'],
            }
          );
          snackBarRef.afterDismissed().subscribe(() => {
            this.loadJobs();
          });
        },
        (error: Error) => {
          this.isLoading = false;
          console.error('Có lỗi xảy ra khi khởi chạy job:', error.message);
          alert(error.message);
        }
      );
    }
  }

  /**
   * Chuyển đến trang mới
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.loadJobs(); // Tải lại danh sách jobs
    }
  }

  /**
   * Lấy danh sách số trang để hiển thị phân trang
   */
  getPaginationNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  /**
   * Tính tổng số trang
   */
  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.itemsPerPage);
  }

  confirmDelete(id: number): void {
    this.idToDelete = id;
    this.deleteSwal.fire();
  }

  triggerDelete(): void {
    if (!this.idToDelete) return;
    this.ingestionJobService.delete(this.idToDelete).subscribe(() => {
      const snackBarRef = this.snackBar.open('Xóa thành công!', '', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['success-snackbar'],
      });
      snackBarRef.afterDismissed().subscribe(() => {
        this.loadJobs();
      });
    });
  }

  onCancelDelete(): void {
    this.idToDelete = null;
  }
}
