import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { ValidationError } from "webpack";

export function customValidationEmail(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if(value && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value)) {
            return {'invalidEmail': true};
        }
        return null;
    }
}