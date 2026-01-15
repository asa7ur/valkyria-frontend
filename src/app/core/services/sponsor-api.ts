import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class SponsorApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/sponsors';

  getSponsors(page: number = 0, size: number = 50): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl, {params});
  }
}
