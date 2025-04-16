import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export const AVRO_DATA_TYPE: string[] = [
  'string',
  'int',
  'float',
  'boolean',
  'datetime',
  'timestamp-millis',
  'timestamp-micros',
  'object',
];

export interface aVROSchemaFeild {
  name: string;
  type: string;
  doc?: {
    primary?: boolean;
    autoIncrement?: boolean;
  };
}

export class AvroHelper {
  static detectAvroType(columnValues: any[]): string {
    for (const value of columnValues) {
      if (value === undefined || value === null || value === '') {
        continue; // Bỏ qua giá trị undefined, null hoặc rỗng
      }

      // Kiểm tra kiểu string (ưu tiên nếu có bất kỳ giá trị nào là chuỗi)
      if (typeof value === 'string' && !/^\d+(\.\d+)?$/.test(value)) {
        return 'string';
      }

      // Kiểm tra kiểu boolean
      if (/^(true|false)$/i.test(value)) {
        return 'boolean';
      }

      // Kiểm tra kiểu số thực (float)
      if (/^-?\d*\.\d+$/.test(value)) {
        return 'float';
      }

      // Kiểm tra kiểu số nguyên (int)
      if (/^-?\d+$/.test(value)) {
        continue; // Có thể là số nguyên, không trả về ở đây
      }

      // Kiểm tra kiểu datetime
      if (/^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}(:\d{2})?$/.test(value)) {
        return 'datetime';
      }
    }

    // Nếu tất cả các giá trị đều là số nguyên
    if (columnValues.every((value) => /^-?\d+$/.test(value))) {
      return 'int';
    }

    // Mặc định là string nếu không khớp bất kỳ loại nào ở trên
    return 'string';
  }

  static generateAvroSchema(formArray: FormArray, recordName: string): any {
    const fields: any[] = [];
    const fieldNamesSet: Set<string> = new Set(); // Set để tránh trùng lặp fieldName
    const required: Set<string> = new Set(); // Set để tránh trùng lặp trong required
    const mapping: { fieldName: string; columnName: string }[] = [];
    const mappedFieldNamesSet: Set<string> = new Set(); // Set để tránh trùng lặp trong mapping fieldName

    formArray.controls.forEach((control: AbstractControl) => {
      const group = control as FormGroup;
      const fieldName = group.get('fieldName')?.value;
      const fieldType = group.get('fieldType')?.value;
      const columnName = group.get('columnName')?.value;
      const description = group.get('description')?.value || '';
      const primaryKey = group.get('primaryKey')?.value;
      const requiredField = group.get('required')?.value;

      // Kiểm tra tránh trùng lặp fieldName trong fields
      if (fieldNamesSet.has(fieldName)) {
        console.warn(`Duplicate fieldName detected: ${fieldName}. Skipping.`);
        return;
      }

      fieldNamesSet.add(fieldName);

      // Xây dựng object cho từng field
      const fieldObj: any = {
        name: fieldName,
        type: fieldType,
      };

      if (description || primaryKey) {
        fieldObj.doc = {};
        if (description) fieldObj.doc.description = description;
        if (primaryKey) fieldObj.doc.primary = true;
      }

      fields.push(fieldObj);

      // Nếu requiredField hoặc primaryKey là true, thêm fieldName vào mảng required
      if (requiredField || primaryKey) {
        required.add(fieldName);
      }

      // Kiểm tra tránh trùng lặp fieldName trong mapping
      if (mappedFieldNamesSet.has(fieldName)) {
        console.warn(
          `Duplicate mapping fieldName detected: ${fieldName}. Skipping.`
        );
        return;
      }

      mappedFieldNamesSet.add(fieldName);

      mapping.push({
        fieldName,
        columnName,
      });
    });

    // Chuyển Set `required` thành mảng
    const requiredArray = Array.from(required);

    return {
      type: 'record',
      name: recordName,
      fields,
      required: requiredArray,
      mapping,
    };
  }
}
