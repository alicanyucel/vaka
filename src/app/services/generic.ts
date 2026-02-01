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
    this.http.post<ResultModel<T>>(url, body).subscribe({
      next: (res => {
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
}
