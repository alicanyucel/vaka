import { Pipe, PipeTransform } from '@angular/core';
import { DeviceModel } from '../models/device.model';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {

  transform(value: DeviceModel[], search: string): DeviceModel[] {
    const query = (search ?? '').trim();
    if (!value || !query) {
      return value;
    }

    const lowerQuery = query.toLocaleLowerCase('tr-TR');

    return value.filter((device) => {
      const searchableValues: Array<string> = [
        device.id,
        device.name,
        device.serialNumber,
        device.lastMaintenanceDate,
        device.isActive ? 'aktif' : 'pasif',
        device.isDeleted ? 'silindi' : 'silinmedi',
      ].filter((v): v is string => typeof v === 'string' && v.length > 0);

      return searchableValues.some((v) => v.toLocaleLowerCase('tr-TR').includes(lowerQuery));
    });
  }
}
