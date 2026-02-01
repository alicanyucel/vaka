import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { GenericService } from '../../../services/generic';
import { DeviceModel } from '../../../models/device.model';
import { SignalRService } from '../../../services/signalr';

@Component({
  selector: 'app-update-device',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './update-device.html',
  styleUrl: './update-device.css',
})
export class UpdateDevice {
  @Output() deviceUpdated = new EventEmitter<DeviceModel>();
  @Output() closeModal = new EventEmitter<void>();

  showModal = false;
  updateDeviceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private signalRService: SignalRService,
    private cdr: ChangeDetectorRef
  ) {
    this.updateDeviceForm = this.fb.group({
      id: [{ value: '', disabled: true }, Validators.required],
      name: ['', Validators.required],
      serialNumber: ['', Validators.required],
      isActive: [false],
      lastMaintenanceDate: [null as NgbDateStruct | null],
      isDeleted: [false],
    });
  }

  openModal(device: DeviceModel) {
    this.showModal = true;

    const dateStruct = this.toDateStruct(device.lastMaintenanceDate);

    this.updateDeviceForm.reset({
      id: device.id,
      name: device.name,
      serialNumber: device.serialNumber,
      isActive: device.isActive,
      lastMaintenanceDate: dateStruct,
      isDeleted: device.isDeleted,
    });
  }

  closeUpdateModal() {
    this.showModal = false;
    this.updateDeviceForm.reset();
    this.closeModal.emit();
  }

  submitUpdateDevice() {
    if (this.updateDeviceForm.invalid) {
      Swal.fire('Hata!', 'Lütfen tüm alanları doldurun.', 'error');
      return;
    }

    const raw = this.updateDeviceForm.getRawValue();
    const maintenanceDate = this.toIsoDate(raw.lastMaintenanceDate);

    const payload: DeviceModel = {
      id: raw.id,
      name: raw.name,
      serialNumber: raw.serialNumber,
      isActive: raw.isActive === true,
      lastMaintenanceDate: maintenanceDate,
      isDeleted: raw.isDeleted === true,
    };

    this.genericService.post('/api/Devices/Update', payload, (res) => {
      console.log('Update response:', res);
      if (res.isSuccessful !== false) {
        Swal.fire('Başarılı!', 'Cihaz güncellendi.', 'success');
        const updated = (res.data as any) || payload;
        this.deviceUpdated.emit(updated);
        this.showModal = false;
        this.updateDeviceForm.reset();
      } else {
        Swal.fire('Hata!', 'Cihaz güncellenirken hata oluştu.', 'error');
      }
    }, (err) => {
      if (err.status >= 200 && err.status < 300) {
        console.log('Success status (' + err.status + '), error callback gereksiz');
        return;
      }

      console.error('Güncelleme hatası:', err);
      const errorMsg = err.error?.errors ? JSON.stringify(err.error.errors) : 'Bilinmeyen hata';
      Swal.fire('Hata!', `API Hatası: ${errorMsg}`, 'error');
    });
  }

  private toDateStruct(value?: string): NgbDateStruct | null {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  private toIsoDate(value: NgbDateStruct | string | null | undefined): string {
    if (!value) return new Date().toISOString();

    if (typeof value === 'string') {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    }

    const d = new Date(value.year, value.month - 1, value.day);
    return d.toISOString();
  }
}
