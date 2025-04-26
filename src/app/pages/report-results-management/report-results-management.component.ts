import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-report-results-management',
  templateUrl: './report-results-management.component.html',
  styleUrl: './report-results-management.component.scss',
  providers: [MessageService]
})
export class ReportResultsManagementComponent implements OnInit {


  constructor() {}

  ngOnInit(): void {

  }
}
