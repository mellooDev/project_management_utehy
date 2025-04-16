import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {Observable} from 'rxjs';
import {
  DataTablesResponse,
  getListRequest,
  IUserModel,
  IUserUpdateModel,
  UserService
} from 'src/app/services/user.service';
import {SweetAlertOptions} from 'sweetalert2';
import moment from 'moment';
import {IRoleModel, RoleService} from 'src/app/services/role.service';

@Component({
  selector: 'app-user-listing',
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss']
})
export class UserListingComponent implements OnInit, AfterViewInit, OnDestroy {

  isCollapsed1 = false;
  isCollapsed2 = false;

  isLoading = false;

  users: DataTablesResponse;

  datatableConfig: DataTables.Settings = {};

  datatableRoleConfig: DataTables.Settings = {};
  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  aUser: Observable<IUserModel>;
  userModel: IUserModel = {id: '', name: '', email: '', role: ''};

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  allRoles$: any;

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
        this.apiService.getUsers(getListRq).subscribe(resp => {
          callback(resp.data);
        });

      },
      columns: [

        {
          title: 'H? v� t�n', data: 'fullName', render: function (data, type, full) {
            const colorClasses = ['success', 'info', 'warning', 'danger'];
            const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];

            const initials = data[0].toUpperCase();
            const symbolLabel = `
              <div class="symbol-label fs-3 bg-light-${randomColorClass} text-${randomColorClass}">
                ${initials}
              </div>
            `;

            const nameAndEmail = `
              <div class="d-flex flex-column" data-action="view" data-id="${full.id}">
                <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">${data}</a>
                <span>${full.email}</span>
              </div>
            `;

            return `
              <div class="symbol symbol-circle symbol-50px overflow-hidden me-3" data-action="view" data-id="${full.id}">
                <a href="javascript:;">
                  ${symbolLabel}
                </a>
              </div>
              ${nameAndEmail}
            `;
          }
        },
        {
          title: 'Email', data: 'email', render: (data, type, full) => {
            return data;
          }
        },
        {
          title: 'Tài khoản', data: 'username', render: (data, type, full) => {

            return data;
          }
        },
        {
          title: 'Điện thoại', data: 'phone', render: (data, type, full) => {

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
    this.roleService.getRoles(getListRq).subscribe((resp: any) => {
      this.allRoles$ = resp.data.data;
    });
  }

  delete(id: number) {
    this.apiService.deleteUser(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  edit(id: number) {
    this.aUser = this.apiService.getUserUpdate(id);
    this.aUser.subscribe((user: any) => {
      const roleInfo = user.data.roleInfo;
      this.allRoles$.forEach((role: any) => {
        role.checked = false;
        role.checked = !!roleInfo.includes(role.code);
      })
      this.userModel.id = user.data.userInfo.id;
      this.userModel.name = user.data.userInfo.fullName;
      this.userModel.email = user.data.userInfo.email;
      this.userModel.phone = user.data.userInfo.phone;
      this.userModel.status = user.data.userInfo.status;
      this.userModel.username = user.data.userInfo.username;
    });
  }

  create() {
    this.userModel = {id: '', name: '', email: '',};
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: 'Success!',
      text: this.userModel.id !== '' ? 'Cập nhật người dùng thành công!' : 'Tạo mới người dùng thành công!',
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
      const requestUpdate: IUserUpdateModel = {};
      const roleList: any = [];
      this.allRoles$.forEach((role: any) => {
        if (role.checked == true) {
          roleList.push(role.id);
        }
      });
      requestUpdate.userId = this.userModel.id;
      requestUpdate.username = this.userModel.username;
      requestUpdate.status = this.userModel.status;
      requestUpdate.phone = this.userModel.phone;
      requestUpdate.email = this.userModel.email;
      requestUpdate.fullname = this.userModel.name;
      requestUpdate.roles = roleList;

      this.apiService.updateUser(requestUpdate).subscribe({
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
      const requestCreate: IUserUpdateModel = {};
      const roleList: any = [];
      this.allRoles$.forEach((role: any) => {
        if (role.checked == true) {
          roleList.push(role.id);
        }
      });
      requestCreate.username = this.userModel.username;
      requestCreate.phone = this.userModel.phone;
      requestCreate.email = this.userModel.email;
      requestCreate.fullname = this.userModel.name;
      requestCreate.roles = roleList;
      this.apiService.createUser(requestCreate).subscribe({
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
    if (this.userModel.id == '') {
      createFn()
    } else {
      updateFn();
    }
  }

  setRoleForUser(role: any) {
    role.checked = !role.checked
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
    this.reloadEvent.unsubscribe();
  }
}
