import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Performance} from '../models/lineup.model';

@Injectable({
  providedIn: 'root'
})
export class LineupService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/performances';

  getLineup(): Observable<Performance[]> {
    return this.http.get<Performance[]>(this.apiUrl);
  }
}
