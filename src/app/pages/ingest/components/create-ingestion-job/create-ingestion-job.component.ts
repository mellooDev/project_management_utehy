import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import { js_beautify } from 'js-beautify';
import Papa from 'papaparse';
import { BaseResponse } from 'src/app/models/base';
import {
  ApiAuthType,
  AvroSchemaMapping,
  IngestionJobDTO,
  IngestionJobReq,
  JobSrcType,
} from 'src/app/models/ingestion-job';
import { DataManagementService } from 'src/app/services/data-management.service';
import { IngestionJobService } from 'src/app/services/ingestion-job.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import {
  AVRO_DATA_TYPE,
  AvroHelper,
  aVROSchemaFeild,
} from 'src/app/utils/avro-helper';
import { FormHelper } from 'src/app/utils/form-helper';
import { ObjectHelper } from 'src/app/utils/object-helper';
import { TextHelper } from 'src/app/utils/text-helper';

@Component({
  selector: 'app-create-ingestion-job',
  templateUrl: './create-ingestion-job.component.html',
  styleUrls: ['./create-ingestion-job.component.scss'],
})
export class CreateIngestionJobComponent implements OnInit {
  private TOKEN: string;
  ingestionForm!: FormGroup;
  sourceConfigForm!: FormGroup;
  destinationConfigForm!: FormGroup;

  databaseOptions: any[] = [];
  tableOptions: any[] = [];
  ApiAuthType = ApiAuthType;
  fileBefore: File;
  basicAuth = {
    username: '',
    password: '',
  };
  isCreateNew: boolean = false;
  bearerToken: string = '';

  // Bổ sung thêm các thuộc tính mới cho xử lý CSV
  csvCols: string[] = []; // Tên các cột
  dataSource: any[] = []; // Dữ liệu hiển thị trong bảng
  dataTypes: string[] = []; // Kiểu dữ liệu của từng cột

  displayedColumns: string[] = [
    'fieldName',
    'fieldType',
    'columnName',
    'required',
    'primaryKey',
    'actions',
  ];
  mappingData: any[] = []; // Dữ liệu bảng cấu hình
  fieldTypes = AVRO_DATA_TYPE;
  tableColumns: any[] = []; // Cột của bảng database

  errMsg: string = '';

  get ingestControls() {
    return this.ingestionForm.controls;
  }
  get sourceConfigControls() {
    return this.sourceConfigForm.controls;
  }
  get destinationConfigControls() {
    return this.destinationConfigForm.controls;
  }
  // Getter để truy cập `FormArray`
  get apiHeaders(): FormArray {
    return this.sourceConfigForm.get('apiHeaders') as FormArray;
  }

  get apiParams(): FormArray {
    return this.sourceConfigForm.get('apiParams') as FormArray;
  }

  get mappingConfig(): FormArray {
    return this.destinationConfigForm.get('mappingConfig') as FormArray;
  }

  onCreateCheck(isChecked: boolean) {
    this.isCreateNew = isChecked;
    console.log(this.isCreateNew);
  }

  constructor(
    private fb: FormBuilder,
    private ingestionJobService: IngestionJobService,
    private dataManagementService: DataManagementService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.TOKEN = this.tokenStorage.getToken();
    this.getDatabase();
    this.initializeForms();
  }

  getDatabase() {
    this.dataManagementService.getListDatabases(this.TOKEN).subscribe((res) => {
      if (res?.owned?.length) {
        this.databaseOptions = res.owned;
      }
    });
  }

  initializeForms() {
    // Step 1: Thông tin chung
    this.ingestionForm = this.fb.group({
      jobName: ['', [Validators.required]],
      description: [],
      jobSrcType: ['FILE', [Validators.required]],
      startNow: [true],
    });

    // Step 2: Cấu hình nguồn dữ liệu
    this.sourceConfigForm = this.fb.group({
      dataPath: [null],
      avroSchemaJson: [null],
      apiUrl: [null],
      apiHttpMethod: ['GET'],
      apiHeaders: this.fb.array([]), // FormArray cho headers
      apiParams: this.fb.array([]), // FormArray cho params
      apiBody: [null, [FormHelper.jsonValidator()]],
      apiAuthType: [ApiAuthType.NONE],
      apiAuthDetails: [null],

      numberOfPartitions: [null],
      cleanupPolicy: [null],
      minInSyncReplicas: [null],
      replicationFactor: [null],
      retentionTimeMs: [null],
      maxSizeOnDiskGB: [null],
      maxMessageSizeBytes: [null],
      // customParameters: [null],
      fileHasHeader: [true],
      fileDelimiter: [','],
      fileName: [null],
    });

    // Step 3: Cấu hình đích
    this.destinationConfigForm = this.fb.group(
      {
        userDatabaseId: [null], // Chọn Database
        userTableId: [null], // Chọn Table
        databaseName: [null, [FormHelper.dbNameValidator]], // Tạo Database mới
        tableName: [null, [FormHelper.dbNameValidator]], // Tạo Table mới
        mappingConfig: this.fb.array([]),
      },
      {
        validators: [
          FormHelper.atLeastOneRequired('userDatabaseId', 'databaseName'), // Ít nhất một Database phải được chọn hoặc tạo mới
          FormHelper.atLeastOneRequired('userTableId', 'tableName'), // Ít nhất một Table phải được chọn hoặc tạo mới
        ],
      }
    );
    this.changeJobSrcType();
  }

