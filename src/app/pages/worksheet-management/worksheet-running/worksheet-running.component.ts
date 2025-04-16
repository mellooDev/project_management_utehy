import {TreeNode} from '@ali-hm/angular-tree-component';
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataManagementService} from "../../../services/data-management.service";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";
import {FlatTreeControl} from "@angular/cdk/tree";
import {
  FolderDTO,
  GetListRequest, UpdateFolderRequest,
  UpdateWorksheetRequest,
  WorksheetManagementService
} from "../../../services/worksheet-management.service";
import {node} from "webpack";
import {ActivatedRoute} from "@angular/router";
import {CreateWorksheetDialogComponent} from "../create-worksheet-dialog/create-worksheet-dialog.component";
import {MessageService} from "primeng/api";
import {MatDialog} from "@angular/material/dialog";
import {RenameDialogComponent} from "../rename-dialog/rename-dialog.component";
import {error} from "@angular/compiler-cli/src/transformers/util";
import Swal from "sweetalert2";


interface FoodNode {
  name: string ;
  id?: number
  type: string
  children?: FoodNode[];
  content?: string;
  dbId?: number;
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  type: string;
  level: number;
  id?: number;
  content?: string;
  dbId?: number;
}

@Component({
  selector: 'app-worksheet-running',
  templateUrl: './worksheet-running.component.html',
  styleUrl: './worksheet-running.component.scss',
})
export class WorksheetRunningComponent implements OnInit {
  constructor(
    private dataManagementService: DataManagementService,
    private worksheetManagementService : WorksheetManagementService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {
  }

  // Hàm để toggle node khi click
  toggleNode(node: any): void {
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
      if(node.type === 'ws'){
        console.log('open WS: ', node)
        this.querySql = node.content;
        this.worksheetSelected = node.id;
        this.databaseSelected = node.dbId !== null ? node.dbId : '';
      }
    } else {
      this.treeControl.expand(node);
      if(node.type === 'ws'){
        console.log('open WS: ', node)
        this.querySql = node.content;
        this.worksheetSelected = node.id;
        this.databaseSelected = node.dbId !== null ? node.dbId : '';
      }
    }
  }





  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  searchKey: string= '';
  token: string;
  listDatabases: any[] = [];
  listAllFolders: any[] = [];
  listTable: any[] = [];
  tree: any;
  treeWorksheet  : FoodNode[] = [];
  querySql: string;
  worksheetSelected: number;
  databaseSelected: any = '';
  targetDbId: number;
  targetTableName: string;
  enableDownload: boolean = false;
  enableShare: boolean = true;
  requestGetList : GetListRequest = {
    currentPage: 1,
    perPage: 1000,
    filter: ''
  }

  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      type: node.type,
      name: node.name,
      level: level,
      id: node.id,
      content: node.content,
      dbId: node.dbId
    };
  }

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
      node => node.expandable
    );

  treeFlattener =  new MatTreeFlattener<FoodNode, ExampleFlatNode>(
    this._transformer,
      node => node.level,
      node => node.expandable,
      node => node.children);

  dataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener
  );

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

  selectedTab = 1;

  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
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


  getListWorksheet(){
    this.dataSource.data = [];
    this.requestGetList.filter = this.searchKey;
    if(this.searchKey===''){
      this.worksheetManagementService.getFolders(this.requestGetList).subscribe(
        (data) => {
          if (data.code == 200) {
            this.listAllFolders = data.data;
            const folders = data.data.map((item : any) => ({
              id : item.id,
              type: 'fd',
              name: (item.name!==null && item.name!==undefined)?item.name:'',
              children: []
            }));

            // Gọi API để lấy danh sách worksheet
            this.worksheetManagementService.getWorksheets(this.requestGetList).subscribe((worksheetsResponse) => {
              if (worksheetsResponse.code == 200) {
                const worksheets = worksheetsResponse.data;

                worksheets.forEach((item:any) => {
                  if(item.id === this.worksheetSelected){
                    this.querySql = item.content;
                  }
                })

                folders.forEach((folder: any) => {
                  folder.children = worksheets
                    .filter((worksheet: any) => worksheet.folderId === folder.id)
                    .map((worksheet: any) => ({
                      id: worksheet.id,
                      type: 'ws',
                      name: worksheet.name || '',
                      children: [],
                      content: worksheet.content || '',
                      dbId:worksheet.dbId,
                    }));
                });


                worksheets
                  .filter((worksheet: any) => worksheet.folderId === null)
                  .map((worksheet: any) => ({
                    id: worksheet.id,
                    type: 'ws',
                    name: worksheet.name || '',
                    children: [],
                    content: worksheet.content || '',
                    dbId:worksheet.dbId,
                  }))
                  .forEach((item: any) => {
                    folders.push(item);
                  });
                this.dataSource.data = folders;
                console.log(folders)
              }
            });

          }
        }
      );
    }else{
      this.requestGetList.filter =this.searchKey;
      // Gọi API để lấy danh sách worksheet
      this.worksheetManagementService.getWorksheets(this.requestGetList).subscribe((worksheetsResponse) => {
        if (worksheetsResponse.code == 200) {
          const worksheets = worksheetsResponse.data;

          const folders = worksheetsResponse.data.map((item : any) => ({
            id : item.id,
            type: 'ws',
            name: (item.name!==null && item.name!==undefined)?item.name:'',
            children: [],
            content: item.content || '',
            dbId:item.dbId,
          }));

          folders.forEach((item:any) => {
            if(item.id === this.worksheetSelected){
              this.querySql = item.content;
            }
          })

          this.dataSource.data = folders;
          console.log(folders)
        }
      });
    }


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
  onSave(){

    const updateRequest: UpdateWorksheetRequest ={
      content: this.querySql,
      dbId: this.databaseSelected
    }
    this.worksheetManagementService.updateWorksheet(updateRequest, this.worksheetSelected).subscribe(
      (data:any) => {
        if(data.code == '200'){
          console.log(data)
          this.showNotification('success', 'Thông báo', 'Lưu Worksheet thành công ', 3000);
          this.getListWorksheet();
        }
      },error => {
        console.log(error);
        this.showNotification('error', 'Thông báo', 'Lưu Worksheet không thành công ', 3000);
      }
    )
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
    this.worksheetSelected = +this.route.snapshot.paramMap.get('id')!;
    this.getListDatabases();
    this.getListWorksheet();

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

  onSearch(){
    console.log('Search :', this.searchKey);
    this.getListWorksheet();
  }

  onRename(node: any) {
    console.log('Rename node:', node);
    const dialogRef = this.dialog.open(RenameDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New name:', result);


        if(node.type == 'ws'){
          const updateRequest: UpdateWorksheetRequest ={
            name: result
          }
          this.worksheetManagementService.updateWorksheet(updateRequest, node.id).subscribe(
            (data:any) => {
              if(data.code == '200'){
                console.log(data)
                this.showNotification('success', 'Thông báo', 'Lưu thay đổi thành công ', 3000);
                this.getListWorksheet();
              }
            },error => {
              console.log(error);
              this.showNotification('error', 'Thông báo', 'Lưu thay đổi không thành công: ' + error.error.desc, 3000);
            }
          )
        }else{
          const updateRequest: UpdateFolderRequest ={
            name: result
          }
          this.worksheetManagementService.updateFolder( node.id, updateRequest).subscribe(
            (data:any) => {
              if(data.code == '200'){
                console.log(data)
                this.showNotification('success', 'Thông báo', 'Lưu thay đổi thành công ', 3000);
                this.getListWorksheet();
              }
            },error => {
              console.log(error);
              this.showNotification('error', 'Thông báo', 'Lưu thay đổi không thành công ', 3000);
            }
          )
        }


      }
    });

  }

  onDelete(node: any) {
    console.log('Delete node:', node);

    Swal.fire({
      title: 'Xóa worksheet',
      text: 'Bạn có chắc chắn muốn xóa file worksheet này không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy bỏ',
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-primary'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("Worksheet deleted!");
        if(node.type === 'ws'){
          this.worksheetManagementService.deleteWorksheet(node.id).subscribe(
            (data:any) => {
              if(data.code == '200'){
                console.log(data);
                this.showNotification('success', 'Thông báo', ' Xóa Worksheet thành công ', 3000);
                this.getListWorksheet();
              }else{
                console.log(data);
                this.showNotification('error', 'Thông báo', ' Xóa Worksheet không thành công ', 3000);
                this.getListWorksheet();
              }
            }
          )
        }
        if(node.type === 'fd'){
          this.worksheetManagementService.deleteFolder(node.id).subscribe(
            (data:any) => {
              if(data.code == '200'){
                console.log(data);
                this.showNotification('success', 'Thông báo', ' Xóa Folder thành công ', 3000);
                this.getListWorksheet();
              }else{
                console.log(data);
                this.showNotification('error', 'Thông báo', ' Xóa Folder không thành công ', 3000);
                this.getListWorksheet();
              }
            }
          )
        }
      }
    });

  }

  onAddWorksheet(){
    console.log('Tạo mới Worksheet');
    // Thêm logic tạo mới Worksheet

    const dialogRef = this.dialog.open(CreateWorksheetDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const pattern = /^[a-zA-Z0-9]+$/;
        if(!pattern.test(result.name)){
          this.showNotification('error', 'Thông báo', 'Tên Worksheet hợp lệ ', 3000);
        }else{
          console.log('Worksheet được tạo:', result);
          this.worksheetManagementService.createWorksheet(result).subscribe(
            (data: any) => {
              if (data.code == 200) {
                console.log(data);
                this.showNotification('success', 'Thông báo', ' Tạo Worksheet thành công ', 3000);
                this.getListWorksheet();
              }else{
                console.log(data);
                this.showNotification('error', 'Thông báo', ' Tạo Worksheet không thành công: ' + data.desc, 3000);
                this.getListWorksheet();
              }
            }, error => {
              this.showNotification('error', 'Thông báo', ' Tạo Worksheet không thành công: ' + error.error.desc, 3000);
              this.getListWorksheet();
            }
          );
        }



      }
    });
  }

  onMove(node: any, folder: any){
    console.log('Node: ', node);
    console.log('Folder: ', folder);

    const updateRequest: UpdateWorksheetRequest ={
      folderId: folder.id
    }
    this.worksheetManagementService.updateWorksheet(updateRequest, node.id).subscribe(
      (data:any) => {
        if(data.code == '200'){
          console.log(data)
          this.showNotification('success', 'Thông báo', 'Lưu thay đổi thành công ', 3000);
          this.getListWorksheet();
        }
      },error => {
        console.log(error);
        this.showNotification('error', 'Thông báo', 'Lưu thay đổi không thành công: '+ error.error.desc, 3000);
      }
    )

  }

  showNotification(serverity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: `${serverity}`, summary: `${summary}`, detail: `${detail}`, life: lifetime });
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
