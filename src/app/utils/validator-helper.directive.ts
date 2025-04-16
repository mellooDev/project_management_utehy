import {AbstractControl, FormControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function fileExtensionValidator(validExt: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    let forbidden = true;
    if (control.value) {
      const fileExt = control.value.split('.').pop();
      validExt.split(',').forEach(ext => {
        if (ext.trim() == fileExt) {
          forbidden = false;
        }
      });
    } else {
      return null;
    }
    return forbidden ? {'inValidExt': true} : null;
  };
}

export function fileSizeValidator(maxSizeMB: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (file && file.size > maxSizeMB * 1024 * 1024) {
      return {fileSize: true};
    }
    return null;
  };
}

export const endDateAfterStartDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;
  return endDate && startDate && endDate <= startDate ? { endDateBeforeStartDate: true } : null;
};
