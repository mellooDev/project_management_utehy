/*
 *  Category
 * Author: AnhNTL
 * Date: 22/11/2024 9:58
 * */

import {Store} from "./store";
import {Category} from "./category";

export class Catalog {
  id: number
  visible:  boolean
  defaultCatalog: boolean
  code: string
  creationDate: string
  store: Store
  category: Category[]
}
