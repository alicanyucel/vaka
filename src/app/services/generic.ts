import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResultModel } from '../models/result.model';
import { ErrorService } from './error';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GenericService {
  constructor(
    private http: HttpClient,private error:ErrorService) { }
  post<T>(apiUrl: string, body: any, callBack: (res: ResultModel<T>) => void, errorCallback?: (err: HttpErrorResponse) => void) {
    const url = `${environment.baseApi}${apiUrl}`;
    console.log('POST request to:', url);
    this.http.post<any>(url, body).subscribe({
      next: (raw => {
        const res = this.normalizeResult<T>(raw);
        console.log('Response received:', res);
        callBack(res);
      }),
      error: (err: HttpErrorResponse) => {
        console.error('Error:', err);
        this.error.errorHandler(err);
        if (errorCallback !== undefined) {
          errorCallback(err);
        }
      }
    });
  }

  private normalizeResult<T>(raw: any): ResultModel<T> {
    const normalized: ResultModel<T> = {
      data: raw?.data ?? raw?.Data ?? null,
      errorMessages: raw?.errorMessages ?? raw?.ErrorMessages ?? [],
      isSuccessful: (raw?.isSuccessful ?? raw?.IsSuccessful) as any,
      statusCode: raw?.statusCode ?? raw?.StatusCode ?? 200,
    } as ResultModel<T>;

    if (normalized.isSuccessful === undefined || normalized.isSuccessful === null) {
      normalized.isSuccessful = true;
    }

    return normalized;
  }
}
