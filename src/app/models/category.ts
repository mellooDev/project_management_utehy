/*
 *  Category
 * Author: AnhNTL
 * Date: 22/11/2024 9:50
 * */

export class Category {
  categoryId: number
  uuid: string
  name: string
  status: string
  includeInNav: number
  showProducts: number
  description: any
  urlKey: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  image: CategoryImage
  url: string
  availableAttributes: FilterAttribute[]
}

export class CategoryImage {
  alt: string
  url: string
}

export class FilterAttribute {
  attributeName: string
  attributeCode: string
  attributeId: number
  options: FilterOption[]
}

export class FilterOption {
  optionId: number
  optionText: string
}
