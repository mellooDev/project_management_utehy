import {ChangeDetectorRef, Component, OnInit, TemplateRef} from '@angular/core';
import { WarehouseManagementService } from 'src/app/services/warehouse-management.service';
import {NgForm} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/services/user.service';
import { filter } from 'rxjs';


@Component({
  providers: [MessageService],
  selector: 'app-warehouse-management',
  templateUrl: './warehouse-management.component.html',
  styleUrl: './warehouse-management.component.scss',
  animations: [
    trigger('rotateIcon', [
      state('opened', style({
        transform: 'rotate(180deg)',
      })),
      state('closed', style({
        transform: 'rotate(0deg)'
      })),
      transition('opened <=> closed', [
        animate('0.3s ease')
      ])
    ])
  ]
})
export class WarehouseManagementComponent implements OnInit {

  warehouseData: any;
  warehousePkgData: any;
  filteredData: any[] = [];
  pagedData: any[] = [];
  packages: any[] = [];
  statuses: any[] = [];
  searchTerm: string = '';
  // selectedPackage: string = '';
  selectedStatus: string = '';
  currentPage: number = 1;
  pageSize: number = 8;
  recordsTotal: number = 0;
  loading: boolean = false;
  isLoading = false;
  modal: TemplateRef<any>;
  cpuText: string = ' CPU';
  showAdvancedOptions: boolean = false;
  autoResume: boolean = false;
  autoSuspend: boolean = false;
  suspendTime: number | null = null;
  selectedPackage: any = null;
  selectedPackageName: string = '';
  ramValue: number | string = '';
  cpuValue: number | string = '';
  warehouseName: string;
  warehouseSelectedItem: any;
  pendingValue: boolean | null = null;
  warehouseSelectedName: string;
  warehouseSelectedId: number;
  warehouseDescription: string;
  hourOfUse: number;
  storage: number;
  pkgWarehouseNames: {[key: number]: string} = {};
  ownerNames: {[key: number]: string} = {};
  listWarehouseTask: any[] = [];


  constructor(private warehouseService: WarehouseManagementService, private cdr: ChangeDetectorRef,
              private modalService: NgbModal, private router: Router, private messageService: MessageService,
              private userService: UserService
              ) {}

  ngOnInit() {
    this.loadWarehouse();

    this.router.events.pipe(
        filter((event: any) => event instanceof NavigationEnd)
    ).subscribe(() => {
      console.log('reloading warehouse');
      this.loadWarehouse();
    })
    this.onLoadTask();
    this.cdr.detectChanges();

    this.loadPkgWarehouse();
  }

  onSelectPackage() {
    console.log("Gói đã chọn:", this.selectedPackage.id);

    const selected = this.warehousePkgData.find((pkg: any) => pkg.id == this.selectedPackage.id);


    if(selected) {
      this.selectedPackage = selected;

      const ramFormat = selected.ram.match(/\d+/)?.[0] || '';
      const cpuFormat = selected.cpu.match(/\d+/)?.[0] || '';

      this.ramValue = ramFormat;
      this.cpuValue = cpuFormat;
    }
  }

