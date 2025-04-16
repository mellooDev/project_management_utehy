import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export class FormHelper {
  /**
   * Validator to ensure at least one of the specified fields has a value.
   * @param field1 The name of the first field.
   * @param field2 The name of the second field.
   * @returns A ValidatorFn that validates the FormGroup.
   */
  static atLeastOneRequired(field1: string, field2: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      if (!(formGroup instanceof FormGroup)) {
        throw new Error(
          'FormHelper.atLeastOneRequired should be used with a FormGroup'
        );
      }

      const value1 = formGroup.get(field1)?.value;
      const value2 = formGroup.get(field2)?.value;

      if (!value1 && !value2) {
        return { atLeastOneRequired: { fields: [field1, field2] } };
      }
      return null;
    };
  }
  static dbNameValidator(control: AbstractControl): ValidationErrors | null {
    const columnNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/; // Định dạng tên cột
    const value = control.value;

    if (value && !columnNamePattern.test(value)) {
      return { invalidDbName: true }; // Báo lỗi nếu tên cột không hợp lệ
    }
    return null;
  }
  static markAllAsTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouched(control); // Đệ quy nếu là FormGroup hoặc FormArray
      } else {
        control.markAsTouched(); // Đánh dấu FormControl là touched
      }
    });
  }
  static jsonValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null; // Cho phép giá trị trống (không kiểm tra)

      try {
        JSON.parse(value); // Kiểm tra JSON hợp lệ
        return null; // JSON hợp lệ
      } catch {
        return { invalidJson: true }; // JSON không hợp lệ
      }
    };
  }
}
