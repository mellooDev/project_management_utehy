import { Injectable } from "@angular/core";
import { NgbDateParserFormatter, NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

@Injectable()
export class CustomDateFormatter extends NgbDateParserFormatter {
    override parse(value: string): NgbDateStruct | null {
        if(!value) return null;
        const parts = value.trim().split('-');
        if(parts.length===3) {
            return {
                day: parseInt(parts[0], 10),
                month: parseInt(parts[1], 10),
                year: parseInt(parts[2], 10),
            };
        }
        return null;
    }

    override format(date: NgbDateStruct | null):string {
        if (!date) return '';
        return `${this.pad(date.day)}-${this.pad(date.month)}-${date.year}`;
      }
    
    private pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
    }

}