  changeJobSrcType() {
    let srcType = this.ingestionForm.get('jobSrcType')?.value;

    if (srcType === JobSrcType.API) {
      this.sourceConfigForm.get('apiUrl')?.setValidators([Validators.required]);
      this.sourceConfigForm
        .get('apiHttpMethod')
        ?.setValidators([Validators.required]);
      this.sourceConfigForm.get('fileDelimiter')?.clearValidators();
      this.sourceConfigForm.get('fileName')?.clearValidators();
    } else if (srcType === JobSrcType.KAFKA) {
      this.sourceConfigForm.get('apiUrl')?.clearValidators();
      this.sourceConfigForm.get('apiHttpMethod')?.clearValidators();
      this.sourceConfigForm.get('fileDelimiter')?.clearValidators();
      this.sourceConfigForm.get('fileName')?.clearValidators();
    } else if (srcType === JobSrcType.FILE) {
      this.sourceConfigForm
        .get('fileDelimiter')
        ?.setValidators([Validators.required]);
      this.sourceConfigForm
        .get('fileName')
        ?.setValidators([Validators.required]);
      this.sourceConfigForm
        .get('fileName')
        ?.updateValueAndValidity({ emitEvent: false });
      this.sourceConfigForm.get('fileName')?.markAsTouched(); // Đánh dấu `fileName` là touched

      this.sourceConfigForm.get('apiUrl')?.clearValidators();
      this.sourceConfigForm.get('apiHttpMethod')?.clearValidators();
    }

    // Cập nhật trạng thái form
    this.sourceConfigForm
      .get('apiUrl')
      ?.updateValueAndValidity({ emitEvent: false });
    this.sourceConfigForm
      .get('apiHttpMethod')
      ?.updateValueAndValidity({ emitEvent: false });
    this.sourceConfigForm
      .get('fileName')
      ?.updateValueAndValidity({ emitEvent: false });
  }

  onAvroSchemaChange(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // Parse the content as JSON
          const fileContent = reader.result as string;
          const jsonContent = JSON.parse(fileContent);

          // Set the schema JSON content
          this.sourceConfigForm.get('avroSchemaJson')?.setValue(fileContent);

          // Extract fields and populate mappingConfig
          const fields = jsonContent.fields || [];
          const avroSchemaMapping =
            (jsonContent.mapping as AvroSchemaMapping[]) || [];
          const mappingArray = fields.map((field: any) =>
            this.createMappingRow({
              fieldName: field.name,
              fieldType: field.type,
              columnName:
                avroSchemaMapping.find((x) => x.fieldName === field.name)
                  ?.columnName || field.name,
              required: (jsonContent.required || []).includes(field.name),
              primaryKey: field.doc?.primary || false,
              description: field.doc?.description || field.name,
            })
          );

          // Update mappingConfig FormArray
          const formArray = this.fb.array(mappingArray);
          this.destinationConfigForm.setControl('mappingConfig', formArray);
          FormHelper.markAllAsTouched(this.destinationConfigForm);
        } catch (error) {
          console.error('Error parsing AVSC file:', error);
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading AVSC file:', error);
      };

