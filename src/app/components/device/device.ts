import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { DeviceModel } from '../../models/device.model';
import { GenericService } from '../../services/generic';
import { SignalRService } from '../../services/signalr';
import { MonthNamePipe } from '../../pipes/month-name';
import { AddDevice } from './add-device/add-device';
import { UpdateDevice } from './update-device/update-device';

@Component({
  selector: 'app-device',
  standalone: true,
  imports: [MonthNamePipe, CommonModule, FormsModule, AddDevice, UpdateDevice],
  templateUrl: './device.html',
  styleUrl: './device.css',
})
export class Device implements OnInit, OnDestroy {
  allDevices: DeviceModel[] = [];
  filteredDevices: DeviceModel[] = [];
  search: string = '';

  @ViewChild(AddDevice) addDeviceComponent!: AddDevice;
  @ViewChild(UpdateDevice) updateDeviceComponent!: UpdateDevice;

  constructor(
    private genericService: GenericService,
    private cdr: ChangeDetectorRef,
    private signalRService: SignalRService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.getDevices();
    this.setupSignalRListeners();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  applyFilter() {
    const q = (this.search ?? '').trim().toLocaleLowerCase('tr-TR');

    if (!q) {
      this.filteredDevices = [...this.allDevices];
      this.cdr.markForCheck();
      return;
    }

    this.filteredDevices = this.allDevices.filter((d) => {
      const haystack = [
        d.id,
        d.name,
        d.serialNumber,
        d.lastMaintenanceDate,
        d.isActive ? 'aktif' : 'pasif',
        d.isDeleted ? 'silindi' : 'silinmedi',
      ]
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
        .map((v) => v.toLocaleLowerCase('tr-TR'))
        .join(' ');

      return haystack.includes(q);
    });

    this.cdr.markForCheck();
  }

  setupSignalRListeners() {
    // Başka bir user tarafından cihaz silindiğinde
    this.signalRService.deviceDeleted$.subscribe((deviceId: string) => {
      const device = this.allDevices.find((d) => d.id === deviceId);
      if (!device) return;

      this.allDevices = this.allDevices.filter((d) => d.id !== deviceId);
      this.applyFilter();
      Swal.fire('Bilgi', `${device.name} cihazı başka bir kullanıcı tarafından silindi.`, 'info');
    });

    this.signalRService.deviceAdded$.subscribe((device: DeviceModel) => {
      this.allDevices.push(device);
      this.applyFilter();
      Swal.fire('Bilgi', `${device.name} cihazı başka bir kullanıcı tarafından eklendi.`, 'info');
    });

    this.signalRService.deviceUpdated$.subscribe((updatedDevice: DeviceModel) => {
      const index = this.allDevices.findIndex((d) => d.id === updatedDevice.id);
      if (index === -1) return;

      this.allDevices[index] = updatedDevice;
      this.applyFilter();
      Swal.fire('Bilgi', `${updatedDevice.name} cihazı başka bir kullanıcı tarafından güncellendi.`, 'info');
    });
  }

  getDevices() {
    this.genericService.post<DeviceModel[]>('/api/Devices/GetAll', {}, (res) => {
      if (res.isSuccessful !== false) {
        this.allDevices = (res.data as any) ?? [];
        this.applyFilter();
      }
    });
  }

  addDevice() {
    this.addDeviceComponent.openModal();
  }

  openUpdateModal(device: DeviceModel) {
    this.updateDeviceComponent.openModal(device);
  }

  onDeviceAdded(device: DeviceModel) {
    console.log('onDeviceAdded çağırıldı:', device);
    this.getDevices();
  }

  onDeviceUpdated(updatedDevice: DeviceModel) {
    console.log('onDeviceUpdated çağırıldı:', updatedDevice);
    this.getDevices();
  }

  deleteDevice(id: string) {
    const device = this.allDevices.find((d) => d.id === id);

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
      if (!result.isConfirmed) return;

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        Swal.fire('Hata!', 'İnternet bağlantısı yok / tarayıcı offline modda.', 'error');
        return;
      }

      this.genericService.post('/api/Devices/Delete', { id }, (res) => {
        console.log('Delete response:', res);
        if (res.isSuccessful !== false) {
          Swal.fire('Başarılı!', 'Cihaz silindi.', 'success');
          this.getDevices();
         
        
        } else {
          Swal.fire('Hata!', 'Cihaz silinirken hata oluştu.', 'error');
        }
      }, (err) => {
        if (err.status >= 200 && err.status < 300) {
          console.log('Success status (' + err.status + '), error callback gereksiz');
          return;
        }

        console.error('Silme hatası:', err);
        if (err.status === 0) {
          const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
          Swal.fire(
            'Hata!',
            isOnline
              ? 'API\'ye bağlanılamadı. (Sertifika/Proxy/CORS veya tarayıcı offline modu olabilir)'
              : 'İnternet bağlantısı yok / tarayıcı offline modda.',
            'error'
          );
          return;
        }

        Swal.fire('Hata!', 'İşlem başarısız oldu.', 'error');
      });
    });
  }
}
