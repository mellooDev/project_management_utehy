import {Directive, ElementRef, HostListener, OnDestroy, OnInit, Optional} from "@angular/core";
import {Subject, takeUntil} from "rxjs";
import {FormControlName, NgControl} from "@angular/forms";
import {distinctUntilChanged} from "rxjs/operators";

@Directive({
  standalone: true,
  selector: '[appTrim]'
})
export class TrimDirective {

  constructor(private el: ElementRef,  @Optional() private ngControl: NgControl) { }

  @HostListener('blur') onBlur() {
    // @ts-ignore
    this.ngControl.control.setValue(this.el.nativeElement.value.trim());
  }

}
