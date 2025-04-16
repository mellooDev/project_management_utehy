/*
 * Store
 * Author: AnhNTL
 * Date: 22/11/2024 9:50
 * */
export class Store {
  id: number
  code: string
  name: string
  defaultLanguage: string
  currency: string
  inBusinessSince: string
  email: string
  phone: string
  template: string
  useCache: boolean
  currencyFormatNational: boolean
  retailer: boolean
  dimension: string
  weight: string
  currentUserLanguage: string
  address: Address
  logo: string
  parent: string
  supportedLanguages: SupportedLanguages[]
  readableAudit: null
}


export class Address {
  stateProvince: string
  country: string
  address: string
  postalCode: string
  city: string
  active: boolean
}

export class SupportedLanguages {
  code: string
  id: number
}
