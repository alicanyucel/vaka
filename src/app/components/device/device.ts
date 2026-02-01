import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DeviceModel } from '../../models/device.model';
import { GenericService } from '../../services/generic';
import { SearchPipe } from '../../pipes/search-pipe';
import { MonthNamePipe } from '../../pipes/month-name';

@Component({
  selector: 'app-device',
  standalone: true,
  imports: [SearchPipe, MonthNamePipe, CommonModule, FormsModule],
  templateUrl: './device.html',
  styleUrl: './device.css',
})
export class Device implements OnInit {
  devices: DeviceModel[] = [];
  search: string = '';

  constructor(private genericService: GenericService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getDevices();
  }

  getDevices() {
    this.genericService.post<DeviceModel[]>('/api/Devices/GetAll', {}, (res) => {
      console.log('Response:', res);
      console.log('isSuccessful:', res.isSuccessful);
      console.log('data:', res.data);
      if (res.isSuccessful && res.data) {
        this.devices = res.data;
        this.cdr.markForCheck();
        console.log('Devices assigned:', this.devices);
      }
    });
  }

  updateDevice(device: DeviceModel) {
    Swal.fire({
      title: 'Cihazı Güncelle',
      text: `${device.name} cihazını güncellemek istediğinize emin misiniz?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, Güncelle',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Güncelle:', device);
        Swal.fire('Başarılı!', 'Cihaz güncellendi.', 'success');
      }
    });
  }

  deleteDevice(id: string) {
    const device = this.devices.find(d => d.id === id);
    Swal.fire({
      title: 'Cihazı Sil',
      text: `${device?.name} cihazını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Silme isteği gönderiliyor, ID:', id);
        this.genericService.post('/api/Devices/Delete', id, (res) => {
          console.log('Delete response:', res);
          if (res.isSuccessful) {
            Swal.fire('Silindi!', 'Cihaz başarıyla silindi.', 'success');
            // Cihazı array'den kaldır
            this.devices = this.devices.filter(d => d.id !== id);
            this.cdr.markForCheck();
          } else {
            Swal.fire('Hata!', 'Cihaz silinirken hata oluştu.', 'error');
          }
        }, (err) => {
          console.error('Delete error:', err);
          Swal.fire('Hata!', 'İşlem başarısız oldu.', 'error');
        });
      }
    });
  }
}
