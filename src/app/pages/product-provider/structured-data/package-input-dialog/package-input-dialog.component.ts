import {ChangeDetectorRef, Component, Inject, Input, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {NgForm} from "@angular/forms";
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-package-input-dialog',
  templateUrl: './package-input-dialog.component.html',
  styleUrl: './package-input-dialog.component.scss',
  providers: [MessageService],
})
export class PackageInputDialogComponent {
    packageName: string = '';
    selectPackageType: string = '';
    packageDetail: any = {};
    isEditMode: boolean = false; // Xác định trạng thái thêm mới hoặc cập nhật
    listPay: any[] = [];

    @ViewChild('packageFormChuky') packageFormChuky: NgForm
    @ViewChild('packageForm') packageForm: NgForm

  attributes: { attrName: string; attrDescription: string }[] = [
    { attrName: '', attrDescription: '' },
  ];
  basePrice: string = '';
  optionDuration: any;
  optionMount: string = '';
  packageTypes = [
    { name: 'Thanh toán theo request', value: 'REQUEST' },
    { name: 'Thanh toán theo chu kỳ', value: 'DURATION' },
    { name: 'Tải 1 lượt duy nhất', value: 'PAYPERUSE' },
    { name: 'Thanh toán 1 lần', value: 'FULLPURCHASE' },
  ];
  packageTypesLoc = this.packageTypes.slice();
  // Danh sách các kỳ hạn cho POSTPAID
  postpaidPeriods = [
    { label: 'Hàng ngày', value: 'DAILY' },
    { label: 'Hàng tháng', value: 'MONTHLY' },
    { label: 'Hàng Năm', value: 'YEARLY' },
  ];
  postpaidPeriodsLoc = this.postpaidPeriods.slice();

  goiCuocList: any[] = [
    { requestNumber: '', optionPrice: '' }, // Initial row
  ];
  chuKyList: any[] = [];

  // Danh sách chu kỳ, mỗi chu kỳ có danh sách thuộc tính
  cycles: {
    period: string;
    price: string;
    attributes: { attrName: string; attrDescription: string }[];
  }[] = [];

  constructor(
    private dialogRef: MatDialogRef<PackageInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (this.cycles.length === 0) {
      this.cycles.push({
        period: '',
        price: '',
        attributes: [{ attrName: '', attrDescription: '' }],
      });
    }
    console.log(this.basePrice);
    // Lấy dữ liệu từ LocalStorage nếu tồn tại
    const storedListPay = localStorage.getItem('listPay');
    if (storedListPay) {
      this.listPay = JSON.parse(storedListPay);
    }
    if (this.data?.id) {
      // Nếu có id, đặt trạng thái thành chế độ cập nhật và tải dữ liệu chi tiết
      this.isEditMode = true;
      this.loadPackageDetail(this.data);
    } else {
      let listPayWithNoDuration = this.listPay.filter(
        (lp) => lp.planType !== 'DURATION'
      );
      this.packageTypesLoc = this.packageTypes.filter(
        (pt) => !listPayWithNoDuration.some((lp) => lp.planType === pt.value)
      );
    }

    if (this.listPay.length > 0) {
      // let optionDuration = this.listPay[0].optionDuration;
      // this.postpaidPeriodsLoc = this.postpaidPeriods.filter(period => period.value !== optionDuration);
      let optionDurations = this.listPay.map((lp) => lp.optionDuration);
      this.postpaidPeriodsLoc = this.postpaidPeriods.filter(
        (pt) => !optionDurations.includes(pt.value)
      );

      if (this.postpaidPeriodsLoc.length === 0) {
        // If postpaidPeriodsLoc is empty, remove 'DURATION' from packageTypesLoc
        this.packageTypesLoc = this.packageTypesLoc.filter(
          (pt) => pt.value !== 'DURATION'
        );
      }
    }
    // Ensure at least one default cycle is added with 'MONTHLY' as the period
    if (this.cycles.length === 0) {
      this.cycles.push({
        period: 'MONTHLY', // Default value
        price: '',
        attributes: [{ attrName: '', attrDescription: '' }],
      });
    }
    this.cdr.detectChanges(); // Buộc Angular render lại
  } // Lấy danh sách các chu kỳ chưa được chọn
  // Store the selected periods to disable them in the dropdown
  selectedPeriods: string[] = [];

