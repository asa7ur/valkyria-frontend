import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ResponseDTO} from '../models/response-dto';
import {DashboardStats} from '../models/dashboard-stats';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private apiUrl = `http://localhost:8080/api/v1/admin/dashboard`;

  constructor(private http: HttpClient) {
  }

  getStats(): Observable<ResponseDTO<DashboardStats>> {
    return this.http.get<ResponseDTO<DashboardStats>>(`${this.apiUrl}/stats`);
  }
}
