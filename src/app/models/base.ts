/*
 *  Base Pagination
 * Author: AnhNTL
 * Date: 22/11/2024 9:58
 * */

export class RequestBody {
  query?: string;
  variables?: any;
  operationName?: any;
}

export class PagingRequest {
  currentPage?: number;
  perPage?: number;
  filter?: string;
  sortBy?: string | null;
  sortDesc: boolean = true;
}

export class BaseResponse<T> {
  code: string;
  desc: string;
  data?: T;
}


export class PagingResponse<T> extends BaseResponse<T> {
  recordsTotal: number;
  totalPages: number;
  sizeOfPage: number;
  recordsFiltered: number;
}

export class BaseDTO<T> {
  id?: T;
  createdBy?: string;
  createdDate: Date;
  lastModifiedBy?: string;
  lastModifiedDate: Date;
}

