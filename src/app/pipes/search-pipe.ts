import { Pipe, PipeTransform } from '@angular/core';
import { DeviceModel } from '../models/device.model';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {

  transform(value: DeviceModel[], search: string): DeviceModel[] {
    if (!value || !search) {
      return value;
    }
    const lowerSearch = search.toLowerCase();
    return value.filter(device => {
      return Object.values(device).some(val =>
        val && typeof val === 'string' && val.toLowerCase().includes(lowerSearch)
      );
    });
  }
}
