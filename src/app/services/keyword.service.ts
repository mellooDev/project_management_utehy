import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class KeywordService {
  private keywordSource = new BehaviorSubject<string>('');  // Default là chuỗi rỗng
  currentKeyword = this.keywordSource.asObservable();

  constructor() {}

  changeKeyword(keyword: string) {
    this.keywordSource.next(keyword);  // Cập nhật giá trị keyword
  }
}
