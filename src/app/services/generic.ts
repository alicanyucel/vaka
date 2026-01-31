import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResultModel } from '../models/result.model';
import { ErrorService } from './error';
import { environment } from '../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class GenericService {
  constructor(
    private http: HttpClient,private error:ErrorService) { }
  post<T>(apiUrl: string, body: any, callBack: (res: ResultModel<T>) => void, errorCallback?: (err: HttpErrorResponse) => void) {
    this.http.post<ResultModel<T>>(`${environment.baseApi}${apiUrl}`, body).subscribe({
      next: (res => {
        callBack(res);
      }),
      error: (err: HttpErrorResponse) => {
        this.error.errorHandler(err);
        if (errorCallback !== undefined) {
          errorCallback(err);
        }
      }
    });
  }
}
