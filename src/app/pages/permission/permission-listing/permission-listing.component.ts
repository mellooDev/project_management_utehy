import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable } from 'rxjs';
import { DataTablesResponse, IPermissionModel, PermissionService } from 'src/app/services/permission.service';
import { SweetAlertOptions } from 'sweetalert2';
import moment from 'moment';
import {getListRequest} from "../../../services/user.service";

@Component({
  selector: 'app-permission-listing',
  templateUrl: './permission-listing.component.html',
  styleUrls: ['./permission-listing.component.scss']
})
export class PermissionListingComponent implements OnInit, AfterViewInit, OnDestroy {

  isCollapsed1 = false;

  isLoading = false;

  permissions: DataTablesResponse;

  datatableConfig: DataTables.Settings = {};

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  permission$: Observable<IPermissionModel>;
  permissionModel: IPermissionModel = { id: '', name: '', };

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  constructor(private apiService: PermissionService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.datatableConfig = {
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        const getListRq: getListRequest = {};
        getListRq.searchKey = dataTablesParameters.search.value;
        getListRq.pageNumber = (dataTablesParameters.start / dataTablesParameters.length);
        this.apiService.getPermissions(getListRq).subscribe(resp => {
          callback(resp.data);
        });
      },
      columns: [
        {
          title: 'Code', data: 'code',
          render: (data: any, type: any, full: IPermissionModel) => `<a href="javascript:;" data-action="view" data-id="${full.id}" class="text-gray-800 text-hover-primary mb-1">${data}</a>`
        },
        {
          title: 'Tên', data: 'name',
          render: (data: any, type: any, full: IPermissionModel) => `<a href="javascript:;" data-action="view" data-id="${full.id}" class="text-gray-800 text-hover-primary mb-1">${data}</a>`
        },
        {
          title: 'Mô tả', data: 'desc',
          render: (data: any, type: any, full: IPermissionModel) => `<a href="javascript:;" data-action="view" data-id="${full.id}" class="text-gray-800 text-hover-primary mb-1">${data}</a>`
        },
        {
          title: 'Ngày tạo', data: 'createdDate', render: function (data) {
            return moment(data).format('DD MMM YYYY, hh:mm a');
          }
        }
      ],
    };
  }

  delete(id: number) {
  }

  edit(id: number) {
    this.permission$ = this.apiService.getPermission(id);
    this.permission$.subscribe((src: any) => {
      this.permissionModel.id = src.data.id;
      this.permissionModel.name = src.data.name;
      this.permissionModel.desc = src.data.desc;
      this.permissionModel.code = src.data.code;
    });
  }

  create() {
    this.permissionModel = { id: '', name: '', };
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: 'Success!',
      text: this.permissionModel.id = '' ? 'Permission updated successfully!' : 'Permission created successfully!',
    };
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: 'Error!',
      text: '',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const updateFn = () => {
      // this.apiService.updatePermission(this.permissionModel.id, this.permissionModel).subscribe({
      //   next: () => {
      //     this.showAlert(successAlert);
      //     this.reloadEvent.emit(true);
      //   },
      //   error: (error) => {
      //     errorAlert.text = this.extractText(error.error);
      //     this.showAlert(errorAlert);
      //     this.isLoading = false;
      //   },
      //   complete: completeFn,
      // });
    };

    const createFn = () => {
      this.apiService.createPermission(this.permissionModel).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
        },
        error: (error) => {
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    if (this.permissionModel.id === '') {
      updateFn();
    } else {
      createFn();
    }
  }

  extractText(obj: any): string {
    var textArray: string[] = [];

    for (var key in obj) {
      if (typeof obj[key] === 'string') {
        // If the value is a string, add it to the 'textArray'
        textArray.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        // If the value is an object, recursively call the function and concatenate the results
        textArray = textArray.concat(this.extractText(obj[key]));
      }
    }

    // Use a Set to remove duplicates and convert back to an array
    var uniqueTextArray = Array.from(new Set(textArray));

    // Convert the uniqueTextArray to a single string with line breaks
    var text = uniqueTextArray.join('\n');

    return text;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign({
      buttonsStyling: false,
      confirmButtonText: "Ok, got it!",
      customClass: {
        confirmButton: "btn btn-" + style
      }
    }, swalOptions);
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

  ngOnDestroy(): void {
  }
}
