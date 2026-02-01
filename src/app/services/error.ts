import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SwalService } from './swal';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private swal: SwalService) { }

  errorHandler(err: HttpErrorResponse) {
    console.log(err);
    let message = 'Hata oluştu.';

    if (err.status === 0) {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      message = isOnline
        ? 'API\'ye bağlanılamadı. (Sertifika/Proxy/CORS veya tarayıcı offline modu olabilir)'
        : 'İnternet bağlantısı yok / tarayıcı offline modda.';
    } else if (err.status === 404) {
      message = 'API endpoint bulunamadı (404).';
    } else if (err.status === 500) {
      const serverMessages = err?.error?.errorMessages ?? err?.error?.ErrorMessages;
      if (Array.isArray(serverMessages) && serverMessages.length > 0) {
        message = serverMessages.join('\n');
      } else {
        message = 'Sunucu hatası (500).';
      }
    } else if (err.status === 403) {
      message = 'Yetkisiz işlem (403).';
    }
    this.swal.callToast(message, "error");
  }
}
