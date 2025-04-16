import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  BaseResponse,
  PagingRequest,
  PagingResponse,
} from 'src/app/models/base';
import {
  IngestionJobDTO,
  IngestionJobHistoryDTO,
} from 'src/app/models/ingestion-job';
import { IngestionJobService } from 'src/app/services/ingestion-job.service';

@Component({
  selector: 'app-ingestion-job-detail',
  templateUrl: './ingestion-job-detail.component.html',
  styleUrls: ['./ingestion-job-detail.component.scss'],
  providers: [DatePipe],
})
export class IngestionJobDetailComponent implements OnInit {
  jobDetail: IngestionJobDTO | null = null;
  jobHistory: IngestionJobHistoryDTO[] = [];
  fieldMappings: any[] = [];
  displayedColumns = ['fieldName', 'fieldType', 'description'];
  historyColumns = ['startTime', 'endTime', 'state', 'errorMessage'];
  vietnamDateTimeFormat = 'dd/MM/yyyy HH:mm:ss';

  constructor(
    private route: ActivatedRoute,
    private ingestionJobService: IngestionJobService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('id'));
    this.fetchJobDetail(jobId);
  }

  fetchJobDetail(jobId: number): void {
    this.ingestionJobService.getById(jobId).subscribe(
      (response: BaseResponse<IngestionJobDTO>) => {
        if (response.data) {
          this.jobDetail = response.data;
          this.parseAvroSchema();
        }
      },
      (error) => {
        this.snackBar.open('Không thể tải chi tiết job', 'Đóng', {
          duration: 3000,
        });
        console.error('Error fetching job detail:', error);
      }
    );
  }

  fetchJobHistory(jobId: number): void {
    const request = { currentPage: 0, perPage: 10 } as PagingRequest;
    this.ingestionJobService.getJobHistory(jobId, request).subscribe(
      (response: PagingResponse<IngestionJobHistoryDTO[]>) => {
        this.jobHistory = response.data || [];
      },
      (error) => {
        this.snackBar.open('Không thể tải lịch sử job', 'Đóng', {
          duration: 3000,
        });
        console.error('Error fetching job history:', error);
      }
    );
  }

  parseAvroSchema(): void {
    if (this.jobDetail?.avroSchemaJson) {
      try {
        const schema = JSON.parse(this.jobDetail.avroSchemaJson);
        this.fieldMappings = schema.fields.map((field: any) => ({
          fieldName: field.name,
          fieldType: field.type,
          description: field.doc?.description || 'Không có mô tả',
        }));
      } catch (error) {
        console.error('Error parsing AVRO schema:', error);
      }
    }
  }

  downloadAvroSchema(): void {
    if (this.jobDetail?.avroSchemaJson) {
      const blob = new Blob([this.jobDetail.avroSchemaJson], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.jobDetail.jobName || 'schema'}.avsc`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  onHistoryTabClick(): void {
    if (this.jobDetail?.id) {
      this.fetchJobHistory(this.jobDetail.id);
    }
  }

  formatDateTime(date: Date | undefined): string {
    if (!date) {
      return 'N/A'; // Giá trị mặc định khi date là undefined hoặc null
    }
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss') || 'N/A';
  }
}