      reader.readAsText(file);
    }
  }

  userDatabaseChange() {
    const dbId = this.destinationConfigForm.get('userDatabaseId')?.value;
    if (dbId) {
      this.destinationConfigForm.get('databaseName')?.reset();
      this.dataManagementService
        .getDatabaseTable(dbId, this.TOKEN)
        .subscribe((res) => {
          this.tableOptions = res;
        });
    } else {
      this.tableOptions = [];
    }
  }
  userTableChange() {
    const tableId = this.destinationConfigForm.get('userTableId')?.value;

    if (tableId) {
      this.destinationConfigForm.get('tableName')?.reset();
      const tbl = this.tableOptions.find((x) => x.id == tableId);
      const tblSchema = JSON.parse(tbl?.schemaDefinition);

      this.tableColumns = tblSchema?.fields.map((f: aVROSchemaFeild) => ({
        colName: f.name,
        colType: f.type,
        primaryKey: f.doc?.primary === true,
        required: tblSchema.required?.includes(f.name) || false,
      }));

      // Cập nhật giá trị cột khi chọn bảng
      this.mappingConfig.controls.forEach((control) => {
        const colName = control.get('columnName')?.value;

        // Nếu columnName không khớp, reset về giá trị mặc định
        if (!this.tableColumns.find((col) => col.colName === colName)) {
          control.get('columnName')?.setValue('');
        }

        // Duy trì validator kiểm tra định dạng
        control
          .get('columnName')
          ?.setValidators([Validators.required, FormHelper.dbNameValidator]);
        control.get('columnName')?.updateValueAndValidity();
      });
    } else {
      this.tableColumns = [];
    }
  }

  // Hàm thêm key-value
  addKeyValue(arrayName: 'apiHeaders' | 'apiParams'): void {
    const array = this[arrayName];
    array.push(
      this.fb.group({
        key: ['', Validators.required],
        value: ['', Validators.required],
      })
    );
  }

  // Hàm xóa key-value
  removeKeyValue(arrayName: 'apiHeaders' | 'apiParams', index: number): void {
    const array = this[arrayName];
    array.removeAt(index);
  }

  // Chỉnh sửa logic submit
  submit() {
    if (
      this.ingestionForm.valid &&
      this.sourceConfigForm.valid &&
      this.destinationConfigForm.valid
    ) {
      let srcType = this.ingestionForm.get('jobSrcType')?.value;
      const payload = {
        ...this.ingestionForm.value,
        ...this.sourceConfigForm.value,
        ...this.destinationConfigForm.value,
      };

      payload.apiParams = undefined;
      payload.apiHeaders = undefined;
      payload.mappingConfig = undefined;
      payload as IngestionJobReq;

      // destination
      let dbId = this.destinationConfigForm.get('userDatabaseId')?.value;
      if (dbId) {
        payload.databaseName = this.databaseOptions.find(
          (x) => x.id == dbId
        ).immudbName;
      }
      let tableId = this.destinationConfigForm.get('userTableId')?.value;
      if (tableId) {
        payload.tableName = this.tableOptions.find(
          (x) => x.id == tableId
        ).tableName;
      }
      let mappingConfig = this.destinationConfigForm.get(
        'mappingConfig'
      ) as FormArray;
      let schema = AvroHelper.generateAvroSchema(
        mappingConfig,
        payload.tableName
      );
      payload.avroSchemaJson = JSON.stringify(schema);
      if (srcType === JobSrcType.API) {
        if (this.apiHeaders.length) {
          const headersObject = ObjectHelper.convertKeyValueArrayToObject<
            string,
            string
          >(this.apiHeaders.getRawValue());
          payload.apiHeaders = JSON.stringify(headersObject);
        } else {
          payload.apiHeaders = undefined;
        }
        if (this.apiParams.length) {
          const paramsObject = ObjectHelper.convertKeyValueArrayToObject<
            string,
            string
          >(this.apiParams.getRawValue());
          payload.apiParams = JSON.stringify(paramsObject);
        } else {
          payload.apiParams = undefined;
        }
        if (
          this.sourceConfigForm.get('apiAuthType')?.value === ApiAuthType.BASIC
        ) {
          payload.apiAuthDetails = `${this.basicAuth.username}:${this.basicAuth.password}`;
        }
        this.ingestionJobService.create(payload).subscribe(
          (res: BaseResponse<IngestionJobDTO>) => {
            this.submitSuccess(res);
          },
          (err: Error) => {
            this.errMsg = err.message;
            console.error('Create ingestion job falled, error:', err);
          }
        );
      } else if (payload.jobSrcType === JobSrcType.FILE && this.fileBefore) {
        payload.ApiAuthType = undefined;
        payload.apiHttpMethod = undefined;

        this.ingestionJobService.uploadCsv(this.fileBefore, payload).subscribe(
          (res: BaseResponse<IngestionJobDTO>) => {
            this.submitSuccess(res);
          },
          (err: Error) => {
            this.errMsg = err.message;
            console.error('Create ingestion job falled, error:', err);
          }
        );
      } else {
        payload.ApiAuthType = undefined;
        payload.apiHttpMethod = undefined;
        this.ingestionJobService.create(payload).subscribe(
          (res: BaseResponse<IngestionJobDTO>) => {
            console.log('Create job src KAFKA successfully:', res);
            this.submitSuccess(res);
          },
          (err: Error) => {
            this.errMsg = err.message;
            console.error('Create ingestion job falled, error:', err);
          }
        );
      }
    }
  }
  submitSuccess(res: BaseResponse<IngestionJobDTO>) {
    if (!res.data?.id) {
      console.error('Create ingestion job falled, error:', res);
      this.errMsg = 'Có lỗi hệ thống xảy ra!';
      return;
    }
    const snackBarRef = this.snackBar.open('Tạo job đồng bộ thành công!', '', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['success-snackbar'],
    });
    this.router.navigate(['/ingest']);
    // snackBarRef.afterDismissed().subscribe(() => {
    //   this.router.navigate(['/ingest']);
    // });
  }

  onFileCsvChange(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;
    this.sourceConfigForm.get('fileName')?.setValue(file.name);
    // Lưu file vào biến để gửi lên server
    this.fileBefore = file;

    const delimiter = this.sourceConfigForm.value.fileDelimiter || ','; // Ký tự phân cách
    const hasHeader = this.sourceConfigForm.value.fileHasHeader; // File có header hay không

    // Xử lý preview 50 dòng bằng Papa.parse
    Papa.parse(file, {
      delimiter: delimiter,
      header: hasHeader,
      skipEmptyLines: true,
      preview: 50, // Hiển thị tối đa 50 dòng
      complete: (result: any) => {
        const rows = result.data as any[];
        if (rows.length > 0) {
          // Lấy tên cột
          this.csvCols = hasHeader
            ? Object.keys(rows[0])
            : rows[0].map((_: any, index: number) => `C${index + 1}`);

          // Lấy kiểu dữ liệu từ các cột
          this.dataTypes = this.csvCols.map((column) => {
            // Lấy tất cả giá trị của cột này
            const columnValues = rows.map((row) => row[column]);
            return AvroHelper.detectAvroType(columnValues); // Kiểm tra kiểu dữ liệu với nâng cấp mới
          });

          // Lưu dữ liệu preview (50 dòng)
          this.dataSource = rows;

          // Cập nhật form mapping
          this.initializeMappingData();
        }
      },
      error: (err: Error) => {
        this.errMsg = err.message;
        console.error('Error parsing CSV:', err);
      },
    });
  }

  initializeMappingData(): void {
    if (this.ingestionForm.value.jobSrcType === 'FILE' && this.csvCols.length) {
      const mappingArray = this.csvCols.map((fieldName, index) =>
        this.createMappingRow({
          fieldName,
          fieldType: this.dataTypes[index] || 'string',
          columnName: TextHelper.normalizeToText(fieldName),
          description: fieldName,
        })
      );

      // Đặt FormArray
      const formArray = this.fb.array(mappingArray);
      this.destinationConfigForm.setControl('mappingConfig', formArray);
      FormHelper.markAllAsTouched(this.destinationConfigForm);
    }
  }

  createMappingRow(data: any = {}): FormGroup {
    return this.fb.group({
      fieldName: [data.fieldName || '', Validators.required],
      fieldType: [data.fieldType || 'string', Validators.required],
      columnName: [
        data.columnName || '',
        [Validators.required, FormHelper.dbNameValidator], // Kiểm tra luôn định dạng tên cột
      ],
      required: [data.required || false],
      primaryKey: [data.primaryKey || false],
      description: [data.description || null],
    });
  }
  addMappingRow(): void {
    this.mappingConfig.push(this.createMappingRow());
  }

  removeMappingRow(index: number): void {
    this.mappingConfig.removeAt(index);
  }
  controlHasError(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  controlIsValid(control: AbstractControl | null): boolean {
    return !!(control && control.valid && (control.dirty || control.touched));
  }

  beautifyJson() {
    const control = this.sourceConfigForm.get('apiBody');
    if (!control) return;

    try {
      const parsedJson = JSON.parse(control.value);
      const beautifiedJson = js_beautify(JSON.stringify(parsedJson), {
        indent_size: 2,
      });
      control.setValue(beautifiedJson); // Cập nhật JSON làm đẹp vào FormControl
    } catch (e) {
      console.error('JSON không hợp lệ:', e);
    }
  }
  downloadAvroSchema(): void {
    const tableName =
      this.destinationConfigForm.get('tableName')?.value || 'AvroSchema';
    let mappingConfig = this.destinationConfigForm.get(
      'mappingConfig'
    ) as FormArray;
    let schema = AvroHelper.generateAvroSchema(mappingConfig, tableName);
    let avroSchemaJson = JSON.stringify(schema);

    const blob = new Blob([avroSchemaJson], { type: 'application/json' });
    const fileName = `${tableName}.avsc`;

    saveAs(blob, fileName); // Sử dụng file-saver để tải file
  }
}
