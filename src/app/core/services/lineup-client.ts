import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {Performance} from '../models/performance';
import {ResponseDTO} from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class LineupClient {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/performances';

  getLineup(): Observable<Performance[]> {
    return this.http.get<ResponseDTO<Performance[]>>(`${this.apiUrl}/all`).pipe(
      map(response => response.data)
    );
  }
}