  addCycle(): void {
    if (this.cycles.length < this.postpaidPeriods.length) {
      this.cycles.push({
        period: '',
        price: '',
        attributes: [{ attrName: '', attrDescription: '' }],
      });

      // Gán lại mảng để Angular nhận diện thay đổi
      this.cycles = [...this.cycles];
    }
  }

  // Get available periods excluding the selected ones
  getAvailablePeriods(): { label: string; value: string }[] {
    let optionDurations = this.cycles.map((lp) => lp.period);
    // this.postpaidPeriodsLoc = this.postpaidPeriods.filter(pt => !optionDurations.includes(pt.value));

    return this.postpaidPeriods.filter(
      (period) => !optionDurations.includes(period.value)
    );
  }

  // Handle cycle selection and disable the selected period
  onCycleSelected(index: number): void {
    const cycle = this.cycles[index];

    // If a cycle is selected, add the period to the selectedPeriods array
    if (cycle.period && !this.selectedPeriods.includes(cycle.period)) {
      this.selectedPeriods.push(cycle.period);
    }
    //let optionDurations = this.cycles.map(lp => lp.period);
    //  this.postpaidPeriodsLoc = this.postpaidPeriods.filter(pt => !optionDurations.includes(pt.value));

    // If it's the last cycle and it has a period, add a new cycle
    // if (cycle.period && index === this.cycles.length - 1) {
    //   this.cycles.push({ period: '', price: '', attributes: [] });
    // }
  }

  // Remove a cycle and re-enable the corresponding period
  removeCycle(index: number): void {
    const cycle = this.cycles[index];
    this.cycles.splice(index, 1);

    // If the cycle had a period, remove it from the selectedPeriods array
    if (cycle.period && this.selectedPeriods.includes(cycle.period)) {
      const periodIndex = this.selectedPeriods.indexOf(cycle.period);
      if (periodIndex !== -1) {
        this.selectedPeriods.splice(periodIndex, 1);
      }
    }

    // If there are no cycles left, add a default cycle with 'MONTHLY'
    if (this.cycles.length === 0) {
      this.cycles.push({
        period: 'MONTHLY',
        price: '',
        attributes: [],
      });
    }
  }

  // Thêm thuộc tính vào chu kỳ
  addAttribute(cycleIndex: number): void {
    this.cycles[cycleIndex].attributes.push({
      attrName: '',
      attrDescription: '',
    });
    console.log(this.cycles);
  }

  // Xóa thuộc tính khỏi chu kỳ
  removeAttribute(cycleIndex: number, attrIndex: number): void {
    this.cycles[cycleIndex].attributes.splice(attrIndex, 1);
  }

  addRow() {
    // Only add a new row if all current rows have valid data
    if (this.areAllRowsValid()) {
      this.goiCuocList.push({ requestNumber: '', optionPrice: '' });
    }
  }

  removeRow(index: number) {
    if (this.goiCuocList.length > 1) {
      this.goiCuocList.splice(index, 1);
    }
  }

  areAllRowsValid(): boolean {
    return this.goiCuocList.every(
      (item) => item.requestNumber > 0 && item.optionPrice > 10000
    );
  }

  addAttributeContent() {
    this.attributes.push({ attrName: '', attrDescription: '' });
  }

  loadPackageDetail(data: any) {
    this.packageDetail = data;
    this.optionMount = data.optionMount;
    this.packageName = data.planName;
    this.selectPackageType = data.planType || ''; // Đảm bảo giá trị mặc định là ''
    this.basePrice = data.basePrice;
    this.optionDuration = data.optionDuration;
    this.attributes = data.planAttributes;

    if (this.selectPackageType == 'REQUEST') {
      this.goiCuocList = data.planOptions.map(
        (option: { requestNumber: any; optionPrice: any }) => ({
          requestNumber: option.requestNumber,
          optionPrice: option.optionPrice,
        })
      );
    }
    if (this.selectPackageType == 'DURATION') {
      this.cycles = data.planOptions.map(
        (option: {
          optionDuration: any;
          optionPrice: any;
          planAttributes: any;
        }) => ({
          price: option.optionPrice,
          period: option.optionDuration,
          attributes: option.planAttributes,
        })
      );
    }

    this.cdr.detectChanges(); // Buộc Angular render lại
  }

