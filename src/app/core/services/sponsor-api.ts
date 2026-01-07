import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Sponsor} from '../models/sponsor';

@Injectable({providedIn: 'root'})
export class SponsorApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/sponsors';

  getSponsors(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.apiUrl);
  }
}
