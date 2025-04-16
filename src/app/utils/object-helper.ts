import { KeyValue } from '@angular/common';

export class ObjectHelper {
  static convertKeyValueArrayToObject<K extends string | number | symbol, V>(
    array: KeyValue<K, V>[]
  ): Record<K, V> {
    return array.reduce((acc, item) => {
      if (item.key !== undefined && item.value !== undefined) {
        acc[item.key] = item.value;
      }
      return acc;
    }, {} as Record<K, V>);
  }
  static convertObjectToKeyValueArray<K extends string | number | symbol, V>(
    obj: Record<K, V>
  ): KeyValue<K, V>[] {
    return Object.entries(obj).map(([key, value]) => ({
      key: key as K,
      value: value as V,
    }));
  }
}