  onSearch(): void {
    const selected = this.warehouseData.find((pkg: any) => pkg.id === this.selectedPackage);
    if(selected) {
      this.selectedPackageName = `${selected.name}, ${selected.priceOneHour} / giờ`;
      console.log('Gói đã chọn:', this.selectedPackageName);
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }

  onPurchaseSuccess(orderId: number) {
    this.router.navigate(['/buy', orderId], {
      state: {isWarehousePurchase: true}
    })
  }

  onSubmit(event: Event, myForm: NgForm) {
    event.preventDefault();

    this.isLoading = true;
    if(myForm.invalid) {
      console.log('Form invalid');
      return;
    }

    const warehousePayload = {
      warehouseName: this.warehouseName,
      description: this.warehouseDescription,
      packageWarehouseId: this.selectedPackage.id,
      hourOfUse: this.hourOfUse,
      rom: this.storage + ' GB',
      isAutoResume: this.autoResume,
      isAutoSuspend: this.autoSuspend,
      timeAutoPause: this.autoSuspend ? this.suspendTime || 0 : 0
    }

    console.log("payload: ", warehousePayload);

    this.warehouseService.createWarehouse(warehousePayload).subscribe({
      next: (res) => {
        console.log('create success', res);
        console.log('orderid success', res.data);
        this.isLoading = false;
        this.modalService.dismissAll();
        this.showNotification('success', 'Thông báo', 'Mua warehouse thành công. Đang chuyển tới trang thanh toán...', 1800);
        setTimeout(() => {
          this.onPurchaseSuccess(res.data)
        }, 1500);
      },
      error: (err) => {
        console.error('error: ', err);
        this.isLoading = false;

      }
    })

  }

  openModalSuspendOrUnsuspend(modal: any, warehouseName: string, warehouseItem: any, warehouseId: number, isSuspend: boolean) {
    this.warehouseSelectedName = warehouseName;
    this.warehouseSelectedId = warehouseId;
    this.pendingValue = isSuspend;
    this.warehouseSelectedItem = warehouseItem;
    this.modalService.open(modal, {
      centered: true
    });
  }

  openModalTransferOwner(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true
    })
  }

  onLoadTask() {
    const payload = {
      currentPage: this.currentPage - 1,
      perPage: this.pageSize,
      filter: '',
      sortBy: '',
      sortDesc: false,
    }
    console.log("onLoadTask", this.recordsTotal, " ", this.currentPage)
    this.warehouseService.getTask(payload).subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.listWarehouseTask = res.data || [];
        this.recordsTotal = res.recordsTotal;
        console.log('Total records:', res.recordsTotal);
        console.log('res.data: ', this.listWarehouseTask);
        this.cdr.detectChanges();

      },
      error: (err) => {
        console.error('error: ', err);
      }
    })
  }

  onPageChange(page: number) {
    console.log('Chuyển sang trang:', page);
    this.currentPage = page;
    this.onLoadTask();
  }

  onLoadDatabaseByUser() {
    this.warehouseService.getDatabaseByUser().subscribe({
      next: (res) => {
        console.log('res: ', res);
      },
      error: (err) => {
        console.error('error: ', err);
      }
    })
  }

  getQueryFromMetadata(metadata: any): string {
    try {
      const parsedMetadata = JSON.parse(metadata);
      return parsedMetadata.query || 'Khong co query'
    } catch (error) {
      return 'loi';
    }
  }

  getExecutionTime(timeStart: string, timeEnd: string) {
    if(!timeStart || !timeEnd) return 'N/A';
    const start = new Date(timeStart).getTime();
    const end = new Date(timeEnd).getTime();

    const duration = (end - start) / 1000;
    return `${duration}s`;
  }

  onTransferOwner(event: Event, myForm: NgForm) {
    event.preventDefault();

    if(myForm.invalid) {
      console.log('Form invalid');
    }
  }

  navigateToDetail(item: any) {
    this.router.navigate(['/warehouse-management/'+item.id]);
  }

  onSuspendOrUnsuspend(event: Event, myForm: NgForm) {
    event.preventDefault();

    this.isLoading = true;
    if(myForm.invalid) {
      console.log('Form invalid');
      return;
    }

    const apiCall = this.pendingValue ?
      this.warehouseService.suspendWarehouse(this.warehouseSelectedId) :
      this.warehouseService.unSuspendWarehouse(this.warehouseSelectedId);

    apiCall.subscribe({
      next: (res) => {
        console.log(`${this.pendingValue ? 'Tạm dừng' : 'Khởi chạy'} thành công`, res);
        this.warehouseSelectedItem.isSuspended = this.pendingValue;
        this.isLoading = false;
        this.showNotification('success', 'Thông báo', `${this.pendingValue ? 'Tạm dừng' : 'Khởi chạy'} thành công`, 3000);
        this.modalService.dismissAll();
      },
      error: (err) => {
        console.log(`Lỗi khi ${this.pendingValue ? 'tạm dừng' : 'khởi chạy'}`, err);
        this.isLoading = false;
        this.showNotification('error', 'Thông báo', `Lỗi khi ${this.pendingValue ? 'tạm dừng' : 'khởi chạy'}`, 3000);
        this.modalService.dismissAll();
      }
    })
  }

  showNotification(severity: string, summary: string, detail: string, lifetime: number) {
    this.messageService.add({ severity: severity, summary: summary, detail: detail, life: lifetime })
  }

  loadWarehouse() {
    this.warehouseService.getAllWarehouse().subscribe(res => {
      this.warehouseData = res.data;

      this.pkgWarehouseNames = {};
      this.ownerNames = {};

      const ids = res.data.map((item: any) => item.packageWarehouseId);
      const ownerNames = res.data.map((item: any) => item.customerId);
      ids.forEach((id: any) => {
        this.loadPkgWarehouseById(id);
      })

      ownerNames.forEach((id: any) => {
        this.loadOwnerNameById(id);
      })

      console.log('response pkg warehouse: ', this.warehouseData);

      this.cdr.detectChanges();
    })
  }

  loadPkgWarehouseById(id: any) {
    this.warehouseService.getPkgWarehouseById(id).subscribe((res) => {
      this.pkgWarehouseNames[id] = res?.data.name;
      console.log('pkgWarehouseName: ', this.pkgWarehouseNames[id]);

    })
  }

  loadOwnerNameById(id: any) {
    this.userService.getProfileUser(id).subscribe((res) => {
      this.ownerNames[id] = res?.account.full_name;
      console.log(`ownerName by ${id}: `, this.ownerNames[id]);
    })
  }

  loadPkgWarehouse() {
    this.warehouseService.getAllPkgWarehouse().subscribe(res => {
      this.warehousePkgData = res.data;
      console.log('response pkg warehouse: ', this.warehousePkgData);
    })
  }
  applySearchFilter(): void {
    if (this.searchTerm) {
      this.filteredData = this.warehouseData.filter((item: any) => item.warehouseName.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
    else {
      this.filteredData = [...this.warehouseData];
    }
  }


  openModalViewDocument(modal: any) {

    this.modalService.open(modal);

  }

  toggleAdvancedOptions() {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  onAutoSuspendChange() {
    if(!this.autoSuspend) {
      this.suspendTime = 0;
    }
  }

  updateCPUText(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.cpuText = `${input.value} CPU`;
  }
}
