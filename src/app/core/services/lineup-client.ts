import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {Performance} from '../models/performance';
import {ResponseDTO} from '../models/response-dto';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LineupClient {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/performances`;

  getLineup(): Observable<Performance[]> {
    return this.http.get<ResponseDTO<Performance[]>>(`${this.apiUrl}/all`).pipe(
      map(response => response.data)
    );
  }
}
