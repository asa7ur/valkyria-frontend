import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Sponsor} from '../models/sponsor';
import {ResponseDTO} from '../models/response-dto';

@Injectable({
  providedIn: 'root'
})
export class SponsorApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/sponsors';
  public readonly imagesBaseUrl = 'http://localhost:8080/uploads/sponsors';

  getSponsors(page: number = 0, itemsPerPage: number = 10, search: string = ''): Observable<ResponseDTO<Sponsor[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('itemsPerPage', itemsPerPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ResponseDTO<Sponsor[]>>(this.apiUrl, {params});
  }

  getAllSponsors(): Observable<ResponseDTO<Sponsor[]>> {
    return this.http.get<ResponseDTO<Sponsor[]>>(`${this.apiUrl}/all`);
  }

  getSponsorById(id: string): Observable<ResponseDTO<Sponsor>> {
    return this.http.get<ResponseDTO<Sponsor>>(`${this.apiUrl}/${id}`);
  }

  createSponsor(sponsorData: any): Observable<ResponseDTO<Sponsor>> {
    return this.http.post<ResponseDTO<Sponsor>>(this.apiUrl, sponsorData);
  }

  updateSponsor(id: number, sponsorData: any): Observable<ResponseDTO<Sponsor>> {
    return this.http.put<ResponseDTO<Sponsor>>(`${this.apiUrl}/${id}`, sponsorData);
  }

  deleteSponsor(id: number): Observable<ResponseDTO<void>> {
    return this.http.delete<ResponseDTO<void>>(`${this.apiUrl}/${id}`);
  }

  uploadLogo(id: number, file: File): Observable<ResponseDTO<{ fileName: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ResponseDTO<{ fileName: string }>>(`${this.apiUrl}/${id}/logo`, formData);
  }

  deleteLogo(id: number): Observable<ResponseDTO<void>> {
    return this.http.delete<ResponseDTO<void>>(`${this.apiUrl}/${id}/logo`);
  }
}