  mapPackageType(type: number): string {
    switch (type) {
      case 1:
        return 'oneTimePayment';
      case 2:
        return 'subscriptionPayment';
      case 3:
        return 'payAsYouGoPayment';
      default:
        return '';
    }
  }

  removeAttributeContent(index: number) {
    this.attributes.splice(index, 1);
  }

  onCloseModal() {
    this.dialogRef.close();
  }
  paymentDataLocalRef: any[] = [];

  showNotification(
    severity: string,
    summary: string,
    detail: string,
    lifetime: number
  ) {
    this.messageService.add({
      severity: severity,
      summary: summary,
      detail: detail,
      life: lifetime,
    });
  }

  logBasePrice() {
    console.log('Giá trị basePrice khi blur:', this.basePrice);
  }

  onSaveModal() {
    // console.log(this.packageFormChuky, this.checkFormValid());
    const dataToSave = {
      id: this.data?.id || new Date().getTime(), // Nếu có id thì giữ nguyên, nếu không thì để null (thêm mới)
      planName: this.packageName,
      productId: 0,
      planType: this.selectPackageType,
      basePrice: this.basePrice || 0,
      status: 'string',
      duration: 'string',
      planOptions: [
        {
          optionName: 'string',
          optionPrice: 0,
          optionDuration: 'DAILY',
          description: 'string',
          requestNumber: 0,
          planAttributes: [],
          planAdditionServices: [],
        },
      ],
    };
    if (
      this.selectPackageType == 'FULLPURCHASE' ||
      this.selectPackageType == 'PAYPERUSE'
    ) {
      const dataAPI = {
        id: this.data?.id || new Date().getTime(), // Nếu có id thì giữ nguyên, nếu không thì để null (thêm mới)
        planName: this.packageName,
        productId: 0,
        planType: this.selectPackageType,
        basePrice: this.basePrice || 0,
        status: 'string',
        duration: 'string',
        planOptions: [],
      };
      console.log('baseprice: ', this.basePrice);
      this.paymentDataLocalRef.push(dataAPI);
      this.showNotification(
        'success',
        'Thông báo',
        'Thêm gói thanh toán thành công',
        3000
      );
      setTimeout(() => {
        this.dialogRef.close(this.paymentDataLocalRef);
      }, 3000);
    } else if (this.selectPackageType == 'REQUEST') {
      var durationPlansInput = {
        id: this.data?.id || new Date().getTime(), // Nếu có id thì giữ nguyên, nếu không thì để null (thêm mới)
        planName: this.packageName,
        productId: 0,
        planType: this.selectPackageType,
        basePrice: this.basePrice || 0,
        status: 'string',
        duration: 'string',
        planOptions: this.goiCuocList
          .filter(
            ({ requestNumber, optionPrice }) =>
              requestNumber != null &&
              optionPrice != null &&
              !isNaN(optionPrice) &&
              optionPrice > 0 &&
              !isNaN(requestNumber) &&
              requestNumber > 0
          )
          .map(
            ({
              planName,
              optionPrice,
              optionDuration,
              description,
              planAttributes,
              requestNumber,
            }) => ({
              optionName: planName,
              optionPrice,
              requestNumber,
              optionDuration,
              description,
              planAttributes: [],
              planAdditionServices: [],
            })
          ),
        };
        this.paymentDataLocalRef.push(durationPlansInput)
      }
        console.log("this.paymentDataLocalRef   " , this.paymentDataLocalRef)
      // Trả dữ liệu về component chính
      this.dialogRef.close(this.paymentDataLocalRef);
    }


    checkValidData(): boolean {
      if (this.packageName.trim() === '') {
        return false;
      }
      if (this.selectPackageType.trim() === '') {
        return false;
      }

      if (this.selectPackageType === 'REQUEST' && !this.packageForm.valid) {
        return false;
      }

      if (this.selectPackageType === 'DURATION' && !this.packageFormChuky.valid) {
        return false;
      }

      return true;
    }

  }
