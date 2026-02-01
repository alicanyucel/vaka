import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { GenericService } from '../../../services/generic';
import { SignalRService } from '../../../services/signalr';

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './add-device.html',
  styleUrl: './add-device.css',
})
export class AddDevice implements OnInit {
  @Output() deviceAdded = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  showModal: boolean = false;
  addDeviceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private signalRService: SignalRService,
    private cdr: ChangeDetectorRef
  ) {
    this.addDeviceForm = this.fb.group({
      name: ['', Validators.required],
      serialNumber: ['', Validators.required],
      isActive: [false],
      lastMaintenanceDate: [''],
      isDeleted: [false]
    });
  }

  ngOnInit() {}

  openModal() {
    this.showModal = true;
    this.addDeviceForm.reset();
  }

  closeAddModal() {
    this.showModal = false;
    this.addDeviceForm.reset();
    this.closeModal.emit();
  }

  submitAddDevice() {
    if (this.addDeviceForm.invalid) {
      Swal.fire('Hata!', 'Lütfen tüm alanları doldurun.', 'error');
      return;
    }

    const maintenanceDateValue = this.addDeviceForm.get('lastMaintenanceDate')?.value;
    console.log('Datepicker değeri:', maintenanceDateValue);

    let maintenanceDate = new Date().toISOString();
    if (maintenanceDateValue) {
      if (typeof maintenanceDateValue === 'string') {
        maintenanceDate = new Date(maintenanceDateValue).toISOString();
      } else if (maintenanceDateValue.year) {
        const date = new Date(maintenanceDateValue.year, maintenanceDateValue.month - 1, maintenanceDateValue.day);
        maintenanceDate = date.toISOString();
      }
    }

    const newDevice = {
      name: this.addDeviceForm.get('name')?.value,
      serialNumber: this.addDeviceForm.get('serialNumber')?.value,
      isActive: this.addDeviceForm.get('isActive')?.value,
      lastMaintenanceDate: maintenanceDate,
      isDeleted: this.addDeviceForm.get('isDeleted')?.value === true
    };

    console.log('Gönderilen cihaz:', newDevice);

    this.genericService.post('/api/Devices/Create', newDevice, (res) => {
      console.log('Success callback - res:', res);
      console.log('res.isSuccessful:', res.isSuccessful);
      console.log('res.data:', res.data);

      console.log('Create response:', res);
      if (res.isSuccessful !== false) {
        Swal.fire('Başarılı!', 'Cihaz başarıyla eklendi.', 'success');
        const device = res.data || newDevice;
        this.deviceAdded.emit(device);
        this.showModal = false;
        this.addDeviceForm.reset();

      } else {
        console.log('İsSuccessful false, hata mesajı:', res);
        Swal.fire('Hata!', 'Cihaz eklenirken hata oluştu.', 'error');
      }
    }, (err) => {

      if (err.status >= 200 && err.status < 300) {
        console.log('Success status (' + err.status + '), error callback gereksiz');
        return;
      }

      console.error('Gerçek hata:', err);
      const errorMsg = err.error?.errors ? JSON.stringify(err.error.errors) : 'Bilinmeyen hata';
      Swal.fire('Hata!', `API Hatası: ${errorMsg}`, 'error');
    });
  }
}
