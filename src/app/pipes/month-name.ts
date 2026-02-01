import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monthName',
  standalone: true
})
export class MonthNamePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const monthNames = [
      'Ocak',
      'Şubat',
      'Mart',
      'Nisan',
      'Mayıs',
      'Haziran',
      'Temmuz',
      'Ağustos',
      'Eylül',
      'Ekim',
      'Kasım',
      'Aralık'
    ];

    return `${day} ${monthNames[monthIndex]} ${year}`;
  }
}
