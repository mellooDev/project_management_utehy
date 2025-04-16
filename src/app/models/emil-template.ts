import { BaseDTO, PagingRequest } from './base';

export class TemplateDTO extends BaseDTO<number> {
  code?: string; // Mã template (Kiểu template)
  name?: string; // Tên của template
  templateContent?: string; // Nội dung template
  title?: string; // Thông tin tiêu đề template
  description?: string;
}

export class TemplateReq {
  code!: string; // Mã template
  name!: string; // Tên template
  templateContent!: string; // Nội dung template
  title!: string; // Thông tin tiêu đề template
  description?: string; // Mô tả template
}

export class TemplateListReq extends PagingRequest {}
