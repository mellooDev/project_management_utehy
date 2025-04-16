import { TreeModule, TreeNode } from '@ali-hm/angular-tree-component';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../_metronic/shared/shared.module';
import { DataManagementService } from '../../services/data-management.service';

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [TreeModule, SharedModule, FormsModule, CommonModule],
  templateUrl: './data-management.component.html',
  styleUrl: './data-management.component.scss',
})
export class DataManagementComponent implements OnInit {
  constructor(
    private dataManagementService: DataManagementService,
    private cdr: ChangeDetectorRef
  ) {}

  token: string;
  listDatabases: any[] = [];
  listTable: any[] = [];
  tree: any;
  querySql: string;
  databaseSelected: number;
  targetDbId: number;
  targetTableName: string;
  enableDownload: boolean = false;
  enableShare: boolean = false;

  onNodeSelect(event: { node: TreeNode }) {
    if (event.node.data.database) {
      this.databaseSelected = event.node.data.id;
    }
    if (event.node.data.table || event.node.data.column) {
      this.databaseSelected = event.node.data.db;
    }
    if (event.node.hasChildren) {
      event.node.toggleExpanded();
    }
  }

  getListDatabases() {
    this.dataManagementService
      .getListDatabases(this.token)
      .subscribe((data) => {
        this.listDatabases = data.owned?.concat(data.shared);
        let childrens: any = {};

        this.listDatabases.forEach((item) => {
          this.dataManagementService
            .getDatabaseTable(item.id, this.token)
            .subscribe((data) => {
              childrens[item.id] = data.map((table: any) => ({
                id: table.id,
                name: table.tableName,
                table: true,
                db: item.id,
                children: JSON.parse(table.schemaDefinition)?.fields?.map(
                  (col: any) => ({
                    id: col.name,
                    name: col.name,
                    column: true,
                    db: item.id,
                  })
                ),
              }));

              this.tree = this.listDatabases.map((item) => ({
                id: item.id,
                name: item.databaseName,
                databaseName: item.databaseName,
                database: true,
                children: childrens[item.id],
              }));
            });
        });
      });
  }

  getIcon(is_table: boolean) {
    if (is_table === true) {
      return '<app-keenicon name="switch" class="fs-2"></app-keenicon>';
    } else {
      return '<app-keenicon name="category" class="fs-2"></app-keenicon>';
    }
  }

  onChangeQuery(event: any) {
    this.tableText = '';
  }

  runSql() {
    if (!this.databaseSelected) {
      this.tableText =
        '<label class="alert alert-danger">Vui lòng chọn schema/database để thực hiện truy vấn</label>';
      return;
    }
    this.dataManagementService
      .executeQuery(this.databaseSelected, this.token, this.querySql)
      .subscribe((data) => {
        if (!data || !data?.columns) {
          this.tableText =
            '<label class="alert alert-danger">Câu lệnh truy vấn không đúng cú pháp hoặc dữ liệu không tồn tại.</label>';
          return;
        }

        if (data?.columns) {
          this.tableText = '';
          this.enableDownload = true;
          this.createTableText(data);
          this.cdr.detectChanges();
        }
      });
  }

  getTablesByDatabase(databaseId: number) {}

  tableText: any;
  createTableText(data: any): void {
    let tableContent = `<table class="table table-bordered table-sm" style="text-align: left; width: 100%;">`;

    // Tạo phần tiêu đề của bảng
    tableContent += '<thead><tr>';
    data.columns.forEach((col: any) => {
      tableContent += `<th>${col.name
        .split('.')[1]
        .toLocaleUpperCase()
        .replace(')', '')}</th>`;
    });
    tableContent += '</tr></thead>';

    // Tạo phần thân bảng
    tableContent += '<tbody>';
    data?.rows?.forEach((row: any) => {
      tableContent += '<tr>';
      row.values.forEach((value: any) => {
        if (value.n !== undefined) {
          tableContent += `<td>${value.n}</td>`;
        } else if (value.s !== undefined) {
          tableContent += `<td>${value.s}</td>`;
        } else if (value.b !== undefined) {
          tableContent += `<td>${value.b ? 'True' : 'False'}</td>`;
        } else if (value.ts !== undefined) {
          tableContent += `<td>${
            value.ts ? new Date(Number.parseInt(value.ts)) : '-'
          }</td>`;
        } else if (value.f !== undefined) {
          tableContent += `<td>${value.f}</td>`;
        } else {
          tableContent += `<td></td>`;
        }
      });
      tableContent += '</tr>';
    });
    tableContent += '</tbody></table>';

    this.tableText = tableContent;
  }

  ngOnInit() {
    this.token = <string>localStorage.getItem('v8.2.3-auth-token');
    this.getListDatabases();
  }

  exportToExcel() {
    this.dataManagementService
      .exportToExcel(this.databaseSelected, this.token, this.querySql)
      .subscribe(
        (response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);

          // Tạo link tải file
          const a = document.createElement('a');
          a.href = url;
          a.download = `query_result_${Date.now()}.xlsx`;
          a.click();

          window.URL.revokeObjectURL(url); // Hủy link sau khi tải
        },
        (error) => {
          console.error('Error exporting Excel:', error);
        }
      );
  }

  insertDataToTable() {
    this.dataManagementService
      .insertQueryResultToTable(
        this.targetDbId,
        this.token,
        this.targetTableName,
        this.querySql
      )
      .subscribe({
        next: (response: any) => {},
        error: (error: any) => {
          console.error(error);
        },
      });
  }
}
