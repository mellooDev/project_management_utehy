import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {Observable} from 'rxjs';
import {
  DataTablesResponse,
  IRoleModel,
  IRoleUpdateModel,
  ISrcActionModel,
  RoleService
} from 'src/app/services/role.service';
import {SweetAlertOptions} from 'sweetalert2';
import {getListRequest, IUserModel, IUserUpdateModel, UserService} from "../../../services/user.service";
import moment from "moment/moment";
import {IPermissionModel, PermissionService} from "../../../services/permission.service";
import {allowMangle} from "@angular-devkit/build-angular/src/utils/environment-options";

@Component({
  selector: 'app-role-listing',
  templateUrl: './role-listing.component.html',
  styleUrls: ['./role-listing.component.scss']
})
export class RoleListingComponent implements OnInit, AfterViewInit, OnDestroy {
  isCollapsed1 = false;
  isCollapsed2 = false;

  isLoading = false;

  users: DataTablesResponse;

  datatableConfig: DataTables.Settings = {};

  datatableRoleConfig: DataTables.Settings = {};
  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  aRole: Observable<IRoleModel>;

  roleModel: IRoleModel = {id: '', name: ''}

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  allSrcs$: any;

  constructor(private apiService: UserService, private roleService: RoleService, private cdr: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.datatableConfig = {
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        const getListRq: getListRequest = {};
        getListRq.searchKey = dataTablesParameters.search.value;
        getListRq.pageNumber = (dataTablesParameters.start / dataTablesParameters.length);
        this.roleService.getRoles(getListRq).subscribe(resp => {
          callback(resp.data);
        });

      },
      columns: [
        {
          title: 'Tên nhóm quyền', data: 'name', render: (data, type, full) => {

            return `<a href="javascript:;" data-action="view" data-id="${full.id}" class="text-gray-800 text-hover-primary mb-1">${data}</a>`;
          }
        },
        {
          title: 'Mô tả', data: 'desc', render: (data, type, full) => {

            return data;
          }
        },
        {
          title: 'Ngày tạo', data: 'createdDate', render: function (data) {
            return moment(data).format('DD MMM YYYY, hh:mm a');
          }
        }
      ],
      createdRow: function (row, data, dataIndex) {
        $('td:eq(0)', row).addClass('d-flex align-items-center');
      },
    };
    const getListRq: getListRequest = {};
    getListRq.searchKey = '';
    getListRq.pageNumber = 0;
    this.roleService.getSrcs(getListRq).subscribe((resp: any) => {
      this.allSrcs$ = resp.data.data;
    });

  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: 'Success!',
      text: this.roleModel.id !== '' ? 'Cập nhật nhóm quyền thành công' : 'Tạo mới nhóm quyền thành công!',
    };
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: 'Error!',
      text: 'Có lỗi xảy ra!',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const updateFn = () => {
      const requestUpdate: IRoleUpdateModel = {};
      requestUpdate.id = this.roleModel.id;
      requestUpdate.code = this.roleModel.code;
      requestUpdate.name = this.roleModel.name;
      requestUpdate.desc = this.roleModel.desc;
      requestUpdate.status = this.roleModel.status;

      const lstSrc: ISrcActionModel[] = [];
      this.allSrcs$.forEach((src: any) => {
        if (src.checked) {
          const srcInfo: ISrcActionModel = {};
          srcInfo.srcCode = src.id;
          srcInfo.lstAction = src.action;
          lstSrc.push(srcInfo);
        }
      })
      requestUpdate.srcList = lstSrc;

      this.roleService.updateRole(requestUpdate).subscribe({
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

    const createFn = () => {
      const requestCreate: IRoleUpdateModel = {};

      requestCreate.code = this.roleModel.code;
      requestCreate.name = this.roleModel.name;
      requestCreate.desc = this.roleModel.desc;

      const lstSrc: ISrcActionModel[] = [];
      this.allSrcs$.forEach((src: any) => {
        if (src.checked) {
          const srcInfo: ISrcActionModel = {};
          srcInfo.srcCode = src.id;
          srcInfo.lstAction = src.action;
          lstSrc.push(srcInfo);
        }
      })
      requestCreate.srcList = lstSrc;

      this.roleService.createRole(requestCreate).subscribe({
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
    if (this.roleModel.id == '') {
      createFn()
    } else {
      updateFn();
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


  create() {
    this.allSrcs$.forEach((src: any) => {
      src.checked = false;
      src.action = [];
    })
    this.roleModel = {id: '', name: ''};
  }

  edit(id: number) {
    this.aRole = this.roleService.getRole(id);
    this.aRole.subscribe((role: any) => {
      const srcInfo: any = [];
      const mapAction = new Map();
      if (role.data.srcInfo !== null) {
        role.data.srcInfo.forEach((src: any) => {
          srcInfo.push(src.srcCode);
          mapAction.set(src.srcCode, src.action);
        })
      }
      this.allSrcs$.forEach((src: any) => {
        src.checked = false;
        src.action = [];
        if (srcInfo.includes(src.code)) {
          src.checked = true;
          src.action = mapAction.get(src.code);
        }
      })

      this.roleModel.id = role.data.roleInfo.id;
      this.roleModel.code = role.data.roleInfo.code;
      this.roleModel.name = role.data.roleInfo.name;
      this.roleModel.status = role.data.roleInfo.status;
      this.roleModel.desc = role.data.roleInfo.desc;
    });
  }

  changeStateSrc(src: any) {
    src.checked = !src.checked;
  }

  changeActionSrc(event: Event, src: any) {
    const checkbox = event.target as HTMLInputElement;
    const value = parseInt(checkbox.value, 10).toString();
    if (checkbox.checked) {
      if (src.action === null) {
        src.action = [];
      }
      src.action.push(value);
    } else {
      const index = src.action.indexOf(value);
      if (index !== -1) {
        src.action.splice(index, 1);
      }
    }
  }

  // addActionToSrc(event: Event, src: any){
  //   const checkbox = event.target as HTMLInputElement;
  //   const value = parseInt(checkbox.value, 10);
  //
  //   if (checkbox.checked) {
  //     // Th�m gi� tr? v�o m?ng khi checkbox ???c ch?n
  //     src.push(value);
  //   } else {
  //     // X�a gi� tr? kh?i m?ng khi checkbox kh�ng ???c ch?n
  //     const index = this.src.indexOf(value);
  //     if (index !== -1) {
  //       src.splice(index, 1);
  //     }
  //   }
  // }
  delete(id: number) {
    this.apiService.deleteUser(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  ngOnDestroy(): void {
    this.reloadEvent.unsubscribe();
  }

  protected readonly eval = eval;
}